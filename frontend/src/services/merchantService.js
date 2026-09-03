const API_URL = "http://localhost:5000";

const authHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// ======================================
// GET MY MERCHANT PROFILE
// ======================================

export const getMerchantProfile = async () => {
  const response = await fetch(`${API_URL}/api/merchant/me`, {
    headers: authHeaders(),
  });

  if (response.status === 404) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to fetch merchant profile");
  }

  return data.merchant;
};

// ======================================
// CREATE MERCHANT STORE
// ======================================

export const createMerchant = async (payload) => {
  const response = await fetch(`${API_URL}/api/merchant`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to create merchant store");
  }

  return data.merchant;
};
