import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Layouts
import MainLayout from '../components/layout/MainLayout';
import AdminLayout from '../pages/admin/AdminLayout.jsx';

// User Pages
import Home from '../pages/user/Home.jsx';
import Login from '../pages/user/Login.jsx';
import Signup from '../pages/user/Signup.jsx';
import Medicines from '../pages/user/Medicines.jsx';
import Orders from '../pages/user/Orders.jsx';
import Settings from '../pages/user/Settings.jsx';
import Profile from '../pages/user/Profile.jsx';
import Cart from '../pages/user/Cart.jsx';
import CheckoutPage from '../pages/order/CheckoutPage.jsx';
import ShippingPage from '../pages/order/ShippingPage.jsx';
import OrderDetails from '../pages/order/OrderDetails.jsx';
import LiveTracking from '../pages/order/LiveTracking.jsx';
import SymptomCheckerPage from '../pages/user/SymptomCheckerPage.jsx';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard.jsx';
import AdminCustomers from '../pages/admin/AdminCustomers.jsx';
import AddMedicine from '../pages/admin/AddMedicine.jsx';
import OffersSimple from '../pages/admin/OffersSimple.jsx';
import AboutUs from '../pages/AboutUs.jsx';
// No testing components needed

// Auth Components
import AdminRoute from '../components/auth/AdminRoute';
import UserRoute from '../components/auth/UserRoute';

const router = createBrowserRouter([
  // Public Routes
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <Signup /> },
      { path: 'medicines', element: <Medicines /> },
      { path: 'symptom-checker', element: <SymptomCheckerPage /> },
      // ...existing code...
      { path: 'about', element: <AboutUs /> },
// ...existing code...
    ],
  },
  
  // Protected User Routes
  {
    path: '/',
    element: (
      <UserRoute>
        <MainLayout />
      </UserRoute>
    ),
    children: [
      { path: 'cart', element: <Cart /> },
      { path: 'shipping', element: <ShippingPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'checkout/:id', element: <CheckoutPage /> },
      { path: 'orders', element: <Orders /> },
      { path: 'orders/:id', element: <OrderDetails /> },
      { path: 'orders/:id/live-tracking', element: <LiveTracking /> },
      { path: 'settings', element: <Settings /> },
      { path: 'profile', element: <Profile /> },
    ],
  },
  
  // Admin Routes
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'customers', element: <AdminCustomers /> },
      { path: 'add-medicine', element: <AddMedicine /> },
      { path: 'offers', element: <OffersSimple /> },
      // Add more admin routes here as needed
    ],
  },
  
  // 404 route - keep this last
  { path: '*', element: <div>404 - Page Not Found</div> },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
