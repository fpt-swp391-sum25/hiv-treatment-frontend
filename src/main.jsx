import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from './pages/client/home';
import Login from './pages/auth/login';
import Register from './pages/auth/register';
import Admin from './pages/admin/admin-page';
import ManagerLayout from './pages/manager/manager-page';
import ManagerDashboard from './components/manager/Dashboard';
import ManagerSchedule from './components/manager/Schedule/ManagerSchedule';
import DoctorManagement from './components/manager/DoctorManagement/DoctorManagement';
import StaffManagement from './components/manager/StaffManagement/StaffManagement';
import Reports from './components/manager/Reports/Reports';

import DoctorApp from './components/doctor/App';
import DoctorProfile from './components/doctor/DoctorProfile';
import DoctorDashboard from './pages/doctor/dashboard';

import BookingCheckupForm from './pages/client/booking';
import NotFound from './pages/error/not-found';
import Errors from './pages/error/data-error'
import AdminDashboard from './pages/admin/dashboard';
import AccountManagers from './pages/admin/managers';
import AccountDoctors from './pages/admin/doctors';
import AccountStaff from './pages/admin/staff';
import AccountUsers from './pages/admin/users';

import Staff from './pages/staff/staff-page'
import PatientDetail from './pages/staff/patient-detail'

import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthWrapper } from './components/context/auth.context';
import App from './pages/client/App';
import PrivateRoute from './pages/private-route';
import Resources from './pages/client/resources';
import Doctors from './pages/client/doctors';
import PaymentCallback from './pages/client/payment-callback';
import ProfileDetail from './pages/client/profile';



const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Home />,
        errorElement: <Errors />,
      },
      {
        path: '/booking',
        element: (
          <PrivateRoute>
            <BookingCheckupForm />
          </PrivateRoute>
        ),
        errorElement: <Errors />,
      },
      {
        path: '/payment/callback',
        element: (
          <PrivateRoute>
            <PaymentCallback />
          </PrivateRoute>
        ),
        errorElement: <Errors />,
      },
      {
        path: '/profile',
        element: (
          <PrivateRoute>
            <ProfileDetail />
          </PrivateRoute>
        ),
        errorElement: <Errors />,
      },
    ]
  },
  {
    path: '/doctor',
    element: <DoctorApp />,
    children: [
      {
        index: true,
        element: <DoctorDashboard />,
        errorElement: <Errors />,
      },
      {
        path: '/doctor/profile',
        element: <DoctorProfile />,
        errorElement: <Errors />,
      },
    ],
    errorElement: <Errors />,
  },
  {
    path: '/doctors',
    element: <Doctors />,
    errorElement: <Errors />,
  },
  {
    path: '/resources',
    element: <Resources />,
    errorElement: <Errors />,
  },
  {
    path: '/login',
    element: <Login />,
    errorElement: <Errors />,
  },
  {
    path: '/register',
    element: <Register />,
    errorElement: <Errors />,
  },
  {
    path: '/admin',
    element: <Admin />,
    children: [
      {
        index: true,
        element: <AdminDashboard />,
        errorElement: <Errors />,
      },
      {
        path: '/admin/managers',
        element: <AccountManagers />,
        errorElement: <Errors />,
      },
      {
        path: '/admin/doctors',
        element: <AccountDoctors />,
        errorElement: <Errors />,
      },
      {
        path: '/admin/staff',
        element: <AccountStaff />,
        errorElement: <Errors />,
      },
      {
        path: '/admin/users',
        element: <AccountUsers />,
        errorElement: <Errors />,
      }
    ]
  },
  {
    path: '/manager',
    element: <ManagerLayout />,
    children: [
      {
        index: true,
        element: <ManagerDashboard />,
        errorElement: <Errors />,
      }, {
        path: 'schedule',
        element: <ManagerSchedule />,
        errorElement: <Errors />,
      }, {
        path: 'doctors',
        element: <DoctorManagement />,
        errorElement: <Errors />,
      },
      {
        path: 'staff',
        element: <StaffManagement />,
        errorElement: <Errors />,
      },
      {
        path: 'reports',
        element: <Reports />,
        errorElement: <Errors />,
      }
    ],
    errorElement: <Errors />,
  },
  {
    path: '/staff',
    element: <Staff />,
    errorElement: <Errors />,
  },
  {
    path: '/staff/patient-detail/:id',
    element: <PatientDetail />,
    errorElement: <Errors />,
  }
])


ReactDOM.createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId="115076786122-q76et2blbn1k1dmfpd6d5ss1t192ljj6.apps.googleusercontent.com">
    <AuthWrapper>
      <RouterProvider router={router} />
    </AuthWrapper>
  </GoogleOAuthProvider>
)
