# Breakfast Business Frontend

React-based frontend for the Breakfast Business Management API.

## Setup
```bash
npm install
npm run dev
```

## Features

### Authentication
- Signup/login with JWT tokens
- Protected routes

### Product Management
- Full CRUD operations for products
- Buy/sell price tracking

### Customer Management
- Full CRUD operations for customers
- **Credit System** - Manage pre-paid credit balances per customer

### Sales & Orders
- Create sales with multiple customers and products
- Track revenue and profit per sale
- PDF report generation with detailed breakdowns

### Delivery Management
- Real-time delivery progress tracking
- Smart delivery routing with drag-and-drop reordering
- Mark deliveries as complete, skip, or reset
- **Credit Integration** - Automatically applies customer credit during delivery:
  - Shows credit balance for each customer
  - Calculates amount to collect after credit
  - Displays "Fully covered by credit" when applicable
  - Tracks credit applied in completed deliveries

### Public Customer Portal
- Customers can view and modify their orders via unique access links
- Shows available credit and amount to pay
- Real-time delivery status updates via SSE

### Analytics & Reports
- Sale PDF reports with credit visibility
- Profit calculations including credit as revenue
- Per-customer credit breakdown in reports

## Tech Stack
- React 18
- React Router
- CSS (dark theme)
- jsPDF for PDF generation
