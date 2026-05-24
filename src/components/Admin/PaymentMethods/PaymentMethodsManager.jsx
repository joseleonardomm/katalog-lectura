import { useState, useEffect } from 'react';
import { getConfig, updateConfig } from '../../../api';
import { FaPlus, FaTrash, FaEdit, FaToggleOn, FaToggleOff, FaSave, FaTimes, FaMoneyBillWave, FaMobileAlt, FaUniversity, FaPaypal, FaCreditCard, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import './PaymentMethodsManager.css';

const EMPTY_METHOD = {
  id: '',
  type: 'pago_movil',
  label: '',
  active: true,
  details: {
    bank: '',
    phone: '',
    idNumber: '',
    paypalLink: '',
    customText: ''
  },
  instructions: 'Envía el comprobante al WhatsApp de la tienda'
};

export default function PaymentMethodsManager({ showMessage }) {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [editingMethod, setEditingMethod] = useState(null); // copia local del método en edición

  useEffect(() => {
    loadMethods();
  }, []);

  const loadMethods = async () => {
    const config = await getConfig();
    if (config && config.paymentMethods) {
      setMethods(config.paymentMethods);
    } else {
      setMethods([]);
    }
    setLoading(false);
  };

  const handleAdd = () => {
    const newMethod = { ...EMPTY_METHOD, id: Date.now().toString() };
    setMethods([...methods, newMethod]);
    setExpandedId(newMethod.id);
    setEditingMethod({ ...newMethod });
  };

  const handleToggleExpand = (id) => {
    if (expandedId === id) {
      // Cerrar sin guardar cambios locales (se descarta la edición)
      setExpandedId(null);
      setEditingMethod(null);
    } else {
      // Abrir este bloque y cargar sus datos para edición
      const method = methods.find(m => m.id === id);
      setExpandedId(id);
      setEditingMethod({ ...method });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este método de pago?')) {
      const updated = methods.filter(m => m.id !== id);
      setMethods(updated);
      const config = await getConfig();
      if (config) {
        await updateConfig({ ...config, paymentMethods: updated });
      }
      if (expandedId === id) {
        setExpandedId(null);
        setEditingMethod(null);
      }
      showMessage('success', 'Método eliminado');
    }
  };

  const handleToggleActive = async (id) => {
    const updated = methods.map(m => m.id === id ? { ...m, active: !m.active } : m);
    setMethods(updated);
    // También actualizar la copia local si el método está expandido
    if (expandedId === id && editingMethod) {
      setEditingMethod(prev => ({ ...prev, active: !prev.active }));
    }
    const config = await getConfig();
    if (config) {
      await updateConfig({ ...config, paymentMethods: updated });
    }
  };

  const handleEditingChange = (field, value) => {
    setEditingMethod(prev => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleDetailChange = (field, value) => {
    setEditingMethod(prev => prev ? {
      ...prev,
      details: { ...prev.details, [field]: value }
    } : prev);
  };

  const handleSaveMethod = async () => {
    if (!editingMethod) return;
    if (!editingMethod.label.trim()) {
      showMessage('error', 'El nombre del método es obligatorio');
      return;
    }
    const updated = methods.map(m => m.id === editingMethod.id ? { ...editingMethod } : m);
    setMethods(updated);
    const config = await getConfig();
    if (config) {
      await updateConfig({ ...config, paymentMethods: updated });
    }
    showMessage('success', 'Método guardado');
    setExpandedId(null);
    setEditingMethod(null);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'pago_movil': return <FaMobileAlt />;
      case 'transferencia': return <FaUniversity />;
      case 'paypal': return <FaPaypal />;
      case 'personalizado': return <FaCreditCard />;
      default: return <FaMoneyBillWave />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'pago_movil': return 'Pago Móvil';
      case 'transferencia': return 'Transferencia';
      case 'paypal': return 'PayPal';
      case 'personalizado': return 'Personalizado';
      default: return type;
    }
  };

  if (loading) return <div className="payment-loading">Cargando métodos de pago...</div>;

  return (
    <div className="payment-manager-pro">
      <div className="payment-header-pro">
        <div>
          <h2><FaMoneyBillWave /> Métodos de pago</h2>
          <p className="payment-subtitle">Configura cómo tus clientes pueden pagarte. Solo los métodos activos se mostrarán en el carrito.</p>
        </div>
        <button className="btn-primary" onClick={handleAdd}>
          <FaPlus /> Agregar método
        </button>
      </div>

      <div className="payment-grid-pro">
        {methods.map(method => {
          const isExpanded = expandedId === method.id;
          const currentMethod = isExpanded && editingMethod ? editingMethod : method;

          return (
            <div key={method.id} className={`payment-card-pro ${method.active ? '' : 'inactive'} ${isExpanded ? 'expanded' : ''}`}>
              {/* Cabecera compacta (siempre visible) */}
              <div className="payment-card-header-pro" onClick={() => handleToggleExpand(method.id)}>
                <div className="payment-type-icon">
                  {getTypeIcon(method.type)}
                </div>
                <div className="payment-card-title">
                  <h3>{method.label || 'Sin nombre'}</h3>
                  <span className="payment-type-badge-pro">{getTypeLabel(method.type)}</span>
                </div>
                <div className="payment-header-actions">
                  <button
                    className="btn-icon-pro"
                    onClick={(e) => { e.stopPropagation(); handleToggleActive(method.id); }}
                    title={method.active ? 'Desactivar' : 'Activar'}
                  >
                    {method.active ? <FaToggleOn className="toggle-on" /> : <FaToggleOff className="toggle-off" />}
                  </button>
                  <button
                    className="btn-icon-pro btn-delete"
                    onClick={(e) => { e.stopPropagation(); handleDelete(method.id); }}
                    title="Eliminar"
                  >
                    <FaTrash />
                  </button>
                  <span className="expand-arrow">
                    {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                  </span>
                </div>
              </div>

              {/* Contenido expandible (formulario de edición) */}
              {isExpanded && currentMethod && (
                <div className="payment-card-body-pro">
                  <div className="form-group-pro">
                    <label>Nombre del método</label>
                    <input
                      value={currentMethod.label}
                      onChange={(e) => handleEditingChange('label', e.target.value)}
                      placeholder="Ej: Pago Móvil BDV"
                    />
                  </div>
                  <div className="form-group-pro">
                    <label>Tipo</label>
                    <select value={currentMethod.type} onChange={(e) => handleEditingChange('type', e.target.value)}>
                      <option value="pago_movil">Pago Móvil</option>
                      <option value="transferencia">Transferencia</option>
                      <option value="paypal">PayPal</option>
                      <option value="personalizado">Personalizado</option>
                    </select>
                  </div>

                  {(currentMethod.type === 'pago_movil' || currentMethod.type === 'transferencia') && (
                    <div className="form-row-pro">
                      <div className="form-group-pro">
                        <label>Banco</label>
                        <input value={currentMethod.details.bank} onChange={e => handleDetailChange('bank', e.target.value)} placeholder="Banco de Venezuela" />
                      </div>
                      <div className="form-group-pro">
                        <label>Teléfono</label>
                        <input value={currentMethod.details.phone} onChange={e => handleDetailChange('phone', e.target.value)} placeholder="04141234567" />
                      </div>
                      <div className="form-group-pro">
                        <label>Cédula</label>
                        <input value={currentMethod.details.idNumber} onChange={e => handleDetailChange('idNumber', e.target.value)} placeholder="V-12345678" />
                      </div>
                    </div>
                  )}

                  {currentMethod.type === 'paypal' && (
                    <div className="form-group-pro">
                      <label>Enlace de PayPal</label>
                      <input value={currentMethod.details.paypalLink} onChange={e => handleDetailChange('paypalLink', e.target.value)} placeholder="https://paypal.me/tuusuario" />
                    </div>
                  )}

                  {currentMethod.type === 'personalizado' && (
                    <div className="form-group-pro">
                      <label>Información personalizada</label>
                      <textarea rows="3" value={currentMethod.details.customText} onChange={e => handleDetailChange('customText', e.target.value)} placeholder="Escribe aquí los datos de pago..." />
                    </div>
                  )}

                  <div className="form-group-pro">
                    <label>Instrucciones adicionales</label>
                    <input value={currentMethod.instructions} onChange={e => handleEditingChange('instructions', e.target.value)} placeholder="Ej: Enviar comprobante al WhatsApp" />
                  </div>

                  <div className="form-group-pro checkbox-pro">
                    <label>
                      <input
                        type="checkbox"
                        checked={currentMethod.active}
                        onChange={(e) => handleEditingChange('active', e.target.checked)}
                      />
                      <span className="toggle-label">Activo</span>
                    </label>
                  </div>

                  <div className="payment-card-footer-pro">
                    <button className="btn-secondary" onClick={() => handleToggleExpand(method.id)}>
                      <FaTimes /> Cancelar
                    </button>
                    <button className="btn-primary" onClick={handleSaveMethod}>
                      <FaSave /> Guardar
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {methods.length === 0 && (
          <div className="empty-state-pro">
            <FaMoneyBillWave className="empty-icon" />
            <p>No hay métodos de pago configurados</p>
            <button className="btn-secondary" onClick={handleAdd}>
              <FaPlus /> Agregar el primero
            </button>
          </div>
        )}
      </div>
    </div>
  );
}