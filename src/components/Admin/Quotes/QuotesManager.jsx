import { useState, useEffect } from 'react';
import { getQuotes, deleteQuote, getCompanyInfo, updateCompanyInfo } from '../../../api';
import { FaPlus, FaTrash, FaEdit, FaSearch, FaEye, FaCog } from 'react-icons/fa';
import QuoteForm from './QuoteForm';
import QuotePreview from './QuotePreview';
import './QuotesManager.css';

export default function QuotesManager({ showMessage }) {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingQuote, setEditingQuote] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [previewQuote, setPreviewQuote] = useState(null);
  const [companyInfo, setCompanyInfo] = useState({
    name: '',
    logo: '',
    phone: '',
    email: '',
    address: '',
    rif: '',
    accentColor: '#ff8c42'
  });
  const [showCompanySettings, setShowCompanySettings] = useState(false);
  const [companyForm, setCompanyForm] = useState({ ...companyInfo });

  useEffect(() => {
    loadQuotes();
    loadCompanyInfo();
  }, []);

  const loadQuotes = async () => {
    const data = await getQuotes();
    setQuotes(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    setLoading(false);
  };

  const loadCompanyInfo = async () => {
    const saved = await getCompanyInfo();
    if (saved) {
      const info = {
        name: saved.name || '',
        logo: saved.logo || '',
        phone: saved.phone || '',
        email: saved.email || '',
        address: saved.address || '',
        rif: saved.rif || '',
        accentColor: saved.accentColor || '#ff8c42'
      };
      setCompanyInfo(info);
      setCompanyForm(info);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar esta cotización?')) {
      await deleteQuote(id);
      loadQuotes();
      showMessage('success', 'Cotización eliminada');
    }
  };

  const handleEdit = (quote) => {
    setEditingQuote(quote);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingQuote(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingQuote(null);
    loadQuotes();
  };

  const handleSaveCompanySettings = async () => {
    await updateCompanyInfo(companyForm);
    setCompanyInfo({ ...companyForm });
    setShowCompanySettings(false);
    showMessage('success', 'Datos de la empresa actualizados');
  };

  const filteredQuotes = quotes.filter(q => {
    const matchesSearch =
      q.client?.name?.toLowerCase().includes(search.toLowerCase()) ||
      q.quoteNumber?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = ['all', 'pending', 'in_progress', 'accepted', 'rejected', 'expired'];
  const statusLabels = {
    all: 'Todos',
    pending: 'Pendientes',
    in_progress: 'En proceso',
    accepted: 'Aceptadas',
    rejected: 'Rechazadas',
    expired: 'Expiradas'
  };

  const getStatusBadge = (status) => {
    const classes = `status-badge status-${status}`;
    const labels = {
      pending: 'Pendiente',
      in_progress: 'En proceso',
      accepted: 'Aceptada',
      rejected: 'Rechazada',
      expired: 'Expirada'
    };
    return <span className={classes}>{labels[status] || status}</span>;
  };

  if (loading) return <div className="quotes-loading">Cargando cotizaciones...</div>;

  return (
    <div className="quotes-manager">
      <div className="quotes-header">
        <h2>Cotizaciones</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-secondary" onClick={() => setShowCompanySettings(true)}>
            <FaCog /> Configurar empresa
          </button>
          <button className="btn-primary" onClick={handleNew}>
            <FaPlus /> Nueva cotización
          </button>
        </div>
      </div>

      <div className="quotes-filters">
        <div className="search-bar">
          <FaSearch />
          <input
            type="text"
            placeholder="Buscar por cliente o número..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="status-filters">
          {statusOptions.map(opt => (
            <button
              key={opt}
              className={`btn-chip ${statusFilter === opt ? 'active' : ''}`}
              onClick={() => setStatusFilter(opt)}
            >
              {statusLabels[opt]}
            </button>
          ))}
        </div>
      </div>

      <div className="quotes-table-container">
        <table className="quotes-table">
          <thead>
            <tr>
              <th>N°</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuotes.map(quote => (
              <tr key={quote.id}>
                <td>{quote.quoteNumber || `#${quote.id.slice(-6)}`}</td>
                <td>
                  <div>{quote.client?.name || '—'}</div>
                  {quote.client?.phone && (
                    <a
                      href={`https://wa.me/${quote.client.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      className="client-phone"
                      title="Contactar por WhatsApp"
                    >
                      <FaSearch /> {quote.client.phone}
                    </a>
                  )}
                </td>
                <td>${quote.total?.toFixed(2) || '0.00'}</td>
                <td>{getStatusBadge(quote.status)}</td>
                <td>{new Date(quote.createdAt).toLocaleDateString()}</td>
                <td className="actions-cell">
                  <button className="btn-icon" onClick={() => setPreviewQuote(quote)} title="Vista previa">
                    <FaEye />
                  </button>
                  <button className="btn-icon" onClick={() => handleEdit(quote)} title="Editar">
                    <FaEdit />
                  </button>
                  <button className="btn-icon btn-danger" onClick={() => handleDelete(quote.id)} title="Eliminar">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
            {filteredQuotes.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-message">No se encontraron cotizaciones</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <QuoteForm
          initialQuote={editingQuote}
          companyInfo={companyInfo}
          onClose={handleFormClose}
          showMessage={showMessage}
        />
      )}

      {previewQuote && (
        <QuotePreview
          quote={previewQuote}
          companyInfo={previewQuote.companyInfo || companyInfo}
          onClose={() => setPreviewQuote(null)}
        />
      )}

      {/* Modal de configuración de datos de la empresa */}
      {showCompanySettings && (
        <div className="modal-backdrop" onClick={() => setShowCompanySettings(false)}>
          <div className="modal-content" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1rem' }}>Datos predeterminados de la empresa</h3>
            <div className="form-section">
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre</label>
                  <input
                    value={companyForm.name}
                    onChange={e => setCompanyForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nombre de la empresa"
                  />
                </div>
                <div className="form-group">
                  <label>Logo URL</label>
                  <input
                    value={companyForm.logo}
                    onChange={e => setCompanyForm(prev => ({ ...prev, logo: e.target.value }))}
                    placeholder="URL del logo"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>RIF / Registro</label>
                  <input
                    value={companyForm.rif}
                    onChange={e => setCompanyForm(prev => ({ ...prev, rif: e.target.value }))}
                    placeholder="J-12345678-9"
                  />
                </div>
                <div className="form-group">
                  <label>Color de acento</label>
                  <div className="bim-color-picker">
                    <input
                      type="color"
                      value={companyForm.accentColor || '#ff8c42'}
                      onChange={e => setCompanyForm(prev => ({ ...prev, accentColor: e.target.value }))}
                    />
                    <span className="bim-color-value">{companyForm.accentColor || '#ff8c42'}</span>
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    value={companyForm.phone}
                    onChange={e => setCompanyForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Teléfono"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    value={companyForm.email}
                    onChange={e => setCompanyForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Email"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Dirección</label>
                <input
                  value={companyForm.address}
                  onChange={e => setCompanyForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Dirección"
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowCompanySettings(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleSaveCompanySettings}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}