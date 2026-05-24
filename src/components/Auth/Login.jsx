import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate, Link } from 'react-router-dom';
import { checkAndUpdatePlanStatus } from '../../api';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Efecto de partículas (mismo que en el register)
  useEffect(() => {
    // No es necesario añadir lógica extra, las partículas están en el CSS
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      localStorage.setItem('userId', uid);
      const result = await checkAndUpdatePlanStatus(uid);
      if (result?.expired) {
        alert(`Tu plan ${result.previousPlan} ha expirado. Has sido degradado al plan Gratis. Contacta a ventas para renovar.`);
      }
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Credenciales incorrectas o usuario no registrado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Partículas de fondo */}
      <div className="bg-particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      <div className="login-card-wrapper">
        <div className="login-card">
          <div className="login-logo">🛍️ Katalog</div>
          <h1 className="login-title">Iniciar sesión</h1>
          <p className="login-subtitle">Accede a tu panel de administración</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-login-submit" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
            {error && <p className="error-message">{error}</p>}
          </form>

          <div className="login-footer">
            <p>¿No tienes tienda? <Link to="/register" className="login-link">Regístrate aquí</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}