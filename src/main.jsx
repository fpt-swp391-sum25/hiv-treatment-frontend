import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Home from './pages/client/home';
import Login from './pages/auth/login';
import Register from './pages/auth/register';
import Admin from './pages/admin/admin-page';

import BookingCheckupForm from './pages/client/booking';
import NotFound from './pages/error/not-found';
import Errors from './pages/error/data-error'
import AdminDashboard from './pages/admin/dashboard';
import AccountManagers from './pages/admin/managers';
import AccountDoctors from './pages/admin/doctors';
import AccountStaff from './pages/admin/staff';
import AccountUsers from './pages/admin/users';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthWrapper } from './components/context/auth.context';
import App from './pages/client/App';
import PrivateRoute from './pages/private-route';



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
    ]
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

])


ReactDOM.createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId="115076786122-q76et2blbn1k1dmfpd6d5ss1t192ljj6.apps.googleusercontent.com">
    <AuthWrapper>
      <RouterProvider router={router} />
    </AuthWrapper>
  </GoogleOAuthProvider>
)
