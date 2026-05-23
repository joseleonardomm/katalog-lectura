import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const target = 30;
    let start = 0;
    const duration = 1500;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const percentage = Math.min(progress / duration, 1);
      setCount(Math.floor(percentage * target));
      if (progress < duration) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, []);

  const plans = [
    {
      name: 'Gratis',
      price: '$0/mes',
      features: ['15 productos', 'Subdominio', 'Panel básico', 'Soporte email'],
      buttonText: 'Probar gratis',
      buttonAction: () => navigate('/register'),
      popular: false,
      color: '#2c7da0',
      icon: '🆓'
    },
    {
      name: 'Pro',
      price: '$9/mes',
      features: ['150 productos', 'Subdominio', 'Soporte 24h', 'WhatsApp integrado', 'Personalización'],
      buttonText: 'Comenzar ahora',
      buttonAction: () => {
        const msg = encodeURIComponent('Hola, quiero contratar el plan Pro de Katalog por $9/mes.');
        window.open(`https://wa.me/584141234567?text=${msg}`, '_blank');
      },
      popular: true,
      color: '#ff8c42',
      icon: '🚀'
    },
    {
      name: 'Business',
      price: '$35/mes',
      features: ['Productos ilimitados', 'Dominio propio', 'Panel completo', 'Asesoría', 'Estadísticas'],
      buttonText: 'Contratar Business',
      buttonAction: () => {
        const msg = encodeURIComponent('Hola, quiero contratar el plan Business de Katalog por $35/mes.');
        window.open(`https://wa.me/584141234567?text=${msg}`, '_blank');
      },
      popular: false,
      color: '#6c5ce7',
      icon: '👑'
    }
  ];

  const features = [
    { icon: '🛍️', title: 'Catálogo digital', desc: 'Productos con fotos, precios y descripciones.' },
    { icon: '💬', title: 'WhatsApp integrado', desc: 'Recibe pedidos directos.' },
    { icon: '🎨', title: 'Personalización total', desc: 'Colores, logo, slider.' },
    { icon: '📊', title: 'Panel de control', desc: 'Sin programar.' },
    { icon: '🔗', title: 'Enlace único', desc: 'Comparte tu tienda.' },
    { icon: '⚡', title: 'Rápido y seguro', desc: 'Alojamiento en la nube.' }
  ];

  const openModal = (type) => setShowModal(type);
  const closeModal = () => setShowModal(null);

  return (
    <div className="landing-dark">
      <header className="landing-header-dark">
        <div className="logo"><h1>Katalog</h1></div>
        <div className="header-buttons">
          <button className="btn-outline-dark" onClick={() => navigate('/login')}>Iniciar sesión</button>
          <button className="btn-primary-dark" onClick={() => navigate('/register')}>Crear tienda gratis</button>
        </div>
      </header>

      <section className="hero-dark">
        <div className="hero-content-dark">
          <h1>Tu tienda online <br />en minutos</h1>
          <p>Crea un catálogo digital profesional, sin complicaciones. Personaliza, vende y crece con Katalog.</p>
          <div className="hero-buttons">
            <button className="btn-primary-dark btn-large" onClick={() => navigate('/register')}>Empieza gratis</button>
            <button className="btn-outline-dark btn-large" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>Descubre más</button>
          </div>
        </div>
        <div className="hero-glow"></div>
      </section>

      <section id="features" className="features-dark">
        <div className="container">
          <h2 className="section-title-dark">¿Qué puedes hacer con Katalog?</h2>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="brands-dark">
        <div className="container">
          <div className="brands-header">
          
            <h2>Más de <span className="counter">{count}</span> tiendas ya usan Katalog</h2>
          </div>
          <div className="trust-badge-dark">⭐ ⭐ ⭐ ⭐ ⭐</div>
        </div>
      </section>

      <section className="plans-dark">
        <div className="container">
          <h2 className="section-title-dark">Planes para todos los negocios</h2>
          <div className="plans-grid-dark">
            {plans.map((plan, idx) => (
              <div key={idx} className={`plan-card-dark ${plan.popular ? 'popular' : ''}`}>
                {plan.popular && <div className="popular-badge-dark">Más popular</div>}
                <div className="plan-header-dark">
                  <div className="plan-icon">{plan.icon}</div>
                  <h3>{plan.name}</h3>
                  <div className="price-dark">{plan.price}</div>
                </div>
                <ul className="plan-features-dark">
                  {plan.features.map((f, i) => <li key={i}>✅ {f}</li>)}
                </ul>
                <button className="btn-plan-dark" onClick={plan.buttonAction}>{plan.buttonText}</button>
              </div>
            ))}
          </div>
          <p className="plans-note-dark">¿Quieres probar? El plan Gratis te da 15 productos y subdominio sin pagar nada.</p>
        </div>
      </section>

      <footer className="landing-footer-dark">
        <div className="container">
          <p>© 2025 Katalog. Crea tu tienda online hoy mismo.</p>
          <div className="footer-links-dark">
            <button className="footer-link-btn-dark" onClick={() => openModal('terms')}>Términos</button>
            <button className="footer-link-btn-dark" onClick={() => openModal('privacy')}>Privacidad</button>
            <a href="https://www.instagram.com/katalog.ve/" target="_blank" rel="noopener noreferrer">Instagram</a>
          </div>
        </div>
      </footer>

      {showModal === 'terms' && (
        <div className="modal-overlay-dark" onClick={closeModal}>
          <div className="modal-container-dark" onClick={e => e.stopPropagation()}>
            <button className="modal-close-dark" onClick={closeModal}>×</button>
            <h2>Términos y Condiciones</h2>
            <div className="modal-content-text">
              <p>Al utilizar Katalog, aceptas los siguientes términos:</p>
              <ul><li>Eres responsable del contenido...</li><li>No vender productos ilegales...</li><li>Puedes cancelar tu suscripción...</li></ul>
            </div>
          </div>
        </div>
      )}
      {showModal === 'privacy' && (
        <div className="modal-overlay-dark" onClick={closeModal}>
          <div className="modal-container-dark" onClick={e => e.stopPropagation()}>
            <button className="modal-close-dark" onClick={closeModal}>×</button>
            <h2>Política de Privacidad</h2>
            <div className="modal-content-text"><p>No compartimos tus datos sin consentimiento. Puedes solicitar la eliminación de tu cuenta.</p></div>
          </div>
        </div>
      )}
    </div>
  );
}