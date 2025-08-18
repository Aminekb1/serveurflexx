// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { lazy } from 'react';
import Loadable from '../layouts/full/shared/loadable/Loadable';
import { createBrowserRouter, Navigate } from 'react-router';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

/* ***Layouts**** */
const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));

// Dashboard
const Dashboard = Loadable(lazy(() => import('../views/dashboards/Dashboard')));

// Landing Page
const Landing = Loadable(lazy(() => import('../views/Landing')));
const AboutUs = Loadable(lazy(() => import('../views/AboutUs')));
const Features = Loadable(lazy(() => import('../views/Features')));
const VPSHosting = Loadable(lazy(() => import('../views/VPSHosting')));
const Contact = Loadable(lazy(() => import('../views/Contact')));
const Support = Loadable(lazy(() => import('../views/Support')));
const Pricing = Loadable(lazy(() => import('../views/Pricing')));
const DedicatedServers = Loadable(lazy(() => import('../views/DedicatedServers')));

const UserManagement = Loadable(lazy(() => import('../views/UserManagement/UserManagement')));
const Profile = Loadable(lazy(() => import('../views/UserManagement/Profile')));
const Orders = Loadable(lazy(() => import('../views/Orders/Orders')));
const OrderDetails = Loadable(lazy(() => import('../views/Orders/OrderDetails')));
const Invoices = Loadable(lazy(() => import('../views/Invoices/Invoices')));
const Notifications = Loadable(lazy(() => import('../views/Notifications/Notifications')));
const Resources = Loadable(lazy(() => import('../views/Resources/Resources')));
const AccountSettings = Loadable(lazy(() => import('../views/AccountSettings/AccountSettings')));
const ResourcesSelection = Loadable(lazy(() => import('../views/ResourcesSelection')));
const Payment = Loadable(lazy(() => import('../views/Payment')));
const MyResources = Loadable(lazy(() => import('../views/MyResources')));
// Authenticationconst Payment = Loadable(lazy(() => import('../views/Payment')));
const Login = Loadable(lazy(() => import('../views/auth/login/Login')));
const Register = Loadable(lazy(() => import('../views/auth/register/Register')));
const Error = Loadable(lazy(() => import('../views/auth/error/Error')));

const Router = [
  {
    path: '/',
    element: (
      <AuthProvider>
        <BlankLayout />
      </AuthProvider>
    ),
    children: [
      { index: true, element: <Landing /> },
      { path: 'about', element: <AboutUs /> },
      { path: 'features', element: <Features /> },
      { path: 'contact', element: <Contact /> },
      { path: 'VPSHosting', element: <VPSHosting /> },
      { path: 'DedicatedServers', element: <DedicatedServers /> },
      { path: 'Pricing', element: <Pricing /> },
      { path: 'Support', element: <Support /> },
      { path: 'resources', element: <ResourcesSelection /> },
      { path: 'Payment', element: <Payment /> },
      { path: 'MyResources', element: <MyResources /> },
    ],
  },
  {
    path: '/dashboard',
    element: (
      <AuthProvider>
        <ProtectedRoute>
          <FullLayout />
        </ProtectedRoute>
      </AuthProvider>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'UserManagement', element: <UserManagement /> },
      { path: 'orders/:id', element: <OrderDetails /> }, // Updated dynamic route
      { path: 'Invoices', element: <Invoices /> },
      { path: 'Orders', element: <Orders /> },
      { path: 'Notifications', element: <Notifications /> },
      { path: 'Resources', element: <Resources /> },
      { path: 'AccountSettings', element: <AccountSettings /> },
      { path: 'Profile', element: <Profile /> },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
  {
    path: '/auth',
    element: (
      <AuthProvider>
        <BlankLayout />
      </AuthProvider>
    ),
    children: [
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: '404', element: <Error /> },
    ],
  },
];

const router = createBrowserRouter(Router);

export default router;