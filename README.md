# Personal Finance & Expense Analytics Dashboard

Production-style MERN app: React (Vite + TypeScript + Tailwind) + Node/Express + MongoDB (Mongoose), JWT auth. Track expenses, set budgets, view analytics.

## Prerequisites

- Node.js 18+
- MongoDB running locally (or set `MONGODB_URI` in backend `.env`)

## Setup

### Backend

```bash
cd backend
npm install
npm run dev
```

Server runs at **http://localhost:5000**.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at **http://localhost:5173**. API calls are proxied to the backend.

## Features

- **Auth:** Sign up, sign in, JWT, protected routes
- **Budget:** Set monthly budget (per month)
- **Categories:** Create/edit/delete categories (name, icon, color)
- **Expenses:** Add/edit/delete expenses (amount, category, date, notes); table with filters (category, date range) and pagination
- **Dashboard:** Total spent, remaining budget, highest category, recent transactions, category pie chart, monthly trend bar chart, average daily spending (all via MongoDB aggregations)

## API Overview

| Area        | Endpoints |
|------------|-----------|
| Auth       | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` (Bearer token) |
| Categories | `GET/POST /api/categories`, `PUT/DELETE /api/categories/:id` |
| Expenses   | `GET /api/expenses?page&limit&categoryId&startDate&endDate`, `POST /api/expenses`, `PUT/DELETE /api/expenses/:id` |
| Budget     | `GET /api/budget?month=YYYY-MM`, `POST /api/budget` body `{ month, amount }` |
| Analytics  | `GET /api/analytics/dashboard?month=YYYY-MM` |