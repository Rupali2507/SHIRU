# SHIRU — AI Buyer & Agentic Commerce Platform

SHIRU is an AI-powered personal shopping assistant that connects AI buyers with AI-transactable merchants, enabling conversational discovery, intelligent recommendations, bounded purchasing, and seamless Razorpay checkout.

## 🚀 Overview

SHIRU is built around the idea that shopping should move from manually browsing stores to simply telling an AI what you want.

Instead of searching through hundreds of products, users can describe their requirements naturally:

> "Find me comfortable black running shoes under ₹4,000."

SHIRU understands the request, searches AI-readable merchant catalogs, compares suitable products, recommends the best option, and can initiate a purchase through Razorpay after explicit user confirmation.

At the same time, SHIRU gives merchants the ability to make their products AI-transactable by providing structured product information that AI agents can understand and act upon.

**The platform has two sides:**

- **AI Buyer:** Conversational shopping, Voice + text interaction, Product discovery, Product comparison, Recommendations, Upselling / cross-selling, Bounded purchasing, Razorpay checkout.
- **AI-Transactable Merchant:** Merchant registration, Store creation, Product management, AI-readable product metadata, Inventory management, Order management, Revenue analytics.

## 🎯 Problem

Traditional e-commerce assumes that the user knows which website to visit, what product to search for, which filters to apply, how to compare products, which option is best, and how to complete checkout. This creates friction for users.

At the same time, merchants are optimized for human browsing, not AI buyers. AI agents need structured information about products, prices, stock, categories, features, use cases, target audiences, and merchants. Without this information, an AI agent cannot reliably discover or purchase products.

SHIRU solves both sides of the problem.

```text
Human User
    ↓
Natural Language / Voice
    ↓
SHIRU AI Buyer
    ↓
AI-readable Product Catalog
    ↓
Recommendation
    ↓
User Confirmation
    ↓
Razorpay Checkout
    ↓
Merchant Order
    ↓
Merchant Dashboard
```

## 💡 Solution

SHIRU acts as an AI shopping layer between customers and merchants. The user does not need to manually navigate multiple product pages; they simply describe what they need.

**Example User Request:**

> "I need black running shoes under ₹4,000 for daily running."

SHIRU can:

1. Understand the requirements.
2. Search available products & filter by budget.
3. Consider product features and use cases.
4. Compare suitable options and recommend the best match.
5. Ask for explicit confirmation.
6. Create the order, open Razorpay checkout, and complete payment.
7. Update the merchant's order dashboard.

## 🤖 AI Buyer

The core of SHIRU is its AI shopping agent. The agent has access to controlled tools instead of directly accessing the database.

- **Product tools:** `searchProducts()`, `getProduct()`, `getRelatedProducts()`
- **Order tools:** `createOrder()`, `getMyOrders()`, `getOrder()`

This gives the AI a controlled interface through which it can interact with the commerce system. The AI never directly manipulates MongoDB.

```text
User Request ➔ Understand Intent ➔ Search Product Catalog ➔ Retrieve Product Details ➔ Compare Products ➔ Recommendation ➔ Explicit User Confirmation ➔ Create Order ➔ Razorpay Checkout ➔ Payment Verification ➔ Order Confirmed
```

## 🗣️ Voice Shopping

SHIRU supports conversational voice interaction. Users can switch between 🎙️ Voice interaction and 💬 Normal text chat. This allows SHIRU to function as a conversational shopping assistant rather than just a search box. Voice interaction uses the browser's speech APIs where supported.

## 🛍️ AI Product Discovery

Merchants provide structured product information, transforming a traditional product catalog into an AI-readable catalog.

```json
{
  "name": "Puma Runner",
  "category": "running shoes",
  "brand": "Puma",
  "price": 3499,
  "currency": "INR",
  "stock": 20,
  "sizes": ["7", "8", "9", "10"],
  "colors": ["Black"],
  "aiMetadata": {
    "useCases": ["daily running", "gym", "walking"],
    "tags": ["comfortable", "lightweight", "running"],
    "features": ["breathable", "cushioned sole"],
    "targetAudience": "daily runners"
  }
}
```

## 🏪 AI-Transactable Merchant

SHIRU helps merchants become AI-transactable. Merchants can register, create a store, add products (with images and AI metadata), manage inventory, receive orders, and track revenue. The merchant's catalog becomes accessible to the AI shopping layer.

## 📈 Merchant Revenue Growth

SHIRU contributes to merchant revenue through:

- **Better Product Discovery:** Connects natural-language intent with relevant products.
- **Personalized Recommendations:** Based on budget, use case, features, and preferences.
- **Upselling:** Recommending a higher-value alternative when appropriate.
- **Cross-selling:** Suggesting related products (e.g., adding running socks).
- **Reduced Purchase Friction:** Conversational checkout reduces steps between intent and purchase.

