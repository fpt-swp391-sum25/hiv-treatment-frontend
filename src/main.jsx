import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import App from './pages/client/App';

// Import for client pages
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthWrapper } from './components/context/AuthContext';
import PrivateRoute from './pages/auth/PrivateRoute';

// Import for error handler
import NotFound from './pages/error/NotFound';
import Errors from './pages/error/DataError'

// Import for home pages
import Home from './pages/client/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import BookingCheckupForm from './pages/patient/Booking';
import DocumentList from './pages/client/DocumentList';
import DoctorProfileList from './pages/client/DoctorProfileList';

// Import for admin pages
import AdminPage from './pages/admin/AdminPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AccountManagers from './pages/admin/AccountManagers';
import AccountDoctors from './pages/admin/AccountDoctors';
import AccountLabTechnicians from './pages/admin/AccountLabTechnicians';
import AccountPatients from './pages/admin/AccountPatients';

// Import for manager pages
import ManagerPage from './pages/manager/ManagerPage';
import ManagerDashboard from './components/manager/Dashboard';
import ManagerSchedule from './components/manager/Schedule/ManagerSchedule';
import DoctorManagement from './components/manager/DoctorManagement/DoctorManagement';
import LabTechnicianManagement from './components/manager/LabTechnicianManagement/LabTechnicianManagement';
import Reports from './components/manager/Reports/Reports';

// Import for doctor pages
import DoctorHomePage from './pages/doctor/DoctorHomePage';
import DoctorProfilePage from './pages/doctor/DoctorProfilePage';
import DoctorSchedulePage from './pages/doctor/DoctorSchedulePage';
import ViewOnlyPatientDetail from './components/doctor/ViewOnlyPatientDetail';
import PatientListPage from './pages/doctor/PatientListPage';
import RegimenListPage from './pages/doctor/RegimenListPage';

// Import for lab technician pages
import LabTechnicianHomePage from './pages/lab-technician/LabTechnicianHomePage'
import PatientDetail from './pages/lab-technician/PatientDetailPage'

// Import for patient pages
import ProfileDetail from './pages/patient/ProfileDetail';
import PaymentCallback from './pages/patient/PaymentCallback';

const router = createBrowserRouter([
  {
    // Path for home pages
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
  
  // Path for doctor pages
  {
    path: '/doctor',
    element: <DoctorHomePage />,
    errorElement: <Errors />,
    children: [
      {
        index: true, 
        element: <DoctorProfilePage />, 
        errorElement: <Errors />,
      },
      {
        path: 'profile',
        element: <DoctorProfilePage />,
        errorElement: <Errors />,
      },
      {
        path: 'schedule',
        element: <DoctorSchedulePage />,
        errorElement: <Errors />,
      },
      {
        path: 'patients',
        element: <PatientListPage />,
        errorElement: <Errors />,
      },
      {
        path: 'regimens',
        element: <RegimenListPage />,
        errorElement: <Errors />,
      },
      {
        path: 'patients/:id', 
        element: <ViewOnlyPatientDetail />,
        errorElement: <Errors />
      }
    ]
  },

  
  // Path for admin pages
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
        path: '/admin/lab-technician',
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

  // Path for manager pages 
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
        path: 'lab-technician',
        element: <LabTechnicianManagement />,
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

  // Path for lab technician pages
  {
    path: '/lab-technician',
    element: <LabTechnicianHomePage />,
    errorElement: <Errors />,
  },
  
  {
    path: '/lab-technician/patient-detail/:id',
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
