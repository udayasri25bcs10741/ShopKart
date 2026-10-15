# 🛍️ ShopKart — Full-Stack E-Commerce Platform

A production-grade, full-stack MERN e-commerce application developed across **Engineering Labs 01–06**. ShopKart features secure customer authentication via HttpOnly cookies, dynamic product discovery with server-side filtering, persistent MongoDB wishlists, global shopping cart state synchronization, and complete checkout with Razorpay test payment signature verification.

---

## 🌟 Key Features

### 1. 🔐 Customer Authentication & Security (Labs 01 & 02)
- **User Registration & Login**: Validated email, phone number, and bcrypt salted password hashing ($cost=10$).
- **HttpOnly Cookie JWT Authentication**: JSON Web Tokens stored inside secure, `HttpOnly` cookies to prevent Cross-Site Scripting (XSS) attacks.
- **Protected Profile & Session API**: Authenticated via `/customers/me` on application boot with `withCredentials: true`.
- **Change Password**: In-app secure password update requiring verification of current password.

### 2. 📱 Product Catalog & Discovery (Lab 03)
- **Dynamic Catalog**: Categorized products (Electronics, Fashion, Books, Home) loaded dynamically from MongoDB.
- **Server-Side Search & Filter**: Real-time keyword search, category filtering, and price sorting (`price_asc`, `price_desc`).
- **Product Details View**: Dedicated detail page with quantity controls, stock indicators, and high-resolution galleries.

### 3. ❤️ Persistent Wishlist (Lab 04)
- **Relational Referencing**: Wishlist stores clean `ObjectId` references to the `Product` collection using Mongoose `populate()`.
- **Duplicate Prevention**: Rejects duplicate entries with `409 Conflict`.
- **Interactive UI**: One-click heart toggle on product cards, animated loading states, and live navbar badge count.

### 4. 🛒 Global Shopping Cart (Lab 05)
- **State Synchronization**: Unified `CartContext` ensuring the Navbar badge, Product Cards, Cart Page, and Order Summary reflect the exact same state without full-page reloads.
- **Quantity Controls & Stock Validation**: Step controls with live boundary enforcement against available warehouse stock.
- **Derived Totals**: Dynamic client-side subtotal and item count calculations avoiding stale database data.

### 5. 💳 Checkout, Orders & Razorpay Integration (Lab 06)
- **Checkout Address Validation**: Comprehensive client-side and server-side validation (including strict 6-digit Indian pincode format).
- **Server-Side Total Calculation**: Re-validates live database product prices and stock right before order creation (ignoring any manipulated client totals).
- **Razorpay Test Mode Integration**:
  - Secure backend Razorpay Order generation in paise ($\text{INR} \times 100$).
  - Frontend standard modal checkout.
  - **Mandatory HMAC-SHA256 Signature Verification** using `crypto` before marking orders as `PAID`.
  - Atomically reduces inventory stock and clears cart upon successful payment confirmation.
- **Order History & Purchase Snapshots**: Preserves immutable snapshots of product name, purchase price, quantity, and image at the time of order placement.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide React, Axios, React Router DOM v7
- **Backend**: Node.js (ES Modules `type: module`), Express.js, Mongoose, JSONWebToken, Bcrypt.js, Cookie-Parser, CORS, Razorpay SDK
- **Database**: MongoDB Atlas (with in-memory fallback for local offline testing)

---

## 📂 Project Architecture

```
ShopKart/
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB connection & Razorpay client
│   │   ├── controllers/     # Customer, Product, Wishlist, Cart & Order controllers
│   │   ├── middlewares/     # JWT authentication gatekeeper
│   │   ├── models/          # Customer, Product, and Order Mongoose schemas
│   │   ├── routes/          # Express route declarations
│   │   ├── utils/           # JWT token generator
│   │   └── index.js         # Server entry point & CORS configuration
│   ├── scripts/
│   │   ├── seed.js          # Default catalog seeding script
│   │   └── test-api.js      # 50-test automated API test suite (Labs 01-06)
│   ├── .env.example         # Template for environment configuration
│   ├── .gitignore           # Excludes .env and node_modules
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, ProductCard, Skeleton, ProtectedRoute
│   │   ├── context/         # AuthContext, CartContext, WishlistContext
│   │   ├── pages/           # Home, Products, Wishlist, Cart, Checkout, Orders, Login, Register
│   │   ├── services/        # Axios client with withCredentials: true
│   │   ├── App.jsx          # Route declarations & context providers
│   │   └── main.jsx
│   ├── .gitignore           # Excludes dist, node_modules, and .env
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore               # Root gitignore protecting secrets and build artifacts
└── README.md
```

---

## 🚀 Setup & Local Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas connection URI)

---

### Step 1: Clone the Repository
```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd ShopKart
```

---

### Step 2: Backend Configuration

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` file from the provided `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Configure the environment variables inside `backend/.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/shopkart
   JWT_SECRET=your_super_secret_jwt_key
   CLIENT_URL=http://localhost:5173
   NODE_ENV=development

   # Razorpay Test Mode Credentials
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxx
   RAZORPAY_KEY_SECRET=your_razorpay_test_secret
   ```

5. (Optional) Seed the catalog with 12 high-grade sample products:
   ```bash
   npm run seed
   ```

6. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend will run on `http://localhost:5000`.*

---

### Step 3: Frontend Configuration

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The application will open on `http://localhost:5173`.*

---

## 🧪 Automated Testing

ShopKart includes a complete test runner covering all requirements from Labs 01 to 06:
```bash
cd backend
npm run test:api
```

### Verified Test Suite Summary (50 / 50 Passed):
- ✅ Customer Registration (validation, unique email check, password hashing)
- ✅ Customer Login & HttpOnly cookie issuance
- ✅ Authenticated Profile Access (`GET /customers/me`)
- ✅ Product Catalog fetching, keyword search, category filtering, and sorting
- ✅ Wishlist CRUD, population, and duplicate prevention (`409 Conflict`)
- ✅ Cart management, quantity boundaries, and stock limits
- ✅ Address validation (6-digit pincode check)
- ✅ Order creation and conversion to paise for Razorpay
- ✅ Tampered amount rejection & HMAC-SHA256 signature verification
- ✅ Cart clearance post-payment confirmation
- ✅ Order history retrieval with ownership enforcement

---

## 🔒 Security Best Practices Implemented

1. **No Sensitive Information Committed**: All `.env` and credential files are strictly ignored via `.gitignore`.
2. **Untrusted Client Inputs**: Order prices and totals are strictly calculated server-side from live database documents.
3. **Cryptographic Signature Verification**: Payments are only confirmed after server-side HMAC-SHA256 verification of the Razorpay signature against the database order ID.
4. **Ownership Enforcement**: Users cannot access or modify wishlists, carts, or order history belonging to other customer IDs.

---

## 📜 License
This project is built for academic and laboratory assessment for the ShopKart Full-Stack Engineering Course.
