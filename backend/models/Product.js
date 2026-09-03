import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    merchant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Merchant",
      required: true,
      index: true,
    },


    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    brand: {
      type: String,
      default: "",
      trim: true,
    },

   

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

   

    sizes: {
      type: [String],
      default: [],
    },

    colors: {
      type: [String],
      default: [],
    },

 

    images: {
      type: [String],
      default: [],
    },

   

    aiMetadata: {
      useCases: {
        type: [String],
        default: [],
      },

      tags: {
        type: [String],
        default: [],
      },

      features: {
        type: [String],
        default: [],
      },

      targetAudience: {
        type: String,
        default: "",
      },

      searchText: {
        type: String,
        default: "",
      },
    },

 

    aiEnabled: {
      type: Boolean,
      default: true,
    },

  

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },

  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;