import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../api';
import './Register.css';

// ========== TEXTOS LEGALES ==========
const TERMS_AND_CONDITIONS = `
TÉRMINOS Y CONDICIONES DE USO DE KATALOG

1. Aceptación
Al registrarte y utilizar la plataforma Katalog ("el Servicio"), aceptas estos Términos y Condiciones en su totalidad. Si no estás de acuerdo, no debes utilizar el Servicio.

2. Descripción del Servicio
Katalog proporciona herramientas para que emprendedores y pequeños negocios creen un catálogo digital, gestionen productos y reciban pedidos a través de WhatsApp. Katalog no vende productos propios, solo facilita la infraestructura tecnológica.

3. Responsabilidades del Usuario (Tienda)
Eres el único responsable de:
- La veracidad y legalidad de la información, imágenes y precios publicados en tu catálogo.
- La calidad, entrega y garantía de los productos o servicios que ofreces a tus clientes.
- Configurar correctamente los métodos de pago que muestras en tu tienda. Katalog solo muestra la información que tú proporcionas; no procesa pagos ni interviene en transacciones.
- Cumplir con todas las leyes fiscales, de protección al consumidor y de comercio electrónico aplicables en tu país.
- Mantener la confidencialidad de tus credenciales de acceso.

4. Exención de Responsabilidad de Katalog
Katalog no es responsable por:
- Transacciones, cobros, reembolsos o disputas entre tiendas y compradores.
- Actos fraudulentos, estafas o incumplimientos por parte de cualquier tienda.
- Daños, pérdidas o perjuicios derivados del uso del Servicio, incluyendo pero no limitado a lucro cesante, pérdida de datos o interrupción del negocio.
- El contenido publicado por las tiendas. Katalog no supervisa previamente el contenido, pero se reserva el derecho de retirar material que infrinja la ley o estos términos.

5. Propiedad Intelectual
La plataforma Katalog, su código fuente, diseño y marca son propiedad exclusiva de sus desarrolladores. No adquieres ningún derecho sobre ellos, salvo el uso del panel de administración para gestionar tu tienda.

6. Uso de Datos y Privacidad
Al utilizar el Servicio, aceptas nuestra Política de Privacidad (ver a continuación). Autorizas a Katalog a tratar tus datos personales y los de tu tienda conforme a dicha política, incluyendo su uso para fines estadísticos, mejora del servicio y, en caso de requerimiento legal, su divulgación a las autoridades competentes.

7. Limitación de Responsabilidad
En ningún caso Katalog será responsable por daños indirectos, incidentales o consecuentes. La responsabilidad total de Katalog frente a cualquier reclamo se limitará al monto pagado por el usuario en los últimos 12 meses, si aplica.

8. Indemnización
Aceptas indemnizar y mantener indemne a Katalog y sus creadores frente a cualquier reclamo, demanda o daño que surja del incumplimiento de estos términos o de tus actividades en la plataforma.

9. Modificaciones
Katalog podrá actualizar estos términos en cualquier momento, notificándolo por correo electrónico o mediante un aviso en la plataforma. El uso continuado del Servicio implica la aceptación de los cambios.

10. Ley Aplicable
Estos términos se rigen por las leyes de Venezuela. Cualquier disputa será sometida a los tribunales competentes de la ciudad de Caracas.

11. Suspensión o Cancelación de Cuentas
Katalog se reserva el derecho de suspender o cancelar tu cuenta en cualquier momento, sin previo aviso y sin derecho a reembolso, si considera que estás utilizando el Servicio de manera inadecuada, fraudulenta, ilegal o que infrinja estos términos. También podremos cancelar cuentas inactivas por más de 6 meses.
`;

