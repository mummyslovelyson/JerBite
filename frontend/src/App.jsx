import { Navigate, Route, Routes } from 'react-router-dom';
import {
  LayoutDashboard, Store, UtensilsCrossed, Users, Bike, ClipboardList,
  Tags, Settings, UserCircle, Bell, Truck, PackageCheck, CreditCard,
  SlidersHorizontal, Calendar, Wallet, BarChart3, ShieldCheck, LifeBuoy,
  Megaphone, Shield, FileText, CheckCircle2, AlertTriangle, Sparkles, MapPin
} from 'lucide-react';
import ProtectedRoute from './components/ProtectedRoute';
import PublicLayout from './components/PublicLayout';
import DashboardLayout from './components/DashboardLayout';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ManagerLogin from './pages/auth/ManagerLogin';
import ManagerRegister from './pages/auth/ManagerRegister';
import RiderLogin from './pages/auth/RiderLogin';
import RiderRegister from './pages/auth/RiderRegister';
import VerifyOtp from './pages/auth/VerifyOtp';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

import Home from './pages/public/Home';
import Restaurant from './pages/public/Restaurant';
import Cart from './pages/public/Cart';
import CustomerOrders from './pages/customer/Orders';
import OrderDetail from './pages/customer/OrderDetail';
import Profile from './pages/customer/Profile';
import Notifications from './pages/shared/Notifications';

// Manager Pages
import ManagerGate from './pages/manager/Gate';
import ManagerOverview from './pages/manager/Overview';
import ManagerAnalytics from './pages/manager/Analytics';
import ManagerProducts from './pages/manager/Products';
import ManagerCategories from './pages/manager/Categories';
import ManagerOrders from './pages/manager/Orders';
import ManagerFinances from './pages/manager/Finances';
import ManagerSchedule from './pages/manager/Schedule';
import ManagerSettings from './pages/manager/Settings';
import ManagerStaff from './pages/manager/Staff';
import ManagerPromotions from './pages/manager/Promotions';
import ManagerCustomers from './pages/manager/Customers';
import ManagerDelivery from './pages/manager/Delivery';
import ManagerAlerts from './pages/manager/Alerts';
import ManagerReports from './pages/manager/Reports';

// Rider Pages
import RiderGate from './pages/rider/Gate';
import RiderDashboard from './pages/rider/Dashboard';
import RiderAvailable from './pages/rider/Available';
import RiderDeliveries from './pages/rider/Deliveries';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminChangeRequests from './pages/admin/ChangeRequests';

// Section 1: Overview
import AdminDashboard from './pages/admin/overview/AdminDashboard';
import PlatformAnalytics from './pages/admin/overview/PlatformAnalytics';

// Section 2: Restaurant Management (Consolidated Overview)
import RestaurantsOverview from './pages/admin/restaurants/RestaurantsOverview';
import RestaurantDetailsView from './pages/admin/restaurants/RestaurantDetailsView';

// Section 3: Customer Management
import AllCustomers from './pages/admin/customers/AllCustomers';
import CustomerDetailsView from './pages/admin/customers/CustomerDetailsView';
import CustomerVerification from './pages/admin/customers/CustomerVerification';
import AdminCustomerOrders from './pages/admin/customers/CustomerOrders';
import CustomerSupportIssues from './pages/admin/customers/CustomerSupportIssues';
import SuspendedCustomers from './pages/admin/customers/SuspendedCustomers';

// Section 4: Food & Menu Management
import AllFoods from './pages/admin/food/AllFoods';
import PendingFoods from './pages/admin/food/PendingFoods';
import PublishedFoods from './pages/admin/food/PublishedFoods';
import RejectedFoods from './pages/admin/food/RejectedFoods';
import FoodDetailsView from './pages/admin/food/FoodDetailsView';
import FoodCategories from './pages/admin/food/FoodCategories';
import ReportedFoods from './pages/admin/food/ReportedFoods';

