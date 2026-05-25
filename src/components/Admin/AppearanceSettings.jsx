import { useState } from 'react';
import { updateConfig } from '../../api';

const colorPalette = [
  '#ff6b00', '#ff8c42', '#e06e1a', '#ff6b6b', '#4ecdc4',
  '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9', '#2d3436',
  '#6c5ce7', '#a29bfe', '#fd79a8', '#000000', '#ffffff',
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
              width: 32, height: 32, borderRadius: '50%', backgroundColor: color,
              cursor: 'pointer', border: value === color ? '3px solid #ffffff' : '1px solid transparent',
              boxShadow: value === color ? '0 0 0 2px var(--accent)' : '0 1px 3px rgba(0,0,0,0.2)',
              transition: '0.2s',
            }}
          />
        ))}
        <input type="color" value={value} onChange={onChange} name={name}
          style={{ width: 44, height: 36, borderRadius: 8, border: '1px solid var(--border-color)', cursor: 'pointer', background: 'var(--bg-input)' }}
        />
      </div>
    </div>
  );
}

function removeUndefined(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(item => removeUndefined(item));
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) cleaned[key] = removeUndefined(value);
  }
  return cleaned;
}

export default function AppearanceSettings({ config, onUpdate }) {
  // Valores por defecto completos para que nunca queden undefined
  const defaultConfig = {
    primaryColor: '#ff6b00',
    secondaryColor: '#e06e1a',
    headerBgColor: '#ffffff',
    headerTextColor: '#1e1e2a',
    footerBgColor: '#1e1e2a',
    footerTextColor: '#dddddd',
    footerTitleColor: '#ffffff',
    footerSubtitleColor: '#a0a0b8',
    sectionTitleColor: '#1e1e2a',
    categoryTitleColor: '#ffffff',
    productTextColor: '#2d3748',
    priceColor: '#ff6b00',
    catalogButtonBg: '#ff6b00',
    catalogButtonText: '#ffffff',
    storeBackgroundColor: '#ffffff',
    buttonPrimaryBg: '#ff6b00',
    buttonPrimaryText: '#ffffff',
    buttonSecondaryBg: '#edf2f7',
    buttonSecondaryText: '#4a5568',
  };

  const [form, setForm] = useState({ ...defaultConfig, ...config });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Enviamos todos los campos definidos en defaultConfig para que se guarden siempre
      const updates = { ...defaultConfig, ...form };
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

  const val = (field, fallback) => form[field] ?? fallback;

  return (
    <form onSubmit={handleSubmit} className="admin-form" style={{ maxWidth: '700px' }}>
      <h2>Apariencia y estilos</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Personaliza los colores de tu tienda. Recuerda guardar los cambios.
      </p>

      <h3>Colores principales</h3>
      <ColorPicker label="Color principal (acento)" name="primaryColor" value={val('primaryColor', '#ff6b00')} onChange={handleChange} />
      <ColorPicker label="Color secundario" name="secondaryColor" value={val('secondaryColor', '#e06e1a')} onChange={handleChange} />

      <h3>Fondo general</h3>
      <ColorPicker label="Fondo de la tienda" name="storeBackgroundColor" value={val('storeBackgroundColor', '#ffffff')} onChange={handleChange} />

      <h3>Cabecera (header)</h3>
      <ColorPicker label="Fondo del header" name="headerBgColor" value={val('headerBgColor', '#ffffff')} onChange={handleChange} />
      <ColorPicker label="Texto del header" name="headerTextColor" value={val('headerTextColor', '#1e1e2a')} onChange={handleChange} />

      <h3>Pie de página (footer)</h3>
      <ColorPicker label="Fondo del footer" name="footerBgColor" value={val('footerBgColor', '#1e1e2a')} onChange={handleChange} />
      <ColorPicker label="Texto del footer" name="footerTextColor" value={val('footerTextColor', '#dddddd')} onChange={handleChange} />
      <ColorPicker label="Títulos del footer" name="footerTitleColor" value={val('footerTitleColor', '#ffffff')} onChange={handleChange} />
      <ColorPicker label="Subtítulos / texto pequeño footer" name="footerSubtitleColor" value={val('footerSubtitleColor', '#a0a0b8')} onChange={handleChange} />

      <h3>Textos y productos</h3>
      <ColorPicker label="Títulos de sección (Categorías, Todos los productos…)" name="sectionTitleColor" value={val('sectionTitleColor', '#1e1e2a')} onChange={handleChange} />
      <ColorPicker label="Títulos dentro de portadas de categorías" name="categoryTitleColor" value={val('categoryTitleColor', '#ffffff')} onChange={handleChange} />
      <ColorPicker label="Texto de productos" name="productTextColor" value={val('productTextColor', '#2d3748')} onChange={handleChange} />
      <ColorPicker label="Precios" name="priceColor" value={val('priceColor', '#ff6b00')} onChange={handleChange} />

      <h3>Botón “Abrir catálogo completo”</h3>
      <ColorPicker label="Fondo del botón" name="catalogButtonBg" value={val('catalogButtonBg', '#ff6b00')} onChange={handleChange} />
      <ColorPicker label="Texto del botón" name="catalogButtonText" value={val('catalogButtonText', '#ffffff')} onChange={handleChange} />

      <h3>Botones generales</h3>
      <ColorPicker label="Fondo botón primario" name="buttonPrimaryBg" value={val('buttonPrimaryBg', '#ff6b00')} onChange={handleChange} />
      <ColorPicker label="Texto botón primario" name="buttonPrimaryText" value={val('buttonPrimaryText', '#ffffff')} onChange={handleChange} />
      <ColorPicker label="Fondo botón secundario" name="buttonSecondaryBg" value={val('buttonSecondaryBg', '#edf2f7')} onChange={handleChange} />
      <ColorPicker label="Texto botón secundario" name="buttonSecondaryText" value={val('buttonSecondaryText', '#4a5568')} onChange={handleChange} />

      <div className="form-actions" style={{ marginTop: '2rem' }}>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar estilos'}
        </button>
      </div>
    </form>
  );
}