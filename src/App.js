import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css';
import './styles/TableStyles.css';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import Register from './pages/Register';
import { useSelector, useDispatch } from 'react-redux';
import Spinner from './components/spinner';
import ProtectedRoute from './components/protectedRoute';
import PublicRoute from './components/publicRoute';
import ApplyDoctor from './pages/ApplyDoctor';
import NotificationPage from "./pages/NotificationPage";
import Users from './pages/admin/Users';
import Doctors from './pages/admin/Doctors';
import Profile from './pages/doctor/Profile';
import BookingPage from './pages/BookingPage';
import Appointments from './pages/Appointments';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import { setUser } from './redux/features/userSlice';
import { useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  const { loading } = useSelector(state => state.alerts)
  const dispatch = useDispatch();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      dispatch(setUser(JSON.parse(user)));
    }
  }, [dispatch]);

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        {loading ? <Spinner /> :
          <Routes>
            <Route path='/' element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } />
            <Route path='/login' element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } />
            <Route path='/register' element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            <Route path='/apply-doctor' element={
              <ProtectedRoute>
                <ApplyDoctor />
              </ProtectedRoute>
            } />
            <Route path='/admin/users' element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            } />
            <Route path='/admin/doctors' element={
              <ProtectedRoute>
                <Doctors />
              </ProtectedRoute>
            } />
            <Route path='/doctor/profile/:id' element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path='/doctor/book-appointment/:doctorId' element={
              <ProtectedRoute>
                <BookingPage />
              </ProtectedRoute>
            } />
            <Route path="/notification" element={
              <ProtectedRoute>
                <NotificationPage />
              </ProtectedRoute>
            } />
            <Route path="/appointments" element={
              <ProtectedRoute>
                <Appointments />
              </ProtectedRoute>
            } />
            <Route path="/doctor/appointments" element={
              <ProtectedRoute>
                <DoctorAppointments />
              </ProtectedRoute>
            } />
          </Routes>
        }
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
