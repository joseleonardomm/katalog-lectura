import { useState } from 'react';
import { updateConfig, uploadImage } from '../../api';
import { FaCamera, FaTrash } from 'react-icons/fa';

export default function GeneralSettings({ config, onUpdate }) {
  const [form, setForm] = useState(config);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadImage(file);
      if (res.url) setForm(prev => ({ ...prev, logoUrl: res.url }));
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Error al subir el logo');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const settingsToUpdate = {
        siteName: form.siteName,
        logoUrl: form.logoUrl,
        whatsappNumber: form.whatsappNumber,
        whatsappMessage: form.whatsappMessage,
        footerText: form.footerText,
        baseCurrency: form.baseCurrency,
        showBs: form.showBs,
        backupExchangeRate: form.backupExchangeRate,
        backupEurRate: form.backupEurRate,
      };
      Object.keys(settingsToUpdate).forEach(key => {
        if (settingsToUpdate[key] === undefined) delete settingsToUpdate[key];
      });
      await updateConfig(settingsToUpdate);
      alert('Configuración actualizada correctamente');
      if (onUpdate) await onUpdate();
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar la configuración.');
    } finally {
      setSaving(false);
    }
  };

  if (!config) return <div style={{ color: 'var(--text-secondary)' }}>Cargando configuración...</div>;

  return (
    <form onSubmit={handleSubmit} className="admin-form" style={{ maxWidth: '700px' }}>
      <h2>Configuración general</h2>

      <div className="form-group">
        <label>Nombre del sitio</label>
        <input name="siteName" value={form.siteName || ''} onChange={handleChange} placeholder="Mi Tienda" />
      </div>

      <h3>Moneda y precios</h3>
      <div className="form-group">
        <label>Moneda base de la tienda</label>
        <select name="baseCurrency" value={form.baseCurrency || 'USD'} onChange={handleChange}>
          <option value="USD">Dólar estadounidense (USD)</option>
          <option value="EUR">Euro (EUR)</option>
        </select>
      </div>

      {/* Toggle para Bolívares */}
      <div className="toggle-group" onClick={() => setForm(prev => ({ ...prev, showBs: !prev.showBs }))}>
        <span className="toggle-label">Mostrar precios en Bolívares (Bs)</span>
        <span className={`toggle-slider ${form.showBs ? 'active' : ''}`}></span>
      </div>

      {form.showBs && (
        <>
          <div className="form-group">
            <label>Tasa de cambio (USD/BS)</label>
            <input type="number" step="0.01" name="backupExchangeRate" value={form.backupExchangeRate || ''} onChange={handleChange} placeholder="Ej: 7.2" />
          </div>
          <div className="form-group">
            <label>Tasa de cambio (EUR/BS)</label>
            <input type="number" step="0.01" name="backupEurRate" value={form.backupEurRate || ''} onChange={handleChange} placeholder="Ej: 7.8" />
          </div>
        </>
      )}

      <h3>Logo de la tienda</h3>
      <div className="form-group">
        <label>Subir logo</label>
        <div className="file-upload-area">
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            disabled={uploading}
            id="logo-upload"
            style={{ display: 'none' }}
          />
          <label htmlFor="logo-upload" className="modern-upload-btn">
            {uploading ? 'Subiendo...' : <><FaCamera /> Seleccionar logo</>}
          </label>
        </div>
        {form.logoUrl && (
          <div className="image-preview-grid" style={{ marginTop: '0.5rem' }}>
            <div className="image-preview-wrapper">
              <div className="image-preview" style={{ width: '80px', height: '80px' }}>
                <img src={form.logoUrl} alt="Logo" />
              </div>
              <button
                type="button"
                className="remove-img-btn"
                onClick={() => setForm(prev => ({ ...prev, logoUrl: '' }))}
              >
                <FaTrash />
              </button>
            </div>
          </div>
        )}
      </div>

      <h3>WhatsApp</h3>
      <div className="form-group">
        <label>Número de WhatsApp</label>
        <input name="whatsappNumber" value={form.whatsappNumber || ''} onChange={handleChange} placeholder="+584141234567" />
      </div>
      <div className="form-group">
        <label>Mensaje automático</label>
        <textarea name="whatsappMessage" rows="3" value={form.whatsappMessage || ''} onChange={handleChange} />
      </div>

      <h3>Pie de página</h3>
      <div className="form-group">
        <label>Texto del pie de página</label>
        <input name="footerText" value={form.footerText || ''} onChange={handleChange} />
      </div>

      <div className="form-actions" style={{ marginTop: '2rem' }}>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar configuración'}
        </button>
      </div>
    </form>
  );
}