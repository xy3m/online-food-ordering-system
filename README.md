# 🍔 Online Food Ordering System (OFOS)

[![Vercel Deployment](https://img.shields.io/badge/Deployment-Vercel%20Serverless-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)
[![React 18](https://img.shields.io/badge/Frontend-React%2018%20%7C%20TypeScript%20%7C%20Tailwind-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js Express](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express%20%7C%20MongoDB-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Status](https://img.shields.io/badge/Portfolio-Fiverr%20Client%20Ready-50C878?style=for-the-badge)](https://github.com/xy3m/online-food-ordering-system)

> **Industry-Grade Multi-Role Food Ordering & Delivery Ecosystem with Real-Time Kitchen Dispatch, GPS Rider Map Tracking, and Automated Multi-State Order Lifecycles.**

---

## ⚡ 1-Click Live Demo Personas

The platform comes pre-hydrated with realistic Bangladeshi restaurant menus, live active orders, and instant 1-Click authentication cards on the **[Login Page](/login)** and a top **Demo Switcher Bar** on every screen:

| Role | Persona / Store | Demo Email | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| 👑 **System Admin** | System Admin | `admin@ofos.com` | `admin123` | Platform Revenue Analytics, Restaurant Verification & Approval, User Directory, Order Audit Ledger |
| 👨‍🍳 **Restaurant Staff** | Karim Uddin (*Kacchi House*) | `karim@kacchihouse.com` | `admin123` | Live Kitchen Orders Dispatch Queue, Menu Management, Price & Availability Editor, Store Hours |
| 🍔 **Customer (Foodie)** | Tanvir Hasan | `tanvir@gmail.com` | `admin123` | Multi-Restaurant Menus, Live Cart, bKash / Card / COD Checkout, GPS Rider Map Tracking, 1-Click Reorder |

---

## 🌟 Key Features

1. **Multi-Role Role-Based Access Control (RBAC)**: Distinct permissions and bespoke dashboards for System Admins, Restaurant Kitchen Staff, and Customers.
2. **Pre-Hydrated Demo Ecosystem**: 5 verified restaurants (*Kacchi House, Sultan's Dine, Pizza Hut, Burger King, Chillox*) with 20+ dishes, prices, descriptions, and high-res food photography.
3. **Real-Time Kitchen Dispatch & Order Lifecycle**: Unidirectional order state progression (`PLACED` ➔ `CONFIRMED` ➔ `PREPARING` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`).
4. **Interactive Leaflet GPS Rider Tracking**: Dynamic live map showing restaurant, delivery destination, and delivery ETA calculations.
5. **Multi-Strategy Checkout**: Simulated bKash, Credit Card, and Cash On Delivery payment handling with instant receipts and order history.
6. **1-Click Reorder & Customer Reviews**: Instant re-add to cart for past favorite orders and star-rating review submission.
7. **Glassmorphism Dark UI**: Ultra-modern, responsive interface styled with Tailwind CSS, Framer Motion transitions, and Lucide icons.

---

## 🏗️ Architecture & Tech Stack

```
online-food-ordering-system/
├── api/                     # Vercel Serverless Function Backend (Node/Express)
│   ├── index.js             # Route Handlers (/api/v1/auth, /restaurants, /orders, etc.)
│   ├── db.js                # Cached MongoDB Connection Pool with Connection Guard
│   └── seedHelper.js        # Realistic Pre-Hydrated Multi-Role Seed Engine
├── frontend/                # React 18 SPA (Vite + TypeScript + Tailwind CSS)
│   ├── src/
│   │   ├── components/      # Navbar (with Demo Switcher), Cart, MapPicker, MenuEditor
│   │   ├── pages/           # Home, Login (1-Click Cards), Admin, Staff, Orders, Menu
│   │   ├── services/        # api.ts (Token Interceptor) & demoStore.ts (Mock Store)
│   │   └── context/         # AuthContext & CartContext
├── package.json             # Root Monorepo Scripts & Backend Dependencies
└── vercel.json              # Full-Stack Vercel Serverless Routing Specification
```

---

## 🚀 1-Click Vercel Deployment Guide

### Deploy directly via Vercel Dashboard:
1. Push this repository to your GitHub account (`origin main`).
2. Go to **[vercel.com](https://vercel.com)** ➔ **Add New Project** ➔ Import `online-food-ordering-system`.
3. Set **Framework Preset** to `Vite`.
4. Add the following Environment Variables (Optional - system works 100% out of the box with embedded demo engine):
   - `JWT_SECRET` = `ofos_production_secret_key_2026`
   - `MONGO_URI` = `mongodb+srv://...` (Your MongoDB Atlas connection string)
5. Click **Deploy**. Vercel will automatically compile the frontend and deploy the serverless functions!

---

## 💻 Local Development

```bash
# 1. Install root & frontend dependencies
npm install
npm --prefix frontend install

# 2. Start Frontend & Backend
npm run client   # Starts Vite dev server on http://localhost:5173
npm run server   # Starts Node.js API on http://localhost:8080
```

---

## 📄 License
This project is licensed under the ISC License.
