import { useState } from 'react';
import { updateSocialLinks } from '../../api';

export default function SocialLinks({ social, onUpdate }) {
  const [form, setForm] = useState(social || { instagram: '', facebook: '', twitter: '', youtube: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateSocialLinks(form);
    onUpdate();
    alert('Redes sociales actualizadas');
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <div className="form-group">
        <label>Instagram</label>
        <input name="instagram" placeholder="https://instagram.com/tu_usuario" value={form.instagram || ''} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label>Facebook</label>
        <input name="facebook" placeholder="https://facebook.com/tu_pagina" value={form.facebook || ''} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label>Twitter / X</label>
        <input name="twitter" placeholder="https://twitter.com/tu_usuario" value={form.twitter || ''} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label>YouTube</label>
        <input name="youtube" placeholder="https://youtube.com/c/tu_canal" value={form.youtube || ''} onChange={handleChange} />
      </div>
      <div className="form-actions">
        <button type="submit" className="btn-primary">💾 Guardar</button>
      </div>
    </form>
  );
}