// Section 5: Rider Management
import AllRiders from './pages/admin/riders/AllRiders';
import RiderApplications from './pages/admin/riders/RiderApplications';
import PendingRiders from './pages/admin/riders/PendingRiders';
import RiderVerification from './pages/admin/riders/RiderVerification';
import RiderDetailsView from './pages/admin/riders/RiderDetailsView';
import DeliveryAssignments from './pages/admin/riders/DeliveryAssignments';
import RiderPerformance from './pages/admin/riders/RiderPerformance';
import SuspendedRiders from './pages/admin/riders/SuspendedRiders';

// Section 6: Order Management
import AllOrders from './pages/admin/orders/AllOrders';
import OrderDetailsView from './pages/admin/orders/OrderDetailsView';
import ActiveOrders from './pages/admin/orders/ActiveOrders';
import CompletedOrders from './pages/admin/orders/CompletedOrders';
import CancelledOrders from './pages/admin/orders/CancelledOrders';
import OrderDisputes from './pages/admin/orders/OrderDisputes';

// Section 7: Payment Management
import AllTransactions from './pages/admin/payments/AllTransactions';
import PaymentDetailsView from './pages/admin/payments/PaymentDetailsView';
import FailedPayments from './pages/admin/payments/FailedPayments';
import RefundRequests from './pages/admin/payments/RefundRequests';
import RefundHistory from './pages/admin/payments/RefundHistory';
import RestaurantCommissions from './pages/admin/payments/RestaurantCommissions';
import RestaurantSettlements from './pages/admin/payments/RestaurantSettlements';

// Section 8: Notification Management
import EmailNotifications from './pages/admin/notifications/EmailNotifications';
import SmsNotifications from './pages/admin/notifications/SmsNotifications';
import NotificationTemplates from './pages/admin/notifications/NotificationTemplates';
import NotificationDeliveryLogs from './pages/admin/notifications/NotificationDeliveryLogs';
import PlatformAnnouncements from './pages/admin/notifications/PlatformAnnouncements';

// Section 9: Support Management
import AllSupportTickets from './pages/admin/support/AllSupportTickets';
import CustomerComplaints from './pages/admin/support/CustomerComplaints';
import RestaurantComplaints from './pages/admin/support/RestaurantComplaints';
import RiderComplaints from './pages/admin/support/RiderComplaints';
import DisputeResolution from './pages/admin/support/DisputeResolution';

// Section 10: Analytics & Reports
import SalesAnalytics from './pages/admin/analytics/SalesAnalytics';
import OrderAnalytics from './pages/admin/analytics/OrderAnalytics';
import RestaurantAnalytics from './pages/admin/analytics/RestaurantAnalytics';
import CustomerAnalytics from './pages/admin/analytics/CustomerAnalytics';
import RiderAnalytics from './pages/admin/analytics/RiderAnalytics';
import PaymentAnalytics from './pages/admin/analytics/PaymentAnalytics';
import ReportsAndExports from './pages/admin/analytics/ReportsAndExports';

// Section 11: Admin & System Management
import AdminUsers from './pages/admin/system/AdminUsers';
import RolesAndPermissions from './pages/admin/system/RolesAndPermissions';
import AdminActivityLogs from './pages/admin/system/AdminActivityLogs';
import SecurityMonitoring from './pages/admin/system/SecurityMonitoring';
import SystemHealth from './pages/admin/system/SystemHealth';
import ApiErrorLogs from './pages/admin/system/ApiErrorLogs';

// Section 12: Settings (Unified Overview)
import SettingsOverview from './pages/admin/settings/SettingsOverview';

