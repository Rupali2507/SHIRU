const API_URL = import.meta.env.VITE_API_URL;

const authHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// ======================================
// CREATE ORDER
// items: [{ productId, quantity, selectedSize, selectedColor }]
// ======================================

export const createOrder = async (items, shippingAddress) => {
  const response = await fetch(`${API_URL}/api/orders`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      items,
      shippingAddress,
    }),
  });

  const responseText = await response.text();

  let data;

  try {
    data = JSON.parse(responseText);
  } catch (error) {
    throw new Error(`Backend returned invalid JSON: ${responseText}`);
  }

  if (!response.ok) {
    throw new Error(data.message || "Unable to create order");
  }

  return data;
};

// ======================================
// OPEN RAZORPAY CHECKOUT
// ======================================

export const openRazorpayCheckout = (orderData, prefill = {}) => {
  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error("Razorpay SDK not loaded"));
      return;
    }

    const options = {
      key: orderData.razorpay.keyId,
      amount: orderData.razorpay.amount,
      currency: orderData.razorpay.currency,
      name: "SHIRU",
      description: "AI Buyer Purchase",
      order_id: orderData.razorpay.orderId,

      prefill,

      theme: {
        color: "#000000",
      },

      handler: async function (response) {
        try {
          const verifyResponse = await fetch(
            `${API_URL}/api/orders/verify-payment`,
            {
              method: "POST",
              headers: authHeaders(),
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            }
          );

          const result = await verifyResponse.json();

          if (!verifyResponse.ok) {
            reject(new Error(result.message || "Payment verification failed"));
            return;
          }

          resolve(result);
        } catch (error) {
          reject(error);
        }
      },

      modal: {
        ondismiss: function () {
          reject(new Error("Payment cancelled by user"));
        },
      },
    };

    const razorpay = new window.Razorpay(options);

    razorpay.on("payment.failed", function (response) {
      reject(new Error(response.error?.description || "Payment failed"));
    });

    razorpay.open();
  });
};

// ======================================
// GET MY ORDERS (customer)
// ======================================

export const getMyOrders = async () => {
  const response = await fetch(`${API_URL}/api/orders/my-orders`, {
    headers: authHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to fetch orders");
  }

  return data.orders;
};

// ======================================
// GET SINGLE ORDER
// ======================================

export const getOrderById = async (id) => {
  const response = await fetch(`${API_URL}/api/orders/${id}`, {
    headers: authHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to fetch order");
  }

  return data.order;
};

// ======================================
// GET MERCHANT ORDERS
// ======================================

export const getMerchantOrders = async () => {
  const response = await fetch(`${API_URL}/api/orders/merchant`, {
    headers: authHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to fetch merchant orders");
  }

  return data.orders;
};

// ======================================
// UPDATE ORDER STATUS (merchant)
// ======================================

export const updateOrderStatus = async (id, status) => {
  const response = await fetch(`${API_URL}/api/orders/${id}/status`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to update order status");
  }

  return data.order;
};
