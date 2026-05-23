import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../api';
import './Auth.css';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validaciones básicas
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      const result = await register(email, password, storeName);
      if (result.success) {
        navigate('/admin/dashboard');
      } else {
        setError(result.error || 'Error al crear la cuenta');
      }
    } catch (err) {
      console.error(err);
      // Mensajes de error comunes de Firebase
      if (err.code === 'auth/email-already-in-use') {
        setError('Este email ya está registrado. Inicia sesión.');
      } else if (err.code === 'auth/invalid-email') {
        setError('El email no es válido.');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña es demasiado débil. Usa al menos 6 caracteres.');
      } else {
        setError(err.message || 'Error al registrar. Verifica tu conexión.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Crear nueva tienda</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nombre de la tienda"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña (mínimo 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar tienda'}
          </button>
          {error && <p className="error">{error}</p>}
        </form>
        <p>¿Ya tienes tienda? <a href="/login">Inicia sesión</a></p>
      </div>
    </div>
  );
}