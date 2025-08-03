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
import AccountCashiers from './pages/admin/AccountCashiers'
import AccountPatients from './pages/admin/AccountPatients';
import AdminSystemConfig from './pages/admin/AdminSystemConfig'
import AdminTestTypes from './pages/admin/AdminTestTypes'

// Import for manager pages
import ManagerPage from './pages/manager/ManagerPage';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import ManagerSchedule from './components/manager/Schedule/ManagerSchedule';
import DoctorManagement from './components/manager/DoctorManagement/DoctorManagement';
import LabTechnicianManagement from './components/manager/LabTechnicianManagement/LabTechnicianManagement';
import CashierManagement from './components/manager/CashierManagement/CashierManagement';
import Reports from './components/manager/Reports/Reports';
import DefaultRegimen from './pages/manager/DefaultRegimenPage';
import ManagerProfile from './pages/manager/ManagerProfile';

// Import for doctor pages
import DoctorHome from './pages/doctor/DoctorHome';
import DoctorProfile from './pages/doctor/DoctorProfile';
import DoctorSchedule from './pages/doctor/DoctorSchedule';
import PatientDetailDoctorView from './components/doctor/PatientDetailDoctorView';
import PatientList from './pages/doctor/PatientList';
import RegimenList from './pages/doctor/RegimenList';
import DoctorDocumentList from './pages/doctor/DoctorDocumentList';

// Import for lab technician pages
import LabTechnicianHomePage from './pages/lab-technician/LabTechnicianHomePage'
import PatientDetail from './pages/lab-technician/PatientDetailPage'
import LabTechnicianProfile from './pages/lab-technician/Profile';
import LabTechnicianPatientList from './pages/lab-technician/PatientList';


// Import for patient pages
import ProfileDetail from './pages/patient/ProfileDetail';
import PaymentCallback from './pages/patient/PaymentCallback';
import AppointmentResult from './pages/patient/AppointmentResult';
import PatientAppointmentHistory from './pages/patient/PatientAppointmentHistory';
import AppointmentList from './pages/patient/AppointmentList';
import ResetPassword from './pages/auth/ResetPassword';

// Import for mail verification
import VerifyEmail from './pages/auth/VerifyEmail';

