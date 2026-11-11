import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Customer from './dashboards/Customer';
import Provider from './dashboards/Provider';
import Admin from './dashboards/Admin';

const Guard = ({ role, children }) => { const { user } = useAuth(); return !user ? <Navigate to="/login" /> : user.role !== role ? <Navigate to={'/' + user.role} /> : children; };
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/customer" element={<Guard role="customer"><Customer /></Guard>} />
      <Route path="/provider" element={<Guard role="provider"><Provider /></Guard>} />
      <Route path="/admin" element={<Guard role="admin"><Admin /></Guard>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
