import { useState } from 'react';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      localStorage.setItem('userId', uid);
      // Verificar si el plan expiró
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
    <div className="auth-container">
      <div className="auth-card">
        <h2>Iniciar sesión</h2>
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" disabled={loading}>{loading ? 'Cargando...' : 'Ingresar'}</button>
          {error && <p className="error">{error}</p>}
        </form>
        <p>¿No tienes tienda? <Link to="/register">Regístrate aquí</Link></p>
      </div>
    </div>
  );
}