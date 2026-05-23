import { useState, useEffect } from 'react';
import { getOrderFormConfig, updateOrderFormConfig } from '../../api';
import { FaPlus, FaTrash, FaSave } from 'react-icons/fa';
import './OrderFormManager.css';

export default function OrderFormManager() {
  const [enabled, setEnabled] = useState(false);
  const [fields, setFields] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const config = await getOrderFormConfig();
    setEnabled(config.enabled || false);
    setFields(config.fields || []);
  };

  const handleAddField = () => {
    setFields([...fields, { label: '', required: false }]);
  };

  const handleFieldChange = (index, key, value) => {
    const updated = [...fields];
    updated[index][key] = value;
    setFields(updated);
  };

  const handleRemoveField = (index) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    // Validar que los campos tengan label si están habilitados
    if (enabled && fields.some(f => !f.label.trim())) {
      alert('Todos los campos deben tener una etiqueta.');
      return;
    }
    setSaving(true);
    try {
      await updateOrderFormConfig({ enabled, fields });
      setMessage({ type: 'success', text: 'Configuración guardada' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error al guardar' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="order-form-manager">
      <h2>📝 Formulario de pedido</h2>
      <p>Configura los datos que el cliente debe llenar antes de enviar su pedido por WhatsApp.</p>

      <div className="form-enable">
        <label>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          Habilitar formulario de pedido
        </label>
      </div>

      {enabled && (
        <div className="fields-list">
          {fields.map((field, index) => (
            <div key={index} className="field-item">
              <input
                type="text"
                placeholder="Nombre del campo (ej. Nombre completo)"
                value={field.label}
                onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
              />
              <label className="required-check">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => handleFieldChange(index, 'required', e.target.checked)}
                />
                Obligatorio
              </label>
              <button className="btn-remove" onClick={() => handleRemoveField(index)}>
                <FaTrash />
              </button>
            </div>
          ))}
          <button className="btn-add" onClick={handleAddField}>
            <FaPlus /> Agregar campo
          </button>
        </div>
      )}

      <button className="btn-save" onClick={handleSave} disabled={saving}>
        <FaSave /> {saving ? 'Guardando...' : 'Guardar configuración'}
      </button>

      {message && (
        <div className={`toast-message ${message.type}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}