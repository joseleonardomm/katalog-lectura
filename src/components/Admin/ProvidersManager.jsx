import { useState, useEffect } from 'react';
import { getProviders, createProvider, updateProvider, deleteProvider } from '../../api';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import './ProvidersManager.css';

export default function ProvidersManager() {
  const [providers, setProviders] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);
  const loadData = async () => { const p = await getProviders(); setProviders(p); setLoading(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await updateProvider(editing.id, { name, contact, phone, address, notes });
    } else {
      await createProvider({ name, contact, phone, address, notes });
    }
    setShowForm(false); setEditing(null); setName(''); setContact(''); setPhone(''); setAddress(''); setNotes('');
    loadData();
  };

  const handleEdit = (provider) => {
    setEditing(provider); setName(provider.name); setContact(provider.contact || ''); setPhone(provider.phone || ''); setAddress(provider.address || ''); setNotes(provider.notes || '');
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar proveedor?')) { await deleteProvider(id); loadData(); }
  };

  if (loading) return <div className="inv-loading">Cargando proveedores...</div>;

  return (
    <div>
      <div className="inv-header">
        <button className="btn-primary" onClick={() => { setEditing(null); setName(''); setContact(''); setPhone(''); setAddress(''); setNotes(''); setShowForm(true); }}><FaPlus /> Nuevo proveedor</button>
      </div>
      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{editing ? 'Editar' : 'Nuevo'} proveedor</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Nombre</label><input value={name} onChange={e => setName(e.target.value)} required /></div>
              <div className="form-group"><label>Contacto</label><input value={contact} onChange={e => setContact(e.target.value)} /></div>
              <div className="form-group"><label>Teléfono</label><input value={phone} onChange={e => setPhone(e.target.value)} /></div>
              <div className="form-group"><label>Dirección</label><input value={address} onChange={e => setAddress(e.target.value)} /></div>
              <div className="form-group"><label>Notas</label><textarea rows="2" value={notes} onChange={e => setNotes(e.target.value)} /></div>
              <button type="submit" className="btn-primary">Guardar</button>
            </form>
          </div>
        </div>
      )}
      <table className="inv-table">
        <thead><tr><th>Nombre</th><th>Contacto</th><th>Teléfono</th><th>Acciones</th></tr></thead>
        <tbody>
          {providers.map(p => (
            <tr key={p.id}>
              <td>{p.name}</td><td>{p.contact}</td><td>{p.phone}</td>
              <td>
                <button className="btn-edit" onClick={() => handleEdit(p)}><FaEdit /></button>
                <button className="btn-delete" onClick={() => handleDelete(p.id)}><FaTrash /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}