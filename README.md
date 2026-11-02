# JerBite: Food Ordering & Delivery Platform

React + Tailwind (Vite, `.jsx`) frontend, Node.js + Express backend, PostgreSQL database.

```
foodapp/
├── backend/    Express API (port 5001)
└── frontend/   React app (port 5173)
```

## Quick Start

### 1. Backend
```bash
cd backend
npm install
npm run migrate             # applies all database migrations (001 - 005)
npm run seed:admin          # seeds default admin: admin@foodapp.com / AdminPassword123!
npm run dev                 # http://localhost:5001
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

---

## Portals & Access Points

* **JerBite Customer Storefront:** [http://localhost:5173/](http://localhost:5173/)
  - Dynamic discovery: search, category filtering, featured approved kitchens, popular food add-to-cart, active promotions, and customer cart preservation.
* **Dedicated Admin Portal:** [http://localhost:5173/admin/login](http://localhost:5173/admin/login)
  - **Email:** `admin@foodapp.com`
  - **Password:** `AdminPassword123!`
* **Restaurant Manager Dashboard:** [http://localhost:5173/manager](http://localhost:5173/manager)
* **Rider Fleet Dashboard:** [http://localhost:5173/rider](http://localhost:5173/rider)

---

## Admin Dashboard Structure (12 Expandable Sections)

1. **Overview:** Dashboard, Platform Analytics
2. **Restaurant Management:** All Restaurants, Restaurant Applications, Pending Approvals, Restaurant Managers, Profile Change Requests, Suspended Restaurants
3. **Customer Management:** All Customers, Customer Verification, Suspended Customers
4. **Food & Menu Management:** All Food Listings, Pending Food Approvals, Published Foods, Rejected Foods, Food Categories
5. **Rider Management:** All Riders, Rider Applications, Pending Rider Approvals, Delivery Assignments, Delivery Zones, Suspended Riders
6. **Order Management:** All Orders, Active Orders, Completed Orders, Cancelled Orders, Order Disputes
7. **Payment Management:** All Transactions, Failed Payments, Refund Requests, Restaurant Commissions, Restaurant Settlements
8. **Notification Management:** Notification Templates, Delivery Logs, Platform Announcements
9. **Support Management:** All Support Tickets, Customer Complaints, Dispute Resolution
10. **Analytics & Reports:** Sales Reports, Order Reports, Data Exports (CSV)
11. **Admin & System Management:** Admin Users, Roles & Permissions, Admin Activity Logs, Security Monitoring, System Health, API Error Logs
12. **Settings:** Platform Settings, Tax & Commission, Delivery Fee Settings, Verification & OTP, Payment Provider, Email & SMS Providers

---

## Restaurant Manager Dashboard Structure

1. **Overview:** Live Dashboard, Restaurant Analytics, Notifications
2. **Restaurant Profile:** Edit Restaurant Info, Opening Hours & Schedule, Profile Change Requests
3. **Menu Management:** All Food Items, Add/Edit Dishes, Food Categories, Availability
4. **Order Management:** Live Orders & Kitchen Display System (KDS)
5. **Delivery Management:** Courier Dispatch & Tracking, Nearby Available Riders
6. **Staff Management:** Kitchen Chefs, Cashiers, Assistants with granular roles
7. **Promotions:** Discounts, Coupons, and Voucher Management
8. **Payments and Earnings:** Sales Ledger, Platform Commission, Payout Accounts
9. **Customer Management:** Restaurant-specific customers, Order History, Reviews & Rating replies, Issues
10. **Reports:** Dish Performance, Best-sellers, Sales breakdown, CSV Downloads
11. **Alerts & Security:** Authentication Alerts, Security Audit Trail, Order Notification Settings
12. **Account and Settings:** Manager Profile, Password & Credentials
