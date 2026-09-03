import Merchant from "../models/Merchant.js";
import User from "../models/user.js";




export const createMerchant = async (req, res) => {
  try {

    const userId = req.user.userId;

    const {
      storeName,
      description,
      website,
      logo,
    } = req.body;



    if (!storeName) {
      return res.status(400).json({
        success: false,
        message: "Store name is required",
      });
    }


   

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }


    if (user.role !== "MERCHANT") {
      return res.status(403).json({
        success: false,
        message: "Only merchants can create a store",
      });
    }



    const existingMerchant = await Merchant.findOne({
      owner: userId,
    });

    if (existingMerchant) {
      return res.status(409).json({
        success: false,
        message: "Merchant store already exists",
      });
    }



    const merchant = await Merchant.create({
      owner: userId,
      storeName,
      description,
      website,
      logo,
    });


    return res.status(201).json({
      success: true,
      message: "Merchant store created successfully",

      merchant: {
        id: merchant._id,
        storeName: merchant.storeName,
        description: merchant.description,
        website: merchant.website,
        logo: merchant.logo,
        currency: merchant.currency,
        status: merchant.status,
        aiEnabled: merchant.aiEnabled,
      },
    });

  } catch (error) {

    console.error("Create merchant error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



export const getMerchantProfile = async (req, res) => {
  try {

    const userId = req.user.userId;

    const merchant = await Merchant.findOne({
      owner: userId,
    });

    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: "Merchant store not found",
      });
    }


    return res.status(200).json({
      success: true,
      merchant,
    });

  } catch (error) {

    console.error("Get merchant error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};