const PRIVACY_POLICY = `
POLÍTICA DE PRIVACIDAD DE KATALOG

1. Responsable del Tratamiento
Katalog (en adelante, "nosotros") actúa como responsable del tratamiento de los datos personales que recopilamos a través de la plataforma.

2. Datos que Recopilamos
- Información de registro: correo electrónico, nombre de la tienda, contraseña (cifrada).
- Datos de configuración: logo, número de WhatsApp, dirección, redes sociales, información de la empresa, métodos de pago (si el usuario los ingresa).
- Datos de uso: productos creados, categorías, slides, información del negocio, cotizaciones.
- Datos de clientes: los que tú recopiles a través del formulario de pedido o cotizaciones. Eres responsable de tratarlos conforme a la ley.

3. Finalidades del Tratamiento
- Crear y gestionar tu cuenta y tienda.
- Permitir el correcto funcionamiento del catálogo público, carrito, envíos y métodos de pago.
- Enviar notificaciones relacionadas con el servicio (por ejemplo, expiración de planes).
- Realizar estadísticas internas para mejorar la plataforma.
- Cumplir con obligaciones legales, como requerimientos de autoridades judiciales o administrativas.

4. Almacenamiento y Seguridad
Tus datos se almacenan en Firebase (Google Cloud), que cumple con altos estándares de seguridad. Tomamos medidas técnicas para proteger tu información, aunque ningún sistema es 100 % seguro.

5. No Compartimos tus Datos
No vendemos, alquilamos ni compartimos tus datos personales con terceros, excepto:
- Cuando sea necesario para prestar el servicio (por ejemplo, Firebase como procesador de datos).
- Para cumplir con una obligación legal o requerimiento judicial.
- Para proteger nuestros derechos o los de otros usuarios.

6. Conservación
Conservamos tus datos mientras mantengas tu cuenta activa. Si cancelas tu cuenta, eliminaremos tu información en un plazo razonable, salvo que debamos conservarla por obligación legal.

7. Derechos del Titular
Puedes solicitar el acceso, rectificación, limitación o supresión de tus datos escribiendo al correo de soporte. Atenderemos tu solicitud en un plazo máximo de 15 días hábiles.

8. Uso de Cookies y Tecnologías Similares
Utilizamos cookies técnicas necesarias para el funcionamiento de la plataforma. No usamos cookies de seguimiento publicitario.

9. Modificaciones
Esta política puede ser actualizada. Te informaremos de cambios significativos a través del correo registrado o mediante un aviso en la plataforma.
`;

