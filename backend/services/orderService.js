import Order from "../models/Order.js";
import Product from "../models/Product.js";
import razorpay from "../config/razorpay.js";

export const createOrderService = async ({
  userId,
  items,
  shippingAddress,
}) => {
  // -----------------------------------
  // Validate items
  // -----------------------------------

  if (
    !items ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    throw new Error(
      "At least one product is required"
    );
  }

  let orderItems = [];
  let subtotal = 0;
  let merchantId = null;

  // -----------------------------------
  // Validate every product
  // -----------------------------------

  for (const item of items) {
    if (!item.productId) {
      throw new Error(
        "Product ID is required"
      );
    }

    if (
      !Number.isInteger(item.quantity) ||
      item.quantity < 1
    ) {
      throw new Error(
        "Quantity must be at least 1"
      );
    }

    const product =
      await Product.findOne({
        _id: item.productId,
        status: "ACTIVE",
        aiEnabled: true,
      });

    if (!product) {
      throw new Error(
        `Product not found: ${item.productId}`
      );
    }

    // --------------------------------
    // Stock check
    // --------------------------------

    if (product.stock < item.quantity) {
      throw new Error(
        `${product.name} does not have enough stock`
      );
    }

    // --------------------------------
    // Merchant consistency
    // --------------------------------

    if (!merchantId) {
      merchantId = product.merchant;
    }

    if (
      product.merchant.toString() !==
      merchantId.toString()
    ) {
      throw new Error(
        "All products in one order must belong to the same merchant"
      );
    }

    // --------------------------------
    // Validate size
    // --------------------------------

    if (
      item.selectedSize &&
      product.sizes.length > 0 &&
      !product.sizes.includes(
        item.selectedSize
      )
    ) {
      throw new Error(
        `${product.name} does not have size ${item.selectedSize}`
      );
    }

    // --------------------------------
    // Validate color
    // --------------------------------

    if (
      item.selectedColor &&
      product.colors.length > 0 &&
      !product.colors.includes(
        item.selectedColor
      )
    ) {
      throw new Error(
        `${product.name} does not have color ${item.selectedColor}`
      );
    }

    // --------------------------------
    // Calculate price from DB
    // --------------------------------

    const itemTotal =
      product.price * item.quantity;

    subtotal += itemTotal;

    orderItems.push({
      product: product._id,
      name: product.name,
      sku: product.sku,
      quantity: item.quantity,
      price: product.price,
      selectedSize:
        item.selectedSize || null,
      selectedColor:
        item.selectedColor || null,
    });
  }

  // -----------------------------------
  // No tax/shipping for now
  // -----------------------------------

  const totalAmount = subtotal;

  // -----------------------------------
  // Create Razorpay order
  // -----------------------------------

  const razorpayOrder =
    await razorpay.orders.create({
      amount: Math.round(
        totalAmount * 100
      ),
      currency: "INR",
      receipt: `shiru_${Date.now()}`,
      notes: {
        userId: userId.toString(),
        merchantId:
          merchantId.toString(),
      },
    });

  // -----------------------------------
  // Create SHIRU order
  // -----------------------------------

  const order = await Order.create({
    user: userId,
    merchant: merchantId,
    items: orderItems,
    subtotal,
    totalAmount,
    currency: "INR",
    status: "PAYMENT_PENDING",
    razorpayOrderId:
      razorpayOrder.id,
    shippingAddress:
      shippingAddress || {},
  });

  return {
    order: {
      id: order._id,
      amount: order.totalAmount,
      currency: order.currency,
      status: order.status,
      razorpayOrderId:
        order.razorpayOrderId,
    },

    razorpay: {
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId:
        process.env.RAZORPAY_KEY_ID,
    },
  };
};