## 💰 Bounded AI Purchasing

SHIRU does not allow the AI to autonomously spend money without user approval. Before calling `createOrder()`, SHIRU must confirm the product, merchant, price, and quantity, and receive an explicit "Yes" from the user. This makes money actions **Explainable, Bounded, User-approved, and Auditable**.

## 💳 Razorpay Integration

SHIRU integrates Razorpay for payment processing.

**Flow:** AI Recommendation ➔ User Confirmation ➔ SHIRU Order Created ➔ Razorpay Order Created ➔ Razorpay Checkout ➔ Payment ➔ Signature Verification ➔ Payment Validation ➔ Order PAID ➔ Stock Decrement.

## 🔐 Payment Safety

Payment verification is performed on the backend using HMAC SHA-256 for the Razorpay signature.

```text
Frontend (Payment response)
   ↓
Backend
   ├── Verify signature
   ├── Verify Razorpay order
   ├── Verify amount
   ├── Verify currency
   └── Verify captured status
   ↓
Mark Order PAID
```

## 📦 Order Lifecycle

Orders follow controlled states: `PAYMENT_PENDING` ➔ `PAID` ➔ `PROCESSING` ➔ `SHIPPED` ➔ `DELIVERED`. Cancellation is also supported. Invalid state transitions are rejected.

## 🧾 Merchant & 📊 Revenue Dashboards

Merchants can see orders associated with their store, providing visibility into customer orders, products purchased, order amount, and status. The revenue dashboard provides metrics like Total Revenue, Paid Orders, and Average Order Value, creating a feedback loop from AI discovery to merchant analytics.

## 🧩 Architecture

```text
                         ┌─────────────────────┐
                         │       USER          │
                         │   Voice / Text      │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │       SHIRU         │
                         │     AI Buyer        │
                         └──────────┬──────────┘
                                    │
                         AI Tool Layer
                                    │
             ┌──────────────────────┼──────────────────────┐
             │                      │                      │
             ▼                      ▼                      ▼
      Product Tools            Order Tools          Recommendation
             │                      │                      │
             └──────────────────────┼──────────────────────┘
                                    │
                                    ▼
                              Backend API
                                    │
                  ┌─────────────────┼─────────────────┐
                  │                 │                 │
                  ▼                 ▼                 ▼
              MongoDB          Razorpay          Cloudinary
                  │                 │                 │
                  └─────────────────┼─────────────────┘
                                    │
                                    ▼
                           Merchant Dashboard
```

## 🏗️ Technical Architecture

- **Frontend:** React, Vite, Tailwind CSS, React Router, Web Speech API
- **Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT
- **AI:** Groq (Primary), Gemini (Fallback), Deterministic Catalog Fallback, Tool Calling
- **Payments:** Razorpay
- **Images:** Cloudinary, Multer

## 🧠 AI Provider Architecture

SHIRU uses a resilient AI architecture:

```text
             User Request
                  │
                  ▼
              Groq AI
                  │
           ┌──────┴──────┐
           │             │
       Success         Failure
           │             │
           │             ▼
           │          Gemini
           │             │
           │        ┌────┴────┐
           │        │         │
           │      Success   Failure
           │        │         │
           └────────┘         ▼
                       Deterministic
                       Catalog Search
```

## 🛡️ Failure Handling

- **AI Provider Failure:** Degrades gracefully from Groq ➔ Gemini ➔ Deterministic Search.
- **Payment Failure:** Order remains `PAYMENT_PENDING`. User can retry.
- **Invalid Payment:** Rejected at backend verification; order remains unpaid.
- **Out-of-Stock:** Backend validates stock before order creation. AI recommends an alternative if stock is insufficient.

## 🔒 Security Principles

- **Authentication:** JWT-based.
- **Authorization:** Role-based (e.g., `MERCHANT` role required for merchant APIs).
- **AI Tool Boundary:** AI cannot access MongoDB directly, only via controlled tools.
- **Payment Confirmation:** Explicit user confirmation required.
- **Backend Validation:** Prices, stock, and payment info validated server-side.

## 📁 Project Structure

```text
SHIRU/
├── backend/
│   ├── ai/ (agent.js, llm/, fallback/, tools/)
│   ├── config/ (cloudinary.js, connectDB.js, razorpay.js)
│   ├── controllers/
│   ├── middleware/
│   ├── models/ (User, Merchant, Product, Order)
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── server.js
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/ (Home, Dashboard, AIChat, etc.)
    │   ├── services/
    │   └── App.jsx
    └── package.json
```

## 🔌 API Routes

