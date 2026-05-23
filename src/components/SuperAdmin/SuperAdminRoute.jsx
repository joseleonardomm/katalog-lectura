import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { isSuperAdmin } from '../../api';

export default function SuperAdminRoute({ children }) {
  const [isAdmin, setIsAdmin] = useState(null);
  useEffect(() => {
    isSuperAdmin().then(setIsAdmin);
  }, []);
  if (isAdmin === null) return <div>Cargando...</div>;
  return isAdmin ? children : <Navigate to="/login" />;
}