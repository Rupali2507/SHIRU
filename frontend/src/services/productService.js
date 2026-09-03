const API_URL = "http://localhost:5000";

const authHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const handle = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

// ======================================
// PUBLIC
// ======================================

export const getProducts = async () => {
  const response = await fetch(`${API_URL}/api/products`);
  const data = await handle(response);
  return data.products;
};

export const searchProducts = async (params = {}) => {
  const query = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
    )
  ).toString();

  const response = await fetch(`${API_URL}/api/products/search?${query}`);
  const data = await handle(response);
  return data.products;
};

export const getProductById = async (id) => {
  const response = await fetch(`${API_URL}/api/products/${id}`);
  const data = await handle(response);
  return data.product;
};

// ======================================
// MERCHANT
// ======================================

export const getMerchantProducts = async () => {
  const response = await fetch(`${API_URL}/api/products/merchant`, {
    headers: authHeaders(),
  });
  const data = await handle(response);
  return data.products;
};

export const createProduct = async (payload) => {
  const response = await fetch(`${API_URL}/api/products`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await handle(response);
  return data.product;
};

export const updateProduct = async (id, payload) => {
  const response = await fetch(`${API_URL}/api/products/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await handle(response);
  return data.product;
};

export const deleteProduct = async (id) => {
  const response = await fetch(`${API_URL}/api/products/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handle(response);
};
