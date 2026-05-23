import React from 'react';
import { FaCheck, FaStar, FaRocket, FaStore, FaPalette, FaWhatsapp, FaChartLine, FaInfinity, FaGlobe, FaHeadset, FaBolt } from 'react-icons/fa';
import './PlanModal.css';

export default function PlanModal({ isOpen, onClose, currentPlan }) {
  if (!isOpen) return null;

  const plans = [
    {
      name: 'Gratis',
      price: '$0/mes',
      color: '#2c7da0',
      icon: <FaStore />,
      features: [
        'Catálogo con hasta 15 productos',
        'Subdominio incluido (ej. tunegocio.katalog.com)',
        'Panel fácil de usar, sin programación',
        'Actualizaciones y seguridad básicas',
        'Soporte por email (respuesta en 72h)'
      ],
      limit: 15,
      popular: false
    },
    {
      name: 'Pro',
      price: '$9/mes',
      color: '#ff8c42',
      icon: <FaRocket />,
      features: [
        'Catálogo con hasta 150 productos',
        'Sitio web profesional con subdominio incluido',
        'Panel fácil de usar, sin necesidad de saber programar',
        'Todo incluido: actualizaciones, seguridad y soporte por email',
        'Soporte prioritario (respuesta en 24h)',
        'Personalización avanzada de colores y estilos',
        'Integración con WhatsApp y redes sociales'
      ],
      limit: 150,
      popular: true
    },
    {
      name: 'Business',
      price: '$35/mes',
      color: '#6c5ce7',
      icon: <FaGlobe />,
      features: [
        'Productos ILIMITADOS',
        'Tu propio dominio .com (o el que elijas)',
        'Mismo panel sencillo, pero sin límites',
        'Soporte prioritario + mayor velocidad y almacenamiento',
        'Asesoría personalizada para migración',
        'Estadísticas avanzadas de visitas y ventas',
        'API para integraciones personalizadas'
      ],
      limit: 'Ilimitado',
      popular: false
    }
  ];

  const handleUpgrade = (planName) => {
    const message = encodeURIComponent(`Hola, quiero mejorar mi plan a ${planName} en Katalog. Mi tienda actual es ${currentPlan}. ¿Cómo procedo?`);
    window.open(`https://wa.me/584143498835?text=${message}`, '_blank');
  };

  const getPlanLimitText = (plan) => {
    if (plan.limit === 'Ilimitado') return 'Productos ilimitados';
    return `Hasta ${plan.limit} productos`;
  };

  return (
    <div className="plan-modal-overlay" onClick={onClose}>
      <div className="plan-modal-container" onClick={e => e.stopPropagation()}>
        <button className="plan-modal-close" onClick={onClose}>×</button>
        <h2>Planes disponibles para tu negocio</h2>
        <p className="plan-modal-subtitle">Elige el plan que mejor se adapte a tus necesidades</p>
        
        <div className="plans-modern-grid">
          {plans.map(plan => (
            <div 
              key={plan.name} 
              className={`modern-plan-card ${plan.popular ? 'popular' : ''} ${currentPlan === plan.name.toLowerCase() ? 'current' : ''}`}
              style={{ borderTopColor: plan.color }}
            >
              {plan.popular && <div className="modern-popular-badge">Más popular</div>}
              {currentPlan === plan.name.toLowerCase() && <div className="current-plan-badge">Plan actual</div>}
              
              <div className="modern-plan-header" style={{ backgroundColor: plan.color }}>
                <div className="modern-plan-icon">{plan.icon}</div>
                <h3>{plan.name}</h3>
                <div className="modern-plan-price">{plan.price}</div>
              </div>
              
              <div className="modern-plan-features">
                <div className="feature-limit">
                  <FaChartLine /> {getPlanLimitText(plan)}
                </div>
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="feature-item">
                    <FaCheck className="feature-check" style={{ color: plan.color }} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              
              {currentPlan !== plan.name.toLowerCase() && plan.name !== 'Gratis' && (
                <button 
                  className="modern-upgrade-btn" 
                  style={{ backgroundColor: plan.color }}
                  onClick={() => handleUpgrade(plan.name)}
                >
                  Mejorar a {plan.name}
                </button>
              )}
              {currentPlan === plan.name.toLowerCase() && plan.name !== 'Gratis' && (
                <div className="modern-renew-info">
                  <FaBolt /> Renovación mensual automática
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="plan-modal-footer">
          <p>¿Necesitas un plan personalizado o tienes dudas?</p>
          <button className="contact-sales-btn" onClick={() => window.open('https://wa.me/584143498835', '_blank')}>
            Contactar a ventas
          </button>
        </div>
      </div>
    </div>
  );
}