import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    sku: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    selectedSize: {
      type: String,
      default: null,
    },

    selectedColor: {
      type: String,
      default: null,
    },
  },
  {
    _id: false,
  }
);


const orderSchema = new mongoose.Schema(
  {
    // -------------------------
    // Customer
    // -------------------------

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // -------------------------
    // Merchant
    // -------------------------

    merchant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Merchant",
      required: true,
      index: true,
    },

    // -------------------------
    // Products
    // -------------------------

    items: {
      type: [orderItemSchema],
      required: true,
    },

    // -------------------------
    // Money
    // -------------------------

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    // -------------------------
    // Order status
    // -------------------------

    status: {
      type: String,
      enum: [
        "PENDING",
        "PAYMENT_PENDING",
        "PAID",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
      ],
      default: "PENDING",
    },

    // -------------------------
    // Razorpay
    // -------------------------

    razorpayOrderId: {
      type: String,
      default: null,
      index: true,
    },

    razorpayPaymentId: {
      type: String,
      default: null,
    },

    // -------------------------
    // Shipping
    // -------------------------

    shippingAddress: {
      name: {
        type: String,
        default: "",
      },

      phone: {
        type: String,
        default: "",
      },

      addressLine1: {
        type: String,
        default: "",
      },

      addressLine2: {
        type: String,
        default: "",
      },

      city: {
        type: String,
        default: "",
      },

      state: {
        type: String,
        default: "",
      },

      postalCode: {
        type: String,
        default: "",
      },

      country: {
        type: String,
        default: "India",
      },
    },
  },

  {
    timestamps: true,
  }
);


const Order = mongoose.model("Order", orderSchema);

export default Order;