import { useState } from 'react';
import { updateConfig, uploadImage } from '../api';

export default function SettingsForm({ config, onUpdate }) {
  const [form, setForm] = useState(config || {});
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const res = await uploadImage(file);
    if (res.url) {
      setForm({ ...form, logoUrl: res.url });
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updated = await updateConfig(form);
    onUpdate(updated);
    alert('Configuración actualizada');
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <input name="siteName" placeholder="Nombre del sitio" value={form.siteName || ''} onChange={handleChange} />
      <input name="primaryColor" placeholder="Color principal (hex)" value={form.primaryColor || ''} onChange={handleChange} />
      <input name="whatsappNumber" placeholder="WhatsApp (código país + número)" value={form.whatsappNumber || ''} onChange={handleChange} />
      <textarea name="whatsappMessage" placeholder="Mensaje automático" value={form.whatsappMessage || ''} onChange={handleChange} />
      <label>Logo:</label>
      <input type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploading} />
      {form.logoUrl && <img src={form.logoUrl} width="100" />}
      <button type="submit">Guardar cambios</button>
    </form>
  );
}