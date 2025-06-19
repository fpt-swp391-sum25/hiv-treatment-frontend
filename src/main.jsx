import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import App from './pages/client/App';

// Import for all pages
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthWrapper } from './components/context/AuthContext';
import PrivateRoute from './pages/auth/PrivateRoute';

// Import for error handler
import NotFound from './pages/error/NotFound';
import Errors from './pages/error/DataError'

// Import for client page
import Home from './pages/client/home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import BookingCheckupForm from './pages/patient/Booking';
import DocumentList from './pages/client/DocumentList';
import DoctorProfileList from './pages/client/DoctorProfileList';

// Import for admin page
import AdminPage from './pages/admin/AdminPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AccountManagers from './pages/admin/AccountManagers';
import AccountDoctors from './pages/admin/AccountDoctors';
import AccountLabTechnicians from './pages/admin/AccountLabTechnicians';
import AccountPatients from './pages/admin/AccountPatients';

// Import for manager page
import ManagerPage from './pages/manager/ManagerPage';
import ManagerDashboard from './components/manager/Dashboard';
import ManagerSchedule from './components/manager/Schedule/ManagerSchedule';
import DoctorManagement from './components/manager/DoctorManagement/DoctorManagement';
import StaffManagement from './components/manager/StaffManagement/StaffManagement';
import Reports from './components/manager/Reports/Reports';

// Import for doctor page
import DoctorHomePage from './pages/doctor/DoctorHomePage';
import DoctorProfile from './pages/doctor/DoctorProfile';
import DoctorSchedule from './pages/doctor/DoctorSchedule';
import ViewOnlyPatientDetail from './pages/doctor/ViewOnlyPatientDetail';
import PatientList from './pages/doctor/PatientList';

// Import for staff page
import StaffHomePage from './pages/staff/StaffHomePage'
import PatientDetail from './pages/staff/PatientDetailPage'


// Import for patient page
import ProfileDetail from './pages/patient/ProfileDetail';
import PaymentCallback from './pages/patient/PaymentCallback';

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
    element: <DoctorHomePage />,
    errorElement: <Errors />,
    children: [
      {
        path: '/doctor/profile',
        element: <DoctorProfile />,
        errorElement: <Errors />,
      },
      {
        path: '/doctor/schedule',
        element: <DoctorSchedule/>,
        errorElement: <Errors />,
      },
      {
        path: '/doctor/patient-list',
        element: <PatientList />,
        errorElement: <Errors />,
      },
      {
        path: '/doctor/patient-list/:id',
        element: <ViewOnlyPatientDetail />,
        errorElement: <Errors />
      }
    ],
  },
  {
    path: '/doctors',
    element: <DoctorProfileList />,
    errorElement: <Errors />,
  },
  {
    path: '/resources',
    element: <DocumentList />,
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
    element: <AdminPage />,
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
        element: <AccountLabTechnicians />,
        errorElement: <Errors />,
      },
      {
        path: '/admin/users',
        element: <AccountPatients />,
        errorElement: <Errors />,
      }
    ]
  },  
  {    
    path: '/manager',
    element: <ManagerPage />,
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
    element: <StaffHomePage />,
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