// ==========================================
// ADMIN DASHBOARD STREAMLINED 12-MODULE SIDEBAR
// (Concise sidebar items; all sub-pages presented in the overview)
// ==========================================
const adminSections = [
  {
    title: 'Overview',
    icon: LayoutDashboard,
    to: '/admin',
    items: [
      { to: '/admin', label: 'Dashboard', end: true },
      { to: '/admin/overview/platform-analytics', label: 'Platform Analytics' }
    ]
  },
  {
    title: 'Restaurants',
    icon: Store,
    to: '/admin/restaurants',
    items: [
      { to: '/admin/restaurants', label: 'Restaurants Overview', end: true },
      { to: '/admin/restaurants/applications', label: 'Applications & Verification' },
      { to: '/admin/restaurants/managers', label: 'Restaurant Managers' },
      { to: '/admin/restaurants/change-requests', label: 'Profile Change Requests' }
    ]
  },
  {
    title: 'Customers',
    icon: Users,
    to: '/admin/customers',
    items: [
      { to: '/admin/customers', label: 'All Customers', end: true },
      { to: '/admin/customers/details', label: 'Customer Details' },
      { to: '/admin/customers/verification', label: 'Verification' },
      { to: '/admin/customers/orders', label: 'Customer Orders' },
      { to: '/admin/customers/support', label: 'Support Issues' },
      { to: '/admin/customers/suspended', label: 'Suspended Customers' }
    ]
  },
  {
    title: 'Food & Menu',
    icon: UtensilsCrossed,
    to: '/admin/food',
    items: [
      { to: '/admin/food', label: 'All Food Listings', end: true },
      { to: '/admin/food/pending', label: 'Pending Approvals' },
      { to: '/admin/food/published', label: 'Published Foods' },
      { to: '/admin/food/rejected', label: 'Rejected Foods' },
      { to: '/admin/food/details', label: 'Food Details' },
      { to: '/admin/food/categories', label: 'Food Categories' },
      { to: '/admin/food/reported', label: 'Reported Foods' }
    ]
  },
  {
    title: 'Riders',
    icon: Bike,
    to: '/admin/riders',
    items: [
      { to: '/admin/riders', label: 'All Riders', end: true },
      { to: '/admin/riders/applications', label: 'Applications' },
      { to: '/admin/riders/pending', label: 'Pending Approvals' },
      { to: '/admin/riders/verification', label: 'Verification' },
      { to: '/admin/riders/details', label: 'Rider Details' },
      { to: '/admin/riders/assignments', label: 'Delivery Assignments' },
      { to: '/admin/riders/performance', label: 'Performance' },
      { to: '/admin/riders/suspended', label: 'Suspended Riders' }
    ]
  },
  {
    title: 'Orders',
    icon: ClipboardList,
    to: '/admin/orders',
    items: [
      { to: '/admin/orders', label: 'All Orders', end: true },
      { to: '/admin/orders/details', label: 'Order Details' },
      { to: '/admin/orders/active', label: 'Active Orders' },
      { to: '/admin/orders/completed', label: 'Completed Orders' },
      { to: '/admin/orders/cancelled', label: 'Cancelled Orders' },
      { to: '/admin/orders/disputes', label: 'Order Disputes' }
    ]
  },
  {
    title: 'Payments',
    icon: CreditCard,
    to: '/admin/payments',
    items: [
      { to: '/admin/payments', label: 'All Transactions', end: true },
      { to: '/admin/payments/details', label: 'Payment Details' },
      { to: '/admin/payments/failed', label: 'Failed Payments' },
      { to: '/admin/payments/refund-requests', label: 'Refund Requests' },
      { to: '/admin/payments/refund-history', label: 'Refund History' },
      { to: '/admin/payments/commissions', label: 'Commissions' },
      { to: '/admin/payments/settlements', label: 'Settlements' }
    ]
  },
  {
    title: 'Notifications',
    icon: Bell,
    to: '/admin/notifications/email',
    items: [
      { to: '/admin/notifications/email', label: 'Email Notifications' },
      { to: '/admin/notifications/sms', label: 'SMS Notifications' },
      { to: '/admin/notifications/templates', label: 'Templates' },
      { to: '/admin/notifications/logs', label: 'Delivery Logs' },
      { to: '/admin/notifications/announcements', label: 'Announcements' }
    ]
  },
  {
    title: 'Support',
    icon: LifeBuoy,
    to: '/admin/support',
    items: [
      { to: '/admin/support', label: 'All Support Tickets', end: true },
      { to: '/admin/support/customer', label: 'Customer Complaints' },
      { to: '/admin/support/restaurant', label: 'Restaurant Complaints' },
      { to: '/admin/support/rider', label: 'Rider Complaints' },
      { to: '/admin/support/disputes', label: 'Dispute Resolution' }
    ]
  },
  {
    title: 'Analytics',
    icon: BarChart3,
    to: '/admin/analytics/sales',
    items: [
      { to: '/admin/analytics/sales', label: 'Sales Analytics' },
      { to: '/admin/analytics/orders', label: 'Order Analytics' },
      { to: '/admin/analytics/restaurants', label: 'Restaurant Analytics' },
      { to: '/admin/analytics/customers', label: 'Customer Analytics' },
      { to: '/admin/analytics/riders', label: 'Rider Analytics' },
      { to: '/admin/analytics/payments', label: 'Payment Analytics' },
      { to: '/admin/analytics/reports', label: 'Reports & Exports' }
    ]
  },
  {
    title: 'System & Admins',
    icon: ShieldCheck,
    to: '/admin/system/admins',
    items: [
      { to: '/admin/system/admins', label: 'Admin Users' },
      { to: '/admin/system/roles', label: 'Roles & Permissions' },
      { to: '/admin/system/audit-logs', label: 'Activity Logs' },
      { to: '/admin/system/security', label: 'Security Monitoring' },
      { to: '/admin/system/health', label: 'System Health' },
      { to: '/admin/system/errors', label: 'API Error Logs' }
    ]
  },
  {
    title: 'Settings',
    icon: Settings,
    to: '/admin/settings',
    items: [
      { to: '/admin/settings', label: 'Settings Overview', end: true }
    ]
  }
];

