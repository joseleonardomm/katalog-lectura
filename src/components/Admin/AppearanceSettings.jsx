import { useState } from 'react';
import { updateConfig } from '../../api';

const colorPalette = [
  '#ff6b00', '#ff8c42', '#e06e1a', '#ff6b6b', '#4ecdc4',
  '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9', '#2d3436',
  '#6c5ce7', '#a29bfe', '#fd79a8'
];

function ColorPicker({ label, value, onChange, name }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        {colorPalette.map(color => (
          <div
            key={color}
            onClick={() => onChange({ target: { name, value: color } })}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: color,
              cursor: 'pointer',
              border: value === color ? '3px solid #ffffff' : '1px solid transparent',
              boxShadow: value === color ? '0 0 0 2px var(--accent)' : '0 1px 3px rgba(0,0,0,0.2)',
              transition: '0.2s',
            }}
          />
        ))}
        <input
          type="color"
          value={value}
          onChange={onChange}
          name={name}
          style={{ width: 44, height: 36, borderRadius: 8, border: '1px solid var(--border-color)', cursor: 'pointer', background: 'var(--bg-input)' }}
        />
      </div>
    </div>
  );
}

// Función para quitar propiedades undefined de un objeto
function removeUndefined(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(item => removeUndefined(item));
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = removeUndefined(value);
    }
  }
  return cleaned;
}

export default function AppearanceSettings({ config, onUpdate }) {
  const [form, setForm] = useState(config || {});
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updates = {
        primaryColor: form.primaryColor,
        secondaryColor: form.secondaryColor,
        headerTextColor: form.headerTextColor,
        headerBgColor: form.headerBgColor,
        footerTextColor: form.footerTextColor,
        footerBgColor: form.footerBgColor,
        sectionTitleColor: form.sectionTitleColor,
        productTextColor: form.productTextColor,
        priceColor: form.priceColor,
        buttonPrimaryBg: form.buttonPrimaryBg,
        buttonPrimaryText: form.buttonPrimaryText,
        buttonSecondaryBg: form.buttonSecondaryBg,
        buttonSecondaryText: form.buttonSecondaryText,
      };

      // Eliminar cualquier campo con valor undefined
      const cleanedUpdates = removeUndefined(updates);

      await updateConfig(cleanedUpdates);
      if (onUpdate) await onUpdate();
      alert('Estilos actualizados correctamente');
    } catch (error) {
      console.error('Error al guardar estilos:', error);
      alert('Error al guardar los estilos.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form" style={{ maxWidth: '700px' }}>
      <h2>Apariencia y estilos</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Personaliza los colores de tu tienda. Estos cambios se reflejarán inmediatamente en la vista pública.
      </p>

      <h3>Colores principales</h3>
      <ColorPicker label="Color principal" name="primaryColor" value={form.primaryColor || '#ff6b00'} onChange={handleChange} />
      <ColorPicker label="Color secundario" name="secondaryColor" value={form.secondaryColor || '#e06e1a'} onChange={handleChange} />

      <h3>Cabecera (header)</h3>
      <ColorPicker label="Color de texto" name="headerTextColor" value={form.headerTextColor || '#1e1e2a'} onChange={handleChange} />
      <ColorPicker label="Color de fondo" name="headerBgColor" value={form.headerBgColor || '#ffffff'} onChange={handleChange} />

      <h3>Pie de página (footer)</h3>
      <ColorPicker label="Color de texto" name="footerTextColor" value={form.footerTextColor || '#dddddd'} onChange={handleChange} />
      <ColorPicker label="Color de fondo" name="footerBgColor" value={form.footerBgColor || '#1e1e2a'} onChange={handleChange} />

      <h3>Textos y productos</h3>
      <ColorPicker label="Títulos de sección" name="sectionTitleColor" value={form.sectionTitleColor || '#1e1e2a'} onChange={handleChange} />
      <ColorPicker label="Texto de productos" name="productTextColor" value={form.productTextColor || '#2d3748'} onChange={handleChange} />
      <ColorPicker label="Precios" name="priceColor" value={form.priceColor || form.primaryColor || '#ff6b00'} onChange={handleChange} />

      <h3>Botones</h3>
      <ColorPicker label="Fondo botón primario" name="buttonPrimaryBg" value={form.buttonPrimaryBg || form.primaryColor || '#ff6b00'} onChange={handleChange} />
      <ColorPicker label="Texto botón primario" name="buttonPrimaryText" value={form.buttonPrimaryText || '#ffffff'} onChange={handleChange} />
      <ColorPicker label="Fondo botón secundario" name="buttonSecondaryBg" value={form.buttonSecondaryBg || '#edf2f7'} onChange={handleChange} />
      <ColorPicker label="Texto botón secundario" name="buttonSecondaryText" value={form.buttonSecondaryText || '#4a5568'} onChange={handleChange} />

      <div className="form-actions" style={{ marginTop: '2rem' }}>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar estilos'}
        </button>
      </div>
    </form>
  );
}