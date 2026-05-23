import { useState, useEffect } from 'react';
import { getPurchases, createPurchase, getProducts, getProviders } from '../../api';
import { FaPlus, FaDownload, FaFilter } from 'react-icons/fa';
import './PurchasesManager.css';

const PERIODS = {
  'all': 'Todo',
  '15d': 'Últimos 15 días',
  '30d': 'Últimos 30 días',
  'thisMonth': 'Este mes',
  'custom': 'Personalizado',
};

export default function PurchasesManager() {
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [providers, setProviders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [providerId, setProviderId] = useState('');
  const [providerName, setProviderName] = useState('');
  const [useOccasional, setUseOccasional] = useState(false);
  const [items, setItems] = useState([{ productId: '', colorIndex: 0, quantity: 1, unitCost: 0 }]);
  const [notes, setNotes] = useState('');

  // Filtro de fecha
  const [period, setPeriod] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => { loadData(); }, []);
  const loadData = async () => {
    const [pu, pr, pv] = await Promise.all([getPurchases(), getProducts(), getProviders()]);
    setPurchases(pu); setProducts(pr); setProviders(pv); setLoading(false);
  };

  const addItem = () => setItems([...items, { productId: '', colorIndex: 0, quantity: 1, unitCost: 0 }]);
  const updateItem = (index, field, value) => {
    const updated = [...items]; updated[index][field] = value; setItems(updated);
  };
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));
  const total = items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.some(i => !i.productId || i.quantity < 1)) { alert('Completa todos los campos'); return; }
    const purchase = { items, total, notes, providerId: useOccasional ? null : providerId, providerName: useOccasional ? providerName : '' };
    await createPurchase(purchase);
    setShowForm(false); setItems([{ productId: '', colorIndex: 0, quantity: 1, unitCost: 0 }]); setNotes(''); loadData();
  };

  const downloadCSV = () => {
    const rows = [['Fecha', 'Proveedor', 'Productos', 'Total']];
    filteredPurchases.forEach(p => {
      const productsStr = p.items.map(i => { const prod = products.find(pr => pr.id === i.productId); return `${prod?.name || '?'} x${i.quantity}`; }).join('; ');
      rows.push([new Date(p.date).toLocaleDateString(), p.providerName || providers.find(pv => pv.id === p.providerId)?.name || 'Ocasional', productsStr, p.total.toFixed(2)]);
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'compras.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const filteredPurchases = purchases.filter(p => {
    const d = new Date(p.date);
    const now = new Date();
    if (period === 'all') return true;
    if (period === '15d') { const limit = new Date(); limit.setDate(now.getDate() - 15); return d >= limit; }
    if (period === '30d') { const limit = new Date(); limit.setDate(now.getDate() - 30); return d >= limit; }
    if (period === 'thisMonth') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (period === 'custom') {
      if (dateFrom && d < new Date(dateFrom + 'T00:00')) return false;
      if (dateTo && d > new Date(dateTo + 'T23:59')) return false;
      return true;
    }
    return true;
  });

  if (loading) return <div className="inv-loading">Cargando compras...</div>;

  return (
    <div>
      <div className="inv-header">
        <button className="btn-primary" onClick={() => setShowForm(true)}><FaPlus /> Nueva compra</button>
        <button className="btn-secondary" onClick={downloadCSV}><FaDownload /> Descargar CSV</button>
      </div>

      {/* Filtro de fecha */}
      <div className="stock-filters" style={{ marginBottom: '1rem' }}>
        <FaFilter style={{ color: 'var(--text-secondary)' }} />
        <select value={period} onChange={e => setPeriod(e.target.value)} className="filter-select">
          {Object.entries(PERIODS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        {period === 'custom' && (
          <>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="filter-select" />
            <span style={{ color: 'var(--text-secondary)' }}>—</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="filter-select" />
          </>
        )}
        {period !== 'all' && (
          <button className="btn-clear-filters" onClick={() => { setPeriod('all'); setDateFrom(''); setDateTo(''); }}>
            Limpiar
          </button>
        )}
      </div>

      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Nueva compra</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group checkbox-group">
                <label><input type="checkbox" checked={useOccasional} onChange={() => setUseOccasional(!useOccasional)} /> Proveedor ocasional</label>
              </div>
              {useOccasional ? (
                <div className="form-group"><label>Nombre del proveedor</label><input value={providerName} onChange={e => setProviderName(e.target.value)} required /></div>
              ) : (
                <div className="form-group"><label>Proveedor</label><select value={providerId} onChange={e => setProviderId(e.target.value)}><option value="">Seleccionar...</option>{providers.map(pv => <option key={pv.id} value={pv.id}>{pv.name}</option>)}</select></div>
              )}
              {items.map((item, idx) => (
                <div key={idx} className="item-row">
                  <select value={item.productId} onChange={e => updateItem(idx, 'productId', e.target.value)}>
                    <option value="">Producto</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <select value={item.colorIndex} onChange={e => updateItem(idx, 'colorIndex', Number(e.target.value))}>
                    {products.find(p => p.id === item.productId)?.colors.map((c, i) => <option key={i} value={i}>{c.name}</option>)}
                  </select>
                  <input type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', Number(e.target.value))} />
                  <input type="number" step="0.01" value={item.unitCost} onChange={e => updateItem(idx, 'unitCost', Number(e.target.value))} />
                  {items.length > 1 && <button type="button" className="btn-remove" onClick={() => removeItem(idx)}>✕</button>}
                </div>
              ))}
              <button type="button" className="btn-add" onClick={addItem}>+ Agregar producto</button>
              <div className="form-group"><label>Notas</label><textarea rows="2" value={notes} onChange={e => setNotes(e.target.value)} /></div>
              <p><strong>Total: ${total.toFixed(2)}</strong></p>
              <button type="submit" className="btn-primary">Guardar compra</button>
            </form>
          </div>
        </div>
      )}
      <table className="inv-table">
        <thead><tr><th>Fecha</th><th>Proveedor</th><th>Productos</th><th>Total</th></tr></thead>
        <tbody>
          {filteredPurchases.map(p => (
            <tr key={p.id}>
              <td>{new Date(p.date).toLocaleDateString()}</td>
              <td>{p.providerName || providers.find(pv => pv.id === p.providerId)?.name || 'Ocasional'}</td>
              <td>{p.items.map(i => `${products.find(pr => pr.id === i.productId)?.name || '?'} x${i.quantity}`).join(', ')}</td>
              <td>${p.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {filteredPurchases.length === 0 && <div className="inv-loading">No se encontraron compras.</div>}
    </div>
  );
}