// ==========================================
// MANAGER DASHBOARD EXPANDABLE SECTIONS
// ==========================================
const managerSections = [
  {
    title: 'Overview',
    icon: LayoutDashboard,
    items: [
      { to: '/manager', label: 'Dashboard', end: true },
      { to: '/manager/analytics', label: 'Restaurant Analytics' },
      { to: '/manager/notifications', label: 'Notifications' }
    ]
  },
  {
    title: 'Operations & Kitchen',
    icon: ClipboardList,
    items: [
      { to: '/manager/orders', label: 'Live Orders & KDS', end: true },
      { to: '/manager/delivery', label: 'Courier Dispatch & Tracking' },
      { to: '/manager/staff', label: 'Team Members & Roles' }
    ]
  },
  {
    title: 'Menu & Kitchen Store',
    icon: Store,
    items: [
      { to: '/manager/products', label: 'All Menu Dishes', end: true },
      { to: '/manager/categories', label: 'Food Categories' },
      { to: '/manager/settings', label: 'Restaurant Profile & Hours' }
    ]
  },
  {
    title: 'Customers & Growth',
    icon: Users,
    items: [
      { to: '/manager/customers', label: 'Diners, Reviews & Issues', end: true },
      { to: '/manager/promotions', label: 'Discounts & Offers' },
      { to: '/manager/reports', label: 'Sales Reports & Exports' }
    ]
  },
  {
    title: 'Finances & Security',
    icon: Wallet,
    items: [
      { to: '/manager/finances', label: 'Sales & Payout Ledger', end: true },
      { to: '/manager/alerts', label: 'Authentication & Live Alerts' },
      { to: '/manager/account', label: 'Manager Profile' }
    ]
  }
];

const riderLinks = [
  { to: '/rider', label: 'Overview', icon: LayoutDashboard, end: true, group: 'Deliveries' },
  { to: '/rider/available', label: 'Available Jobs', icon: Truck, group: 'Deliveries' },
  { to: '/rider/deliveries', label: 'My Active Deliveries', icon: PackageCheck, group: 'Deliveries' },
  { to: '/rider/account', label: 'My Account', icon: UserCircle, group: 'Account' },
  { to: '/rider/notifications', label: 'Notifications', icon: Bell, group: 'Account' }
];

