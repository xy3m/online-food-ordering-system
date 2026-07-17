# Online Food Ordering System (OFOS)

A production-ready, industry-grade Online Food Ordering System built with a robust **Java 21 / Spring Boot** backend and a premium **React 18 / Tailwind CSS** frontend.

## 🌟 Key Features

- **Role-Based Access Control**: Distinct dashboards and API permissions for Customers, Restaurant Staff, and System Admins.
- **JWT Authentication**: Stateless, secure authentication featuring automatic Refresh Token rotation.
- **Rich Domain Model**: Strict adherence to Domain-Driven Design (DDD) to prevent Anemic Domain Models (e.g., Cart calculation logic is encapsulated within the Cart entity).
- **Design Patterns in Action**:
  - **State Pattern**: Manages the strict, unidirectional flow of Order Status (`PLACED` → `CONFIRMED` → `PREPARING` → `OUT_FOR_DELIVERY` → `DELIVERED`).
  - **Strategy Pattern**: Dynamically selects between `CreditCardPaymentStrategy` and `BkashPaymentStrategy` for seamless checkout processing.
  - **Factory Pattern**: Generates immutable price snapshots (`OrderItem`) at the exact moment of checkout.
- **Security First**: Comprehensive IDOR (Insecure Direct Object Reference) protection ensuring staff can only modify their own menus, and customers can only view their own orders.
- **Comprehensive User Features**: Fully functional Cart (with quantity editing), One-Click Reorders, Saved Address Books, and a Forgot/Reset Password flow.
- **Smart Delivery & Location**: Integrated GPS mapping using Leaflet.js to pinpoint user and restaurant locations. Calculates delivery ETA automatically based on Haversine distance and menu item preparation times.
- **Robust Order Management**: Dynamic Menu Categories, Restaurant Operating Hours (Open/Closed), and automated Email Notifications (Order Confirmations & Status Updates).
- **Premium Frontend Aesthetics**: Built with Vite, React, Tailwind CSS (Dark Mode default), and Framer Motion for buttery-smooth glassmorphism UI interactions.

## 📸 Screenshots

<img src="screenshots/Screenshot 2026-07-17 161137.png" width="800">
<img src="screenshots/Screenshot 2026-07-17 161220.png" width="800">
<img src="screenshots/Screenshot 2026-07-17 161237.png" width="800">
<img src="screenshots/Screenshot 2026-07-17 161300.png" width="800">
<img src="screenshots/Screenshot 2026-07-17 165830.png" width="800">
<img src="screenshots/Screenshot 2026-07-17 171241.png" width="800">
<img src="screenshots/Screenshot 2026-07-17 171704.png" width="800">
<img src="screenshots/Screenshot 2026-07-17 171749.png" width="800">
<img src="screenshots/Screenshot 2026-07-17 173003.png" width="800">
<img src="screenshots/Screenshot 2026-07-17 174259.png" width="800">
<img src="screenshots/Screenshot 2026-07-17 175737.png" width="800">
<img src="screenshots/Screenshot 2026-07-17 175748.png" width="800">
<img src="screenshots/Screenshot 2026-07-17 175802.png" width="800">
<img src="screenshots/Screenshot 2026-07-17 175825.png" width="800">
<img src="screenshots/Screenshot 2026-07-17 175839.png" width="800">
<img src="screenshots/Screenshot 2026-07-17 175849.png" width="800">

## 🏗️ Tech Stack

### Backend
- Java 21 LTS
- Spring Boot 3.3.6 (Web, Data JPA, Security, Validation)
- MySQL 8.0 (Production) / H2 (Testing)
- Flyway (Database Migrations)
- MapStruct & Lombok
- JUnit 5 & Mockito (Testing)

### Frontend
- React 18 (Vite)
- Tailwind CSS v3
- React Router v6
- Axios (with automated token interception)
- Framer Motion & Lucide React

## 🚀 Getting Started

### Prerequisites
- JDK 21
- Node.js 20+
- Maven 3.9+
- Docker & Docker Compose (Optional for running MySQL locally)

### 1. Start the Backend

First, ensure you have a MySQL database running, or simply let the application spin up using the `dev` profile.

```bash
# Compile and package the application
mvn clean install

# Run the Spring Boot application (Default profile will attempt to connect to MySQL on localhost:3306)
# Make sure to set your SMTP credentials in your environment before running
# NOTE FOR CLONERS: Please create your own App Password for Gmail and use your own credentials!
$env:SMTP_USERNAME="your_email@gmail.com"
$env:SMTP_PASSWORD="your_app_password"
mvn spring-boot:run
```

*Note: The system includes Flyway migrations. Upon the first successful boot, it will automatically generate the database schema and seed a default Admin user (`admin@ofos.com` / `admin123`).*

### 2. Start the Frontend

In a separate terminal, navigate to the `frontend` directory:

```bash
cd frontend

# Install all required npm packages
npm install

# Start the Vite development server
npm run dev
```

The frontend will be accessible at `http://localhost:5173`.

## 🧪 Testing

The backend includes a comprehensive test suite combining JUnit 5 Unit Tests and MockMvc Integration Tests.

```bash
# Run all tests
mvn clean test
```

## 📁 Architecture Overview

- **Controllers** (`com.ofos.controller`): Handle HTTP requests, input validation, and JWT extraction.
- **Services** (`com.ofos.service`): Orchestrate business logic, enforce IDOR protections, and apply design patterns.
- **Entities** (`com.ofos.model.entity`): Rich JPA domain models representing the database schema.
- **Patterns** (`com.ofos.pattern`): Explicit, decoupled implementations of software engineering patterns (State, Strategy).
- **Frontend Contexts** (`frontend/src/context`): React Context providers managing global application state (`AuthContext`, `CartContext`) mapped directly to backend services.

## 🔐 Default Credentials

After Flyway completes its migrations (`V8__seed_admin_user.sql`), you can login to the Admin Dashboard using:
- **Email**: `admin@ofos.com`
- **Password**: `admin123`


//Admin: admin@ofos.com (Password: admin123)
//Restaurant Staff: gordon@hellskitchen.com (Password: admin123)# online-food-ordering-system
