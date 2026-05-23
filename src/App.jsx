import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import AdminDashboard from './components/Admin/AdminDashboard';
import PublicStore from './components/PublicStore';
import LandingPage from './components/Landing/LandingPage';
import SuperAdminDashboard from './components/SuperAdmin/SuperAdminDashboard';
import SuperAdminRoute from './components/SuperAdmin/SuperAdminRoute';
import FullCatalogPageV2 from './components/FullCatalogPageV2'; // NUEVO
import './App.css';

function PrivateRoute({ children }) {
  const userId = localStorage.getItem('userId');
  return userId ? children : <Navigate to="/" />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/admin/dashboard"
        element={
          <PrivateRoute>
            <AdminDashboard />
          </PrivateRoute>
        }
      />
      <Route path="/tienda/:slug" element={<PublicStore />} />
      <Route path="/catalogo-v2/:slug" element={<FullCatalogPageV2 />} /> {/* NUEVA RUTA */}
      <Route
        path="/superadmin/dashboard"
        element={
          <SuperAdminRoute>
            <SuperAdminDashboard />
          </SuperAdminRoute>
        }
      />
    </Routes>
  );
}

export default App;