export default function Register() {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const navigate = useNavigate();

  const featuresRef = useRef(null);
  const stepsRef = useRef(null);
  const ctaRef = useRef(null);

  // Animaciones de secciones
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15 }
    );

    const sections = [featuresRef.current, stepsRef.current, ctaRef.current];
    sections.forEach(section => {
      if (section) observer.observe(section);
    });

    return () => {
      sections.forEach(section => {
        if (section) observer.unobserve(section);
      });
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!acceptedTerms) {
      setError('Debes aceptar los Términos y Condiciones para crear tu tienda.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const result = await register(email, password, storeName);
      if (result.success) {
        navigate('/admin/dashboard');
      } else {
        setError(result.error || 'Error al crear la cuenta');
      }
    } catch (err) {
      console.error(err);
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
    <div className="register-landing-pro">
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

      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">✨ Más de 30 tiendas activas</div>
          <h1 className="hero-title">
            Tu tienda virtual,{' '}
            <span className="gradient-text">lista en minutos</span>
          </h1>
          <p className="hero-subtitle">
            Crea tu catálogo profesional, gestiona inventario y vende por WhatsApp
            sin complicaciones técnicas. Todo desde un panel moderno y gratuito.
          </p>
          <div className="hero-actions">
            <button className="btn-hero-primary" onClick={() => setShowForm(true)}>
              🚀 Crear tienda gratis
            </button>
            <a href="/login" className="btn-hero-secondary">
              Ya tengo tienda
            </a>
          </div>
          <div className="hero-trust">
            <span>✅ Sin tarjeta de crédito</span>
            <span>✅ Configuración en 5 minutos</span>
            <span>✅ Plan gratuito para siempre</span>
          </div>
        </div>
      </section>

      <section className="features-section" ref={featuresRef}>
        <h2 className="section-title">Todo lo que necesitas para vender</h2>
        <p className="section-subtitle">Herramientas profesionales sin precio profesional</p>
        <div className="features-grid">
          <div className="feature-card-pro">
            <div className="feature-icon-wrapper">📱</div>
            <h3>Catálogo inteligente</h3>
            <p>Productos con fotos, colores, precios y ofertas. Búsqueda y filtros para tus clientes.</p>
          </div>
          <div className="feature-card-pro">
            <div className="feature-icon-wrapper">📦</div>
            <h3>Gestión total</h3>
            <p>Controla inventario, ventas, finanzas y envíos desde un panel oscuro y moderno.</p>
          </div>
          <div className="feature-card-pro">
            <div className="feature-icon-wrapper">💬</div>
            <h3>Pedidos por WhatsApp</h3>
            <p>Carrito con cálculo de envío en tiempo real. Tus clientes te escriben directo.</p>
          </div>
          <div className="feature-card-pro">
            <div className="feature-icon-wrapper">🎨</div>
            <h3>Personalización total</h3>
            <p>Colores, logos, slides, información de tu negocio. Todo editable sin código.</p>
          </div>
          <div className="feature-card-pro">
            <div className="feature-icon-wrapper">📊</div>
            <h3>Estadísticas y finanzas</h3>
            <p>Registra ventas y compras. Controla tu flujo de caja con reportes exportables.</p>
          </div>
          <div className="feature-card-pro">
            <div className="feature-icon-wrapper">🛒</div>
            <h3>Cotizaciones profesionales</h3>
            <p>Genera cotizaciones en PDF con tus datos de empresa. Ideal para ventas B2B.</p>
          </div>
        </div>
      </section>

      <section className="steps-section" ref={stepsRef}>
        <h2 className="section-title">Empieza en 3 pasos</h2>
        <div className="steps-list">
          <div className="step-item">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Crea tu cuenta</h3>
              <p>Regístrate con email y elige el nombre de tu tienda. Sin verificaciones largas.</p>
            </div>
          </div>
          <div className="step-connector"></div>
          <div className="step-item">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Configura tu catálogo</h3>
              <p>Agrega productos, categorías, slides y personaliza los colores a tu marca.</p>
            </div>
          </div>
          <div className="step-connector"></div>
          <div className="step-item">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Comparte y vende</h3>
              <p>Envía tu enlace a clientes y recibe pedidos por WhatsApp. ¡Así de simple!</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section" ref={ctaRef}>
        <div className="cta-card">
          <h2>¿Listo para hacer crecer tu negocio?</h2>
          <p>Cientos de emprendedores ya confían en Katalog. Únete hoy y lleva tu tienda al siguiente nivel.</p>
          <button className="btn-hero-primary" onClick={() => setShowForm(true)}>
            🚀 Crear mi tienda ahora
          </button>
        </div>
      </section>

      {/* Modal de registro */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content register-modal-pro" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            <div className="modal-logo">🛍️ Katalog</div>
            <h2>Crear tu tienda</h2>
            <p className="modal-subtitle">Empieza gratis, sin tarjeta de crédito</p>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Nombre de la tienda</label>
                <input
                  type="text"
                  placeholder="Ej: Mi Tienda Online"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label>Contraseña</label>
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Checkbox de términos */}
              <div className="terms-checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                  />
                  <span>
                    Acepto los{' '}
                    <a href="#" onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }}>
                      Términos y Condiciones y la Política de Privacidad
                    </a>
                  </span>
                </label>
              </div>

              <button type="submit" className="btn-submit-modal" disabled={loading}>
                {loading ? 'Creando tienda...' : '🚀 Crear tienda gratis'}
              </button>
              {error && <p className="error-message">{error}</p>}
            </form>
            <p className="login-link">¿Ya tienes tienda? <a href="/login">Inicia sesión</a></p>
          </div>
        </div>
      )}

      {/* Modal de términos y condiciones */}
      {showTermsModal && (
        <div className="modal-overlay" onClick={() => setShowTermsModal(false)}>
          <div className="modal-content terms-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowTermsModal(false)}>✕</button>
            <h2>Términos y Condiciones</h2>
            <div className="terms-text">
              <pre>{TERMS_AND_CONDITIONS}</pre>
            </div>
            <h2>Política de Privacidad</h2>
            <div className="terms-text">
              <pre>{PRIVACY_POLICY}</pre>
            </div>
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button className="btn-primary" onClick={() => setShowTermsModal(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}