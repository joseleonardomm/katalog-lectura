import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { verifyAdmin } from '../api';

export default function AdminRoute({ children }) {
  const [isAdmin, setIsAdmin] = useState(null);
  useEffect(() => {
    verifyAdmin().then(data => setIsAdmin(data.isAdmin));
  }, []);
  if (isAdmin === null) return <div>Cargando...</div>;
  return isAdmin ? children : <Navigate to="/admin/login" />;
}