export default function App() {
  return (
    <Routes>
      {/* PUBLIC AUTH ROUTES - SEPARATE DEDICATED PORTALS */}
      {/* Customer Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/customer/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/customer/register" element={<Register />} />

      {/* Restaurant Partner / Kitchen Manager Authentication */}
      <Route path="/manager/login" element={<ManagerLogin />} />
      <Route path="/partner/login" element={<ManagerLogin />} />
      <Route path="/manager/register" element={<ManagerRegister />} />
      <Route path="/partner/register" element={<ManagerRegister />} />

      {/* Delivery Rider / Fleet Authentication */}
      <Route path="/rider/login" element={<RiderLogin />} />
      <Route path="/rider/register" element={<RiderRegister />} />

      {/* Administrator Authentication */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Verification & Recovery */}
      <Route path="/verify" element={<VerifyOtp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* PUBLIC CUSTOMER STORE */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/restaurant/:id" element={<Restaurant />} />
        <Route path="/cart" element={<Cart />} />
        <Route element={<ProtectedRoute role="customer" />}>
          <Route path="/account/orders" element={<CustomerOrders />} />
          <Route path="/account/orders/:id" element={<OrderDetail />} />
          <Route path="/account/profile" element={<Profile withAddresses />} />
          <Route path="/account/notifications" element={<Notifications />} />
        </Route>
      </Route>

      {/* RESTAURANT MANAGER DASHBOARD */}
      <Route element={<ProtectedRoute role="manager" />}>
        <Route element={<DashboardLayout title="Restaurant Manager" sections={managerSections} base="/manager" />}>
          <Route element={<ManagerGate />}>
            <Route path="/manager" element={<ManagerOverview />} />
            <Route path="/manager/analytics" element={<ManagerAnalytics />} />
            <Route path="/manager/settings" element={<ManagerSettings />} />
            <Route path="/manager/schedule" element={<ManagerSchedule />} />
            <Route path="/manager/profile/change-requests" element={<AdminChangeRequests />} />
            <Route path="/manager/products" element={<ManagerProducts />} />
            <Route path="/manager/categories" element={<ManagerCategories />} />
            <Route path="/manager/orders" element={<ManagerOrders />} />
            <Route path="/manager/delivery" element={<ManagerDelivery />} />
            <Route path="/manager/staff" element={<ManagerStaff />} />
            <Route path="/manager/promotions" element={<ManagerPromotions />} />
            <Route path="/manager/finances" element={<ManagerFinances />} />
            <Route path="/manager/customers" element={<ManagerCustomers />} />
            <Route path="/manager/reports" element={<ManagerReports />} />
            <Route path="/manager/alerts" element={<ManagerAlerts />} />
          </Route>
          <Route path="/manager/account" element={<Profile />} />
          <Route path="/manager/notifications" element={<Notifications />} />
        </Route>
      </Route>

      {/* RIDER FLEET DASHBOARD */}
      <Route element={<ProtectedRoute role="rider" />}>
        <Route element={<DashboardLayout title="Rider Fleet" links={riderLinks} base="/rider" />}>
          <Route element={<RiderGate />}>
            <Route path="/rider" element={<RiderDashboard />} />
            <Route path="/rider/available" element={<RiderAvailable />} />
            <Route path="/rider/deliveries" element={<RiderDeliveries />} />
          </Route>
          <Route path="/rider/account" element={<Profile />} />
          <Route path="/rider/notifications" element={<Notifications />} />
        </Route>
      </Route>

      {/* ADMIN DASHBOARD - 75 DEDICATED SEPARATE MANAGEMENT PAGES */}
      <Route element={<ProtectedRoute role="admin" />}>
        <Route element={<DashboardLayout title="JerBite Admin" sections={adminSections} base="/admin" />}>
          {/* Section 1: Overview */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/overview/platform-analytics" element={<PlatformAnalytics />} />

          {/* Section 2: Restaurant Management (Consolidated Overview) */}
          <Route path="/admin/restaurants" element={<RestaurantsOverview />} />
          <Route path="/admin/restaurants/overview" element={<RestaurantsOverview defaultTab="overview" />} />
          <Route path="/admin/restaurants/all" element={<RestaurantsOverview defaultTab="all" />} />
          <Route path="/admin/restaurants/applications" element={<RestaurantsOverview defaultTab="applications" />} />
          <Route path="/admin/restaurants/pending" element={<RestaurantsOverview defaultTab="applications" />} />
          <Route path="/admin/restaurants/verification" element={<RestaurantsOverview defaultTab="documents" />} />
          <Route path="/admin/restaurants/documents" element={<RestaurantsOverview defaultTab="documents" />} />
          <Route path="/admin/restaurants/managers" element={<RestaurantsOverview defaultTab="managers" />} />
          <Route path="/admin/restaurants/change-requests" element={<RestaurantsOverview defaultTab="change_requests" />} />
          <Route path="/admin/restaurants/suspended" element={<RestaurantsOverview defaultTab="suspended" />} />
          <Route path="/admin/restaurants/details" element={<RestaurantsOverview defaultTab="all" />} />
          <Route path="/admin/restaurants/:id" element={<RestaurantDetailsView />} />

          {/* Section 3: Customer Management */}
          <Route path="/admin/customers" element={<AllCustomers />} />
          <Route path="/admin/customers/details" element={<CustomerDetailsView />} />
          <Route path="/admin/customers/:id" element={<CustomerDetailsView />} />
          <Route path="/admin/customers/verification" element={<CustomerVerification />} />
          <Route path="/admin/customers/orders" element={<AdminCustomerOrders />} />
          <Route path="/admin/customers/support" element={<CustomerSupportIssues />} />
          <Route path="/admin/customers/suspended" element={<SuspendedCustomers />} />

          {/* Section 4: Food & Menu Management */}
          <Route path="/admin/food" element={<AllFoods />} />
          <Route path="/admin/food/pending" element={<PendingFoods />} />
          <Route path="/admin/food/published" element={<PublishedFoods />} />
          <Route path="/admin/food/rejected" element={<RejectedFoods />} />
          <Route path="/admin/food/details" element={<FoodDetailsView />} />
          <Route path="/admin/food/:id" element={<FoodDetailsView />} />
          <Route path="/admin/food/categories" element={<FoodCategories />} />
          <Route path="/admin/food/reported" element={<ReportedFoods />} />

          {/* Section 5: Rider Management */}
          <Route path="/admin/riders" element={<AllRiders />} />
          <Route path="/admin/riders/applications" element={<RiderApplications />} />
          <Route path="/admin/riders/pending" element={<PendingRiders />} />
          <Route path="/admin/riders/verification" element={<RiderVerification />} />
          <Route path="/admin/riders/details" element={<RiderDetailsView />} />
          <Route path="/admin/riders/:id" element={<RiderDetailsView />} />
          <Route path="/admin/riders/assignments" element={<DeliveryAssignments />} />
          <Route path="/admin/riders/performance" element={<RiderPerformance />} />
          <Route path="/admin/riders/suspended" element={<SuspendedRiders />} />

          {/* Section 6: Order Management */}
          <Route path="/admin/orders" element={<AllOrders />} />
          <Route path="/admin/orders/details" element={<OrderDetailsView />} />
          <Route path="/admin/orders/:id" element={<OrderDetailsView />} />
          <Route path="/admin/orders/active" element={<ActiveOrders />} />
          <Route path="/admin/orders/completed" element={<CompletedOrders />} />
          <Route path="/admin/orders/cancelled" element={<CancelledOrders />} />
          <Route path="/admin/orders/disputes" element={<OrderDisputes />} />

          {/* Section 7: Payment Management */}
          <Route path="/admin/payments" element={<AllTransactions />} />
          <Route path="/admin/payments/details" element={<PaymentDetailsView />} />
          <Route path="/admin/payments/:id" element={<PaymentDetailsView />} />
          <Route path="/admin/payments/failed" element={<FailedPayments />} />
          <Route path="/admin/payments/refund-requests" element={<RefundRequests />} />
          <Route path="/admin/payments/refund-history" element={<RefundHistory />} />
          <Route path="/admin/payments/commissions" element={<RestaurantCommissions />} />
          <Route path="/admin/payments/settlements" element={<RestaurantSettlements />} />

          {/* Section 8: Notification Management */}
          <Route path="/admin/notifications/email" element={<EmailNotifications />} />
          <Route path="/admin/notifications/sms" element={<SmsNotifications />} />
          <Route path="/admin/notifications/templates" element={<NotificationTemplates />} />
          <Route path="/admin/notifications/logs" element={<NotificationDeliveryLogs />} />
          <Route path="/admin/notifications/announcements" element={<PlatformAnnouncements />} />

          {/* Section 9: Support Management */}
          <Route path="/admin/support" element={<AllSupportTickets />} />
          <Route path="/admin/support/customer" element={<CustomerComplaints />} />
          <Route path="/admin/support/restaurant" element={<RestaurantComplaints />} />
          <Route path="/admin/support/rider" element={<RiderComplaints />} />
          <Route path="/admin/support/disputes" element={<DisputeResolution />} />
          <Route path="/admin/support/tickets/:id" element={<DisputeResolution />} />

          {/* Section 10: Analytics & Reports */}
          <Route path="/admin/analytics/sales" element={<SalesAnalytics />} />
          <Route path="/admin/analytics/orders" element={<OrderAnalytics />} />
          <Route path="/admin/analytics/restaurants" element={<RestaurantAnalytics />} />
          <Route path="/admin/analytics/customers" element={<CustomerAnalytics />} />
          <Route path="/admin/analytics/riders" element={<RiderAnalytics />} />
          <Route path="/admin/analytics/payments" element={<PaymentAnalytics />} />
          <Route path="/admin/analytics/reports" element={<ReportsAndExports />} />

          {/* Section 11: Admin & System Management */}
          <Route path="/admin/system/admins" element={<AdminUsers />} />
          <Route path="/admin/system/roles" element={<RolesAndPermissions />} />
          <Route path="/admin/system/audit-logs" element={<AdminActivityLogs />} />
          <Route path="/admin/system/security" element={<SecurityMonitoring />} />
          <Route path="/admin/system/health" element={<SystemHealth />} />
          <Route path="/admin/system/errors" element={<ApiErrorLogs />} />

          {/* Section 12: Settings Overview (All settings in one page overview) */}
          <Route path="/admin/settings" element={<SettingsOverview />} />
          <Route path="/admin/settings/overview" element={<SettingsOverview />} />
          <Route path="/admin/settings/platform" element={<SettingsOverview defaultSection="platform" />} />
          <Route path="/admin/settings/otp" element={<SettingsOverview defaultSection="verification_otp" />} />
          <Route path="/admin/settings/payment" element={<SettingsOverview defaultSection="payment" />} />
          <Route path="/admin/settings/email" element={<SettingsOverview defaultSection="email_sms" />} />
          <Route path="/admin/settings/sms" element={<SettingsOverview defaultSection="email_sms" />} />
          <Route path="/admin/settings/tax-commission" element={<SettingsOverview defaultSection="tax_commission" />} />
          <Route path="/admin/settings/delivery-fee" element={<SettingsOverview defaultSection="delivery_fee" />} />
          <Route path="/admin/settings/service-areas" element={<SettingsOverview defaultSection="service_areas" />} />

          {/* Admin Profile & Common Shared Pages */}
          <Route path="/admin/account" element={<Profile />} />
          <Route path="/admin/notifications" element={<Notifications />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
