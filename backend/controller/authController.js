import bcrypt from "bcryptjs";
import User from "../models/user.js";
import jwt from "jsonwebtoken"
import crypto from "crypto";
import transporter from "../config/mailer.js";


export const signup = async (req, res) => {
  try {

    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required"
      });
    }


   

    const userRole = role || "USER";

    if (!["USER", "MERCHANT"].includes(userRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role"
      });
    }


   

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists"
      });
    }


   

    const hashedPassword = await bcrypt.hash(password, 10);


   

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: userRole
    });



    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {

    console.error("Signup error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};
export const login = async (req, res) => {
  try {

    const { email, password } = req.body;


    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }


    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }


   

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }


  

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );



    return res.status(200).json({
      success: true,
      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {

    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// ======================================
// FORGOT PASSWORD
// ======================================

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    /*
      Don't reveal whether the email exists.
      This prevents account enumeration.
    */

    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });
    }

    // Generate random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Store HASH of token in database
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;

    // Token valid for 15 minutes
    user.resetPasswordExpires = new Date(
      Date.now() + 15 * 60 * 1000
    );

    await user.save();

    // Reset link
    const resetUrl =
      `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Send email
    await transporter.sendMail({
      from: `"SHIRU" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: "Reset your SHIRU password",

      text: `
Hello ${user.name},

We received a request to reset your SHIRU password.

Click the link below to create a new password:

${resetUrl}

This link will expire in 15 minutes.

If you did not request a password reset, you can safely ignore this email.

— SHIRU
      `,

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 520px;
          margin: auto;
          padding: 40px;
          background: #0b0b0b;
          color: white;
          border-radius: 16px;
        ">

          <h1 style="font-size: 24px;">
            Reset your SHIRU password
          </h1>

          <p style="color: #aaa;">
            Hello ${user.name},
          </p>

          <p style="color: #aaa;">
            We received a request to reset your SHIRU password.
          </p>

          <a
            href="${resetUrl}"
            style="
              display: inline-block;
              margin-top: 20px;
              padding: 12px 20px;
              background: white;
              color: black;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
            "
          >
            Reset Password
          </a>

          <p style="
            margin-top: 25px;
            color: #777;
            font-size: 13px;
          ">
            This link expires in 15 minutes.
          </p>

          <p style="
            color: #777;
            font-size: 13px;
          ">
            If you didn't request this, you can safely ignore this email.
          </p>

        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message:
        "If an account exists with this email, a password reset link has been sent.",
    });

  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process password reset request",
    });
  }
};

// ======================================
// RESET PASSWORD
// ======================================

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirm password are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Hash token received from URL
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: {
        $gt: new Date(),
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset link is invalid or expired",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    // Invalidate reset token
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });

  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reset password",
    });
  }
};