// Import for cashier pages
import CashierHomePage from './pages/cashier/CashierHomePage';
import CashierPaymentSchedulePage from './pages/cashier/CashierPaymentSchedulePage';
import CashierPaymentTestPage from './pages/cashier/CashierPaymentTestPage';
import CashierTransactionHistoryPage from './pages/cashier/CashierTransactionHistoryPage';
import CashierProfilePage from './pages/cashier/CashierProfilePage';

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
          <PrivateRoute children={<BookingCheckupForm />} />
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
          <PrivateRoute children={<ProfileDetail />} />
        ),
        errorElement: <Errors />,
      },
      {
        path: '/appointment',
        element: (
          <PrivateRoute children={<AppointmentList />} />
        ),
        errorElement: <Errors />,
      },
      {
        path: '/appointment-result/:scheduleId',
        element: (
          <PrivateRoute children={<AppointmentResult />} />
        ),
        errorElement: <Errors />,
      },
      {
        path: '/appointment-history',
        element: (
          <PrivateRoute children={<PatientAppointmentHistory />} />
        ),
        errorElement: <Errors />,
      },
    ]
  },
  {
    path: '/doctor',
    element: <DoctorHome />,
    errorElement: <Errors />,
    children: [
      {
        path: '/doctor/profile',
        element: <DoctorProfile />,
        errorElement: <Errors />,
      },
      {
        path: '/doctor/schedule',
        element: <DoctorSchedule />,
        errorElement: <Errors />,
      },
      {
        path: '/doctor/patient-list',
        element: <PatientList />,
        errorElement: <Errors />,
      },
      {
        path: '/doctor/patient-list/:id',
        element: <PatientDetailDoctorView />,
        errorElement: <Errors />
      },
      {
        path: 'documents',
        element: (
          <PrivateRoute children={<DoctorDocumentList />} requiredRole={['DOCTOR']} />
        ),
        errorElement: <Errors />,
      },
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
    path: '/reset-password',
    element: <ResetPassword />,
    errorElement: <Errors />,
  },

  // Path for doctor pages
  {
    path: '/doctor',
    element: (
      <PrivateRoute children={<DoctorHome />} requiredRole={['DOCTOR']} />
    ),
    errorElement: <Errors />,
    children: [
      {
        index: true,
        element: (
          <PrivateRoute children={<DoctorSchedule />} requiredRole={['DOCTOR']} />
        ),
        errorElement: <Errors />,
      },
      {
        path: 'profile',
        element: (
          <PrivateRoute children={<DoctorProfile />} requiredRole={['DOCTOR']} />
        ),
        errorElement: <Errors />,
      },
      // {
      //   path: 'schedule',
      //   element: (
      //     <PrivateRoute children={<DoctorSchedule />} requiredRole={['DOCTOR']} />
      //   ),
      //   errorElement: <Errors />,
      // },
      {
        path: 'patients',
        element: (
          <PrivateRoute children={<PatientList />} requiredRole={['DOCTOR']} />
        ),
        errorElement: <Errors />,
      },
      {
        path: 'patients/:id',
        element: (
          <PrivateRoute children={<PatientDetailDoctorView />} requiredRole={['DOCTOR']} />
        ),
        errorElement: <Errors />
      },
      {
        path: 'regimens',
        element: (
          <PrivateRoute children={<RegimenList />} requiredRole={['DOCTOR']} />
        ),
        errorElement: <Errors />,
      },
    ]
  },

  // Path for admin pages
  {
    path: '/admin',
    element: (<PrivateRoute children={<AdminPage />} requiredRole={['ADMIN']} />),
    children: [
      {
        index: true,
        element: (<PrivateRoute children={<AdminDashboard />} requiredRole={['ADMIN']} />),
        errorElement: <Errors />,
      },
      {
        path: '/admin/managers',
        element: (<PrivateRoute children={<AccountManagers />} requiredRole={['ADMIN']} />),
        errorElement: <Errors />,
      },
      {
        path: '/admin/doctors',
        element: (<PrivateRoute children={<AccountDoctors />} requiredRole={['ADMIN']} />),
        errorElement: <Errors />,
      },
      {
        path: '/admin/lab-technicians',
        element: (<PrivateRoute children={<AccountLabTechnicians />} requiredRole={['ADMIN']} />),
        errorElement: <Errors />,
      },
      {
        path: '/admin/cashiers',
        element: (<PrivateRoute children={<AccountCashiers />} requiredRole={['ADMIN']} />),
        errorElement: <Errors />,
      },
      {
        path: '/admin/patients',
        element: (<PrivateRoute children={<AccountPatients />} requiredRole={['ADMIN']} />),
        errorElement: <Errors />,
      },
      {
        path: '/admin/test-types',
        element: (
          <PrivateRoute children={<AdminTestTypes />} requiredRole={['ADMIN']} />
        ),
        errorElement: <Errors />,
      },
      {
        path: '/admin/system-config',
        element: (
          <PrivateRoute children={<AdminSystemConfig />} requiredRole={['ADMIN']} />
        ),
        errorElement: <Errors />,
      }
    ]
  },
  // Path for manager pages
  {
    path: '/manager',
    element: (
      <PrivateRoute children={<ManagerPage />} requiredRole={['MANAGER']} />
    ),
    children: [
      {
        index: true,
        element: (
          <PrivateRoute children={<ManagerSchedule />} requiredRole={['MANAGER']} />
        ),
        errorElement: <Errors />,
      }, {
        path: 'schedule',
        element: (
          <PrivateRoute children={<ManagerSchedule />} requiredRole={['MANAGER']} />
        ),
        errorElement: <Errors />,
      }, {
        path: 'dashboard',
        element: (
          <PrivateRoute children={<ManagerDashboard />} requiredRole={['MANAGER']} />
        ),
        errorElement: <Errors />,
      }, {
        path: 'reports',
        element: (
          <PrivateRoute children={<Reports />} requiredRole={['MANAGER']} />
        ),
        errorElement: <Errors />,
      }, {
        path: 'doctors',
        element: (
          <PrivateRoute children={<DoctorManagement />} requiredRole={['MANAGER']} />
        ),
        errorElement: <Errors />,
      }, {
        path: 'lab-technicians',
        element: (
          <PrivateRoute children={<LabTechnicianManagement />} requiredRole={['MANAGER']} />
        ),
        errorElement: <Errors />,
      }, {
        path: 'cashier',
        element: (
          <PrivateRoute children={<CashierManagement />} requiredRole={['MANAGER']} />
        ),
        errorElement: <Errors />,
      }, {
        path: 'default-regimen',
        element: (
          <PrivateRoute children={<DefaultRegimen />} requiredRole={['MANAGER']} />
        ),
        errorElement: <Errors />,
      }, {
        path: 'profile',
        element: (
          <PrivateRoute children={<ManagerProfile />} requiredRole={['MANAGER']} />
        ),
        errorElement: <Errors />,
      }
    ]
  },
  // Path for lab technician pages
  {
    path: '/lab-technician',
    element: (
      <PrivateRoute children={<LabTechnicianHomePage />} requiredRole={['LAB_TECHNICIAN']} />
    ),
    errorElement: <Errors />,
    children: [
      {
        index: true,
        element: (
          <PrivateRoute children={<LabTechnicianPatientList />} requiredRole={['LAB_TECHNICIAN']} />
        ),
        errorElement: <Errors />
      },
      {
        path: 'patient-detail/:id',
        element: (
          <PrivateRoute children={<PatientDetail />} requiredRole={['LAB_TECHNICIAN']} />
        ),
        errorElement: <Errors />
      },
      {
        path: 'profile',
        element: (
          <PrivateRoute children={<LabTechnicianProfile />} requiredRole={['LAB_TECHNICIAN']} />
        ),
        errorElement: <Errors />
      }
    ]
  },
  {
    path: '/verify',
    element: (<VerifyEmail />)
  },

  // Path for cashier pages
  {
    path: '/cashier',
    element: (
      <PrivateRoute children={<CashierHomePage />} requiredRole={['CASHIER']} />
    ),
    errorElement: <Errors />,
    children: [
      {
        index: true,
        element: (
          <PrivateRoute children={<CashierPaymentSchedulePage />} requiredRole={['CASHIER']} />
        ),
        errorElement: <Errors />
      },
      {
        path: 'test-payment',
        element: (
          <PrivateRoute children={<CashierPaymentTestPage />} requiredRole={['CASHIER']} />
        ),
        errorElement: <Errors />
      },
      {
        path: 'transaction-lookup',
        element: (
          <PrivateRoute children={<CashierTransactionHistoryPage />} requiredRole={['CASHIER']} />
        ),
        errorElement: <Errors />
      },
      {
        path: 'profile',
        element: (
          <PrivateRoute children={<CashierProfilePage />} requiredRole={['CASHIER']} />
        ),
        errorElement: <Errors />
      }
    ]
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={'352858603517-ntvardeqch50ati93mpfjgl2aqqaf8qp.apps.googleusercontent.com'}>
    < AuthWrapper >
      <RouterProvider router={router} />
    </ AuthWrapper>
  </GoogleOAuthProvider>
);
