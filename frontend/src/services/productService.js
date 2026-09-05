const API_URL = import.meta.env.VITE_API_URL;

// ======================================
// AUTH HEADERS
// ======================================

const authHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
  };
};

const jsonAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// ======================================
// RESPONSE HANDLER
// ======================================

const handle = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Something went wrong"
    );
  }

  return data;
};

// ======================================
// PUBLIC
// ======================================

export const getProducts = async () => {
  const response = await fetch(
    `${API_URL}/api/products`
  );

  const data = await handle(response);

  return data.products;
};

export const searchProducts = async (params = {}) => {
  const query = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(
        ([, value]) =>
          value !== undefined && value !== ""
      )
    )
  ).toString();

  const response = await fetch(
    `${API_URL}/api/products/search?${query}`
  );

  const data = await handle(response);

  return data.products;
};

export const getProductById = async (id) => {
  const response = await fetch(
    `${API_URL}/api/products/${id}`
  );

  const data = await handle(response);

  return data.product;
};

// ======================================
// MERCHANT
// ======================================

export const getMerchantProducts = async () => {
  const response = await fetch(
    `${API_URL}/api/products/merchant`,
    {
      headers: authHeaders(),
    }
  );

  const data = await handle(response);

  return data.products;
};

// ======================================
// CREATE PRODUCT
// ======================================

export const createProduct = async (formData) => {
  const response = await fetch(
    `${API_URL}/api/products`,
    {
      method: "POST",
      headers: authHeaders(),
      body: formData,
    }
  );

  const data = await handle(response);

  return data.product;
};

// ======================================
// UPDATE PRODUCT
// ======================================

export const updateProduct = async (
  id,
  formData
) => {
  const response = await fetch(
    `${API_URL}/api/products/${id}`,
    {
      method: "PUT",
      headers: authHeaders(),
      body: formData,
    }
  );

  const data = await handle(response);

  return data.product;
};

// ======================================
// DELETE PRODUCT
// ======================================

export const deleteProduct = async (id) => {
  const response = await fetch(
    `${API_URL}/api/products/${id}`,
    {
      method: "DELETE",
      headers: jsonAuthHeaders(),
    }
  );

  return handle(response);
};