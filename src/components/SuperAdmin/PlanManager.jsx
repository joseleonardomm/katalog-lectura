import { useState, useEffect } from 'react';
import { getPlansConfig, updatePlansConfig } from '../../api';
import './PlanManager.css';

export default function PlanManager() {
  const [plans, setPlans] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    const data = await getPlansConfig();
    setPlans(data);
    setLoading(false);
  };

  const handleLimitChange = (planName, value) => {
    const num = value === '' ? null : parseInt(value, 10);
    setPlans(prev => ({
      ...prev,
      [planName]: { ...prev[planName], productLimit: isNaN(num) ? null : num },
    }));
  };

  const handleFeatureChange = (planName, feature, checked) => {
    setPlans(prev => ({
      ...prev,
      [planName]: {
        ...prev[planName],
        features: { ...prev[planName].features, [feature]: checked },
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePlansConfig(plans);
      alert('Configuración de planes guardada');
    } catch (err) {
      console.error(err);
      alert('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Cargando configuración de planes...</div>;
  if (!plans) return <div style={{ color: 'var(--danger)' }}>Error al cargar planes.</div>;

  // ✅ Lista actualizada con las nuevas herramientas
  const featuresList = [
    { key: 'chatbot', label: 'Chatbot', icon: '💬' },
    { key: 'studio', label: 'Estudio de contenido', icon: '📸' },
    { key: 'fullCatalog', label: 'Catálogo completo', icon: '📂' },
    { key: 'orderForm', label: 'Formulario de pedido', icon: '📝' },
    { key: 'shipping', label: 'Envíos', icon: '🚚' },
    { key: 'inventory', label: 'Inventario', icon: '📦' },
    { key: 'quotes', label: 'Cotizaciones', icon: '📄' },
    { key: 'payments', label: 'Métodos de pago', icon: '💳' },
    { key: 'info', label: 'Información del negocio', icon: 'ℹ️' },
  ];

  return (
    <div className="plan-manager">
      <h2>Configuración de Planes</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Define los límites y herramientas de cada plan. Los cambios se aplican de inmediato.
      </p>

      <div className="plans-grid">
        {['free', 'pro', 'business'].map(planName => (
          <div key={planName} className="plan-card">
            <h3>{planName === 'free' ? 'Gratis' : planName === 'pro' ? 'Pro' : 'Business'}</h3>

            <div className="plan-field">
              <label>Límite de productos</label>
              <input
                type="number"
                min="1"
                value={plans[planName].productLimit ?? ''}
                placeholder="Ilimitado"
                onChange={e => handleLimitChange(planName, e.target.value)}
              />
              <small>Dejar vacío = ilimitado</small>
            </div>

            <div className="plan-features">
              <label>Herramientas activas</label>
              {featuresList.map(({ key, label, icon }) => (
                <label key={key} className="feature-checkbox">
                  <input
                    type="checkbox"
                    checked={plans[planName].features?.[key] !== false}
                    onChange={e => handleFeatureChange(planName, key, e.target.checked)}
                  />
                  {icon} {label}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button className="btn-save" onClick={handleSave} disabled={saving}>
        {saving ? 'Guardando...' : '💾 Guardar configuración'}
      </button>
    </div>
  );
}