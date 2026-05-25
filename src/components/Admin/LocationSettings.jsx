import { useState } from 'react';
import { updateLocation } from '../../api';

export default function LocationSettings({ location, onUpdate }) {
  const [form, setForm] = useState(location || { address: '', mapEmbed: '', schedule: '', phone: '', email: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateLocation(form);
    if (onUpdate) onUpdate();            // ✅ solo se llama si existe
    alert('Ubicación actualizada');
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <div className="form-group">
        <label>Dirección</label>
        <input name="address" value={form.address || ''} onChange={handleChange} placeholder="Av. Principal, Caracas" />
      </div>
      <div className="form-group">
        <label>Código embed del mapa (iframe src)</label>
        <textarea name="mapEmbed" rows="2" value={form.mapEmbed || ''} onChange={handleChange} placeholder="https://maps.google.com/..." />
      </div>
      <div className="form-group">
        <label>Horario de atención</label>
        <input name="schedule" value={form.schedule || ''} onChange={handleChange} placeholder="Lun a Vie 9am-6pm" />
      </div>
      <div className="form-group">
        <label>Teléfono de contacto</label>
        <input name="phone" value={form.phone || ''} onChange={handleChange} placeholder="+58 212-555-1234" />
      </div>
      <div className="form-group">
        <label>Correo electrónico</label>
        <input name="email" type="email" value={form.email || ''} onChange={handleChange} placeholder="hola@katalog.com" />
      </div>
      <div className="form-actions">
        <button type="submit" className="btn-primary">💾 Guardar</button>
      </div>
    </form>
  );
}