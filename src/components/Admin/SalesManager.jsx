import { useState, useEffect } from 'react';
import { getSales, createSale, getProducts } from '../../api';
import { FaPlus, FaDownload, FaFilter } from 'react-icons/fa';
import './SalesManager.css';

const PERIODS = {
  'all': 'Todo',
  '15d': 'Últimos 15 días',
  '30d': 'Últimos 30 días',
  'thisMonth': 'Este mes',
  'custom': 'Personalizado',
};

export default function SalesManager() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [client, setClient] = useState('');
  const [items, setItems] = useState([{ productId: '', colorIndex: 0, quantity: 1, unitPrice: 0 }]);
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [notes, setNotes] = useState('');

  // Filtro de fecha
  const [period, setPeriod] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => { loadData(); }, []);
  const loadData = async () => {
    const [s, p] = await Promise.all([getSales(), getProducts()]);
    setSales(s);
    setProducts(p);
    setLoading(false);
  };

  const addItem = () => setItems([...items, { productId: '', colorIndex: 0, quantity: 1, unitPrice: 0 }]);
  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    if (field === 'productId') {
      const prod = products.find(p => p.id === value);
      if (prod) updated[index].unitPrice = prod.basePrice;
    }
    setItems(updated);
  };
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));
  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!client || items.some(i => !i.productId || i.quantity < 1)) {
      alert('Completa todos los campos');
      return;
    }
    await createSale({ client, items, total, paymentMethod, notes });
    setShowForm(false);
    setClient('');
    setItems([{ productId: '', colorIndex: 0, quantity: 1, unitPrice: 0 }]);
    setPaymentMethod('efectivo');
    setNotes('');
    loadData();
  };

  const downloadCSV = () => {
    const rows = [['Fecha', 'Cliente', 'Productos', 'Total', 'Método']];
    filteredSales.forEach(s => {
      const productsStr = s.items.map(i => {
        const p = products.find(pr => pr.id === i.productId);
        return `${p?.name || '?'} x${i.quantity}`;
      }).join('; ');
      rows.push([new Date(s.date).toLocaleDateString(), s.client, productsStr, s.total.toFixed(2), s.paymentMethod]);
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'ventas.csv'; a.click(); URL.revokeObjectURL(url);
  };

  // Filtrado por fecha
  const filteredSales = sales.filter(s => {
    const d = new Date(s.date);
    const now = new Date();
    if (period === 'all') return true;
    if (period === '15d') {
      const limit = new Date(); limit.setDate(now.getDate() - 15);
      return d >= limit;
    }
    if (period === '30d') {
      const limit = new Date(); limit.setDate(now.getDate() - 30);
      return d >= limit;
    }
    if (period === 'thisMonth') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    if (period === 'custom') {
      if (dateFrom && d < new Date(dateFrom + 'T00:00')) return false;
      if (dateTo && d > new Date(dateTo + 'T23:59')) return false;
      return true;
    }
    return true;
  });

  if (loading) return <div className="inv-loading">Cargando ventas...</div>;

  return (
    <div>
      <div className="inv-header">
        <button className="btn-primary" onClick={() => setShowForm(true)}><FaPlus /> Nueva venta</button>
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
            <h3>Nueva venta</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Cliente</label><input value={client} onChange={e => setClient(e.target.value)} required /></div>
              {items.map((item, idx) => (
                <div key={idx} className="item-row">
                  <select value={item.productId} onChange={e => updateItem(idx, 'productId', e.target.value)}>
                    <option value="">Producto</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <select value={item.colorIndex} onChange={e => updateItem(idx, 'colorIndex', Number(e.target.value))}>
                    {products.find(p => p.id === item.productId)?.colors.map((c, i) => (
                      <option key={i} value={i}>{c.name}</option>
                    ))}
                  </select>
                  <input type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', Number(e.target.value))} />
                  <input type="number" step="0.01" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', Number(e.target.value))} />
                  {items.length > 1 && <button type="button" className="btn-remove" onClick={() => removeItem(idx)}>✕</button>}
                </div>
              ))}
              <button type="button" className="btn-add" onClick={addItem}>+ Agregar producto</button>
              <div className="form-group"><label>Método de pago</label>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="pago_movil">Pago móvil</option>
                </select>
              </div>
              <div className="form-group"><label>Notas</label><textarea rows="2" value={notes} onChange={e => setNotes(e.target.value)} /></div>
              <p><strong>Total: ${total.toFixed(2)}</strong></p>
              <button type="submit" className="btn-primary">Guardar venta</button>
            </form>
          </div>
        </div>
      )}

      <table className="inv-table">
        <thead><tr><th>Fecha</th><th>Cliente</th><th>Productos</th><th>Total</th><th>Método</th></tr></thead>
        <tbody>
          {filteredSales.map(s => (
            <tr key={s.id}>
              <td>{new Date(s.date).toLocaleDateString()}</td>
              <td>{s.client}</td>
              <td>{s.items.map(i => `${products.find(p => p.id === i.productId)?.name || '?'} x${i.quantity}`).join(', ')}</td>
              <td>${s.total.toFixed(2)}</td>
              <td>{s.paymentMethod}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {filteredSales.length === 0 && <div className="inv-loading">No se encontraron ventas.</div>}
    </div>
  );
}