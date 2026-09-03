import React, { useState } from "react";

import {
  createOrder,
  openRazorpayCheckout,
} from "../services/orderService";

const TestCheckout = () => {

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");


  const productId =
    "6a8ef23b9399ad80256bf3a7";


  const handleBuy = async () => {

    try {

      setLoading(true);
      setMessage("Creating order...");


      // 1. Create SHIRU order

      const orderData = await createOrder(
        [
          {
            productId,
            quantity: 1,
            selectedSize: "9",
            selectedColor: "Black",
          },
        ],
        {
          name: "Rupali",
          phone: "9999999999",
          addressLine1: "Demo Address",
          city: "Patna",
          state: "Bihar",
          postalCode: "800001",
          country: "India",
        }
      );


      setMessage(
        "Opening Razorpay..."
      );


      // 2. Open Razorpay

      const result =
        await openRazorpayCheckout(
          orderData
        );


      // 3. Payment verified

      setMessage(
        `Payment successful! Order: ${result.order.id}`
      );


    } catch (error) {

      console.error(error);

      setMessage(
        error.message ||
        "Something went wrong"
      );

    } finally {

      setLoading(false);

    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">

      <div className="w-[350px] rounded-2xl border border-white/10 bg-[#0b0b0b] p-8">

        <div className="mb-6">

          <p className="text-xs text-white/40">
            SHIRU TEST CHECKOUT
          </p>

          <h1 className="mt-2 text-xl">
            Puma Runner
          </h1>

          <p className="mt-2 text-sm text-white/50">
            ₹3,499
          </p>

        </div>


        <button
          onClick={handleBuy}
          disabled={loading}
          className="
            w-full
            rounded-lg
            bg-white
            px-4
            py-3
            text-sm
            font-medium
            text-black
            transition
            hover:bg-white/90
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {loading
            ? "Processing..."
            : "Buy with Razorpay"}
        </button>


        {message && (
          <p className="mt-5 text-center text-xs text-white/50">
            {message}
          </p>
        )}

      </div>

    </div>
  );
};

export default TestCheckout;