- **Authentication:** `POST /api/auth/signup`, `POST /api/auth/signin`, etc.
- **Merchant:** `POST`, `GET`, `PUT /api/merchant`
- **Products:** `GET /api/products`, `GET /api/products/search`, `POST /api/products`, etc.
- **Orders:** `POST /api/orders`, `POST /api/orders/verify-payment`, `PATCH /api/orders/merchant/:id/status`, etc.
- **AI:** `POST /api/ai/chat`

```json
{
  "message": "Find black running shoes under ₹4000",
  "history": [],
  "productContext": []
}
```

## 🔄 Complete Shopping Flow

1. User enters SHIRU (`/app`) and clicks **Ask SHIRU**.
2. Conversational interface opens.
3. User gives requirements (voice or text).
4. AI searches catalog (`searchProducts()`).
5. SHIRU evaluates matching products based on specs and availability.
6. SHIRU recommends the best option.
7. User asks to purchase.
8. SHIRU confirms transaction details with the user.
9. User confirms ("Yes").
10. Backend creates Razorpay order.
11. User completes payment via Razorpay.
12. Backend verifies payment details and signatures.
13. Order confirmed (`PAID`), stock decremented.
14. Merchant sees the new order in their dashboard.

## 🛒 Example AI Conversation

> **User:** I need black running shoes under ₹4000.
>
> **SHIRU:** I found 2 options that match your requirements... I'd recommend the Puma Runner for your requirements.
>
> **User:** Buy it.
>
> **SHIRU:** You're about to purchase Puma Runner from UrbanStep for ₹3,499. Shall I proceed?
>
> **User:** Yes.
>
> **SHIRU:** Creating your order and opening secure checkout...

## 🌟 Key Features

| Feature | Description |
|---|---|
| 🤖 AI Buyer | Conversational shopping agent |
| 🎙️ Voice Shopping | Voice-based product discovery |
| 💬 Text Chat | Traditional conversational interface |
| 🔎 AI Search | Natural-language product search |
| 🧠 Recommendations | Context-aware product recommendations |
| ⬆️ Upselling | Suggest higher-value alternatives |
| ➕ Cross-selling | Suggest complementary products |
| 🏪 AI Merchant | Makes merchant catalogs AI-readable |
| 📦 Inventory | Product stock management |
| 💳 Razorpay | Secure payment integration |
| 📊 Analytics | Merchant revenue/order visibility |
| 🔐 Confirmation | Explicit approval before money actions |
| 🛡️ Fallback | Groq ➔ Gemini ➔ deterministic search |
| ☁️ Cloudinary | Product image storage |

## ⚙️ Environment Variables

Create a `.env` file inside the `backend` folder:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
```

## 🚀 Installation

**1. Clone the repository**

```bash
git clone <repository-url>
cd SHIRU
```

**2. Install dependencies & configure env**

```bash
cd backend
npm install
# Create .env here based on the above configuration

cd ../frontend
npm install
```

**3. Start the servers**

```bash
# Terminal 1: Start Backend (Runs on http://localhost:5000)
cd backend
npm run dev

# Terminal 2: Start Frontend
cd frontend
npm run dev
```

## 🔐 Design Principles

SHIRU follows five core principles for agentic commerce:

1. **Explainable:** The user knows what is being bought, from whom, and for how much.
2. **Bounded:** The AI cannot freely spend money.
3. **Gated:** A purchase requires explicit user confirmation.
4. **Auditable:** Commerce actions can be traced through the order lifecycle.
5. **Resilient:** AI provider failures do not completely break product discovery.

## 🏆 Why SHIRU?

Traditional commerce forces users to manually search, filter, compare, and navigate checkout. SHIRU changes the interaction model from "I browse a store" to "I tell an AI what I want."

## 🔮 Vision

The future of commerce may not begin with opening a website. It may begin with: *"SHIRU, I need a good pair of running shoes for my daily workouts."*

```text
                 HUMAN INTENT
                      │
                      ▼
                ┌───────────┐
                │   SHIRU   │
                │ AI BUYER  │
                └─────┬─────┘
                      │
             Understand + Decide
                      │
                      ▼
             AI-READABLE CATALOG
                      │
                      ▼
                  MERCHANT
                      │
                      ▼
                 TRANSACTION
                      │
                      ▼
                  RAZORPAY
                      │
                      ▼
                  REVENUE
```

## 🛡️ Hackathon Focus

SHIRU directly addresses the AI Growth & Agentic Commerce challenge by making merchants discoverable, understandable, and transactable by AI buyers — while keeping every money action explainable, bounded, and explicitly approved.

---

❤️ **Built with:** React, Vite, Tailwind CSS, Node.js, Express.js, MongoDB, Mongoose, Groq, Gemini, Razorpay, Cloudinary, JWT, Web Speech API.

> Tell SHIRU what you want. Let AI handle the shopping.