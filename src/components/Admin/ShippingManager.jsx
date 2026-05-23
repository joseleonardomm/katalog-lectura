import { useState, useEffect } from 'react';
import { getConfig, updateConfig } from '../../api';
import { FaPlus, FaTrash, FaSave, FaCog, FaBox, FaGlobeAmericas } from 'react-icons/fa';
import './ShippingManager.css';

export default function ShippingManager() {
  const [shipping, setShipping] = useState({
    enabled: false,
    freeMode: 'global',
    freeFrom: 0,
    categories: [],
    states: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('config');

  useEffect(() => { loadConfig(); }, []);

  const loadConfig = async () => {
    const cfg = await getConfig();
    if (cfg?.shipping) setShipping(cfg.shipping);
    setLoading(false);
  };

  const handleChange = (field, value) => setShipping(prev => ({ ...prev, [field]: value }));

  // ---- Categorías ----
  const addCategory = () => {
    const newCat = { id: Date.now().toString(), name: '' };
    setShipping(prev => ({ ...prev, categories: [...prev.categories, newCat] }));
  };
  const updateCategory = (id, name) =>
    setShipping(prev => ({ ...prev, categories: prev.categories.map(cat => cat.id === id ? { ...cat, name } : cat) }));
  const removeCategory = (id) =>
    setShipping(prev => ({ ...prev, categories: prev.categories.filter(cat => cat.id !== id) }));

  // ---- Estados ----
  const addState = () => {
    const newState = { id: Date.now().toString(), name: '', zones: [] };
    setShipping(prev => ({ ...prev, states: [...prev.states, newState] }));
  };
  const updateStateName = (id, name) =>
    setShipping(prev => ({ ...prev, states: prev.states.map(st => st.id === id ? { ...st, name } : st) }));
  const removeState = (id) =>
    setShipping(prev => ({ ...prev, states: prev.states.filter(st => st.id !== id) }));

  // ---- Zonas ----
  const addZone = (stateId) => {
    const newZone = {
      id: Date.now().toString(),
      name: '',
      type: 'domicilio',
      price: 0,
      priceMax: '',
      deliveryTime: '',
      extras: {},
    };
    setShipping(prev => ({
      ...prev,
      states: prev.states.map(st => (st.id === stateId ? { ...st, zones: [...st.zones, newZone] } : st)),
    }));
  };

  const updateZone = (stateId, zoneId, field, value) => {
    setShipping(prev => ({
      ...prev,
      states: prev.states.map(st =>
        st.id === stateId
          ? { ...st, zones: st.zones.map(z => (z.id === zoneId ? { ...z, [field]: value } : z)) }
          : st
      ),
    }));
  };

  const updateZoneExtra = (stateId, zoneId, categoryId, value) => {
    setShipping(prev => ({
      ...prev,
      states: prev.states.map(st =>
        st.id === stateId
          ? { ...st, zones: st.zones.map(z => (z.id === zoneId ? { ...z, extras: { ...z.extras, [categoryId]: Number(value) || 0 } } : z)) }
          : st
      ),
    }));
  };

  const removeZone = (stateId, zoneId) => {
    setShipping(prev => ({
      ...prev,
      states: prev.states.map(st => (st.id === stateId ? { ...st, zones: st.zones.filter(z => z.id !== zoneId) } : st)),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateConfig({ shipping });
      alert('Configuración de envíos guardada');
    } catch (err) {
      console.error(err);
      alert('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="shipping-loading">Cargando configuración de envíos...</div>;

  const tabs = [
    { id: 'config', label: 'Configuración', icon: <FaCog /> },
    { id: 'categories', label: 'Categorías', icon: <FaBox /> },
    { id: 'states', label: 'Estados y Zonas', icon: <FaGlobeAmericas /> },
  ];

  return (
    <div className="shipping-manager-v2">
      <div className="shipping-topbar">
        <h2>🚚 Envíos</h2>
        <button className="btn-save-top" onClick={handleSave} disabled={saving}>
          <FaSave /> {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      <div className="shipping-main">
        {/* Panel de contenido según pestaña activa */}
        <div className="shipping-content">
          {activeTab === 'config' && (
            <div className="shipping-panel">
              <h3>Configuración general</h3>
              <div className="control-group checkbox-group">
                <label>
                  <input type="checkbox" checked={shipping.enabled} onChange={e => handleChange('enabled', e.target.checked)} />
                  Habilitar sistema de envíos
                </label>
              </div>
              {shipping.enabled && (
                <>
                  <div className="control-group">
                    <label>Modo de envío gratis</label>
                    <select value={shipping.freeMode} onChange={e => handleChange('freeMode', e.target.value)}>
                      <option value="global">Global (todas las zonas)</option>
                      <option value="perZone">Por zona (configurar en cada zona)</option>
                    </select>
                  </div>
                  <div className="control-group">
                    <label>Envío gratis a partir de ($)</label>
                    <input type="number" min="0" step="0.01" value={shipping.freeFrom} onChange={e => handleChange('freeFrom', Number(e.target.value))} />
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="shipping-panel">
              <h3>Categorías de producto (tamaño)</h3>
              <p className="panel-desc">Define categorías para calcular costos adicionales según el tamaño del producto.</p>
              <div className="categories-list">
                {shipping.categories.map(cat => (
                  <div key={cat.id} className="category-row">
                    <input type="text" value={cat.name} onChange={e => updateCategory(cat.id, e.target.value)} placeholder="Ej. Pequeño" />
                    <button className="btn-remove" onClick={() => removeCategory(cat.id)}><FaTrash /></button>
                  </div>
                ))}
                <button className="btn-add" onClick={addCategory}><FaPlus /> Agregar categoría</button>
              </div>
            </div>
          )}

          {activeTab === 'states' && (
            <div className="shipping-panel">
              <h3>Estados y zonas de entrega</h3>
              <p className="panel-desc">Agrega estados y dentro de cada uno las zonas con sus respectivos costos y tiempos.</p>
              {shipping.states.map(state => (
                <div key={state.id} className="state-card">
                  <div className="state-header">
                    <input type="text" value={state.name} onChange={e => updateStateName(state.id, e.target.value)} placeholder="Nombre del estado (ej. Carabobo)" className="state-name-input" />
                    <button className="btn-remove" onClick={() => removeState(state.id)}><FaTrash /></button>
                  </div>
                  <div className="zones-list">
                    {state.zones.map(zone => (
                      <div key={zone.id} className="zone-card">
                        <div className="zone-row">
                          <input type="text" value={zone.name} onChange={e => updateZone(state.id, zone.id, 'name', e.target.value)} placeholder="Nombre de la zona" />
                          <select value={zone.type} onChange={e => updateZone(state.id, zone.id, 'type', e.target.value)}>
                            <option value="domicilio">Domicilio</option>
                            <option value="oficina">Oficina de encomienda</option>
                          </select>
                          <div className="price-inputs">
                            <input type="number" min="0" step="0.01" value={zone.price} onChange={e => updateZone(state.id, zone.id, 'price', Number(e.target.value))} placeholder="Precio min" title="Precio mínimo" />
                            <span>–</span>
                            <input type="number" min="0" step="0.01" value={zone.priceMax || ''} onChange={e => updateZone(state.id, zone.id, 'priceMax', e.target.value === '' ? '' : Number(e.target.value))} placeholder="Máx (opcional)" title="Precio máximo (opcional)" />
                          </div>
                          <input type="text" value={zone.deliveryTime} onChange={e => updateZone(state.id, zone.id, 'deliveryTime', e.target.value)} placeholder="Tiempo (ej. 24-48h)" />
                          <button className="btn-remove" onClick={() => removeZone(state.id, zone.id)}><FaTrash /></button>
                        </div>
                        {shipping.categories.length > 0 && (
                          <div className="extras-row">
                            {shipping.categories.map(cat => (
                              <div key={cat.id} className="extra-item">
                                <label>{cat.name || 'Nueva'}</label>
                                <input type="number" min="0" step="0.01" value={zone.extras[cat.id] || 0} onChange={e => updateZoneExtra(state.id, zone.id, cat.id, e.target.value)} />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    <button className="btn-add" onClick={() => addZone(state.id)}><FaPlus /> Agregar zona</button>
                  </div>
                </div>
              ))}
              <button className="btn-add" onClick={addState}><FaPlus /> Agregar estado</button>
            </div>
          )}
        </div>
      </div>

      {/* Barra de pestañas inferior */}
      <div className="shipping-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`shipping-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}