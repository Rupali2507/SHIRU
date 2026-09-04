import { createOrderService } from "../../services/orderService.js";

export const createOrder = async ({
  userId,
  items,
  shippingAddress,
}) => {
  if (!userId) {
    throw new Error("User authentication is required");
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error("At least one product is required");
  }

  const result = await createOrderService({
    userId,
    items,
    shippingAddress,
  });

  return result;
};