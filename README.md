# GenGlow Backend

**GenGlow Backend** is a **Node.js + Express API** for a personalized herbal skincare and haircare platform. It powers the core functionality of the GenGlow app, including:

* **Quiz Submissions** – Users answer skin and hair-related questions to receive **personalized product recommendations**.
* **Product Recommendations** – Each quiz generates exactly **one unique product recommendation** based on user inputs.
* **Order Management** – Users can **order recommended products** directly, while admins and pharmacists can manage orders.
* **Examination Booking** – Users can choose to **book an examination** instead of ordering products.
* **Sample Requests** – Users can request product samples before making a purchase.
* **User Accounts** – Profile management, authentication, and role-based access (user, admin, pharmacist).
* **Reviews & Testimonials** – Users can leave feedback and view reviews for transparency and trust.
* **Role-Based Access Control (RBAC)** – Secure routes for **users**, **admins**, and **pharmacists**.

## Tech Stack

* **Node.js** & **Express** – Backend server and REST API.
* **MongoDB + Mongoose** – Database for users, products, orders, and quiz results.
* **JWT Authentication** – Secure login and route protection.
* **dotenv** – Environment variable management.

## Features

* Rule-based **personalized product recommendations**.
* Flexible **order creation and management**.
* Optional **examination booking workflow**.
* Clean, structured, and secure REST API.

## Setup

```bash
git clone https://github.com/rewanelsayed03/GenGlow-Backend.git
cd GenGlow-Backend
npm install
cp .env.example .env   # add your MongoDB URI and JWT secret
npm start
```

> The server runs on `http://localhost:5000` by default.

---





