const API_URL = "http://localhost:5000/api";

export const chatWithAI = async ({
  message,
  history = [],
  productContext = [],
}) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please login first");
  }

  const response = await fetch(`${API_URL}/ai/chat`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify({
      message,
      history,
      productContext,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "AI request failed");
  }

  return data;
};