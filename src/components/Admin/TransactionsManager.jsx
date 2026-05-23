import { useState, useEffect } from 'react';
import { getTransactions, createTransaction, getFixedExpenses } from '../../api';
import { FaPlus, FaDownload, FaFilter } from 'react-icons/fa';
import './TransactionsManager.css';

const PERIODS = {
  'all': 'Todo',
  '15d': 'Últimos 15 días',
  '30d': 'Últimos 30 días',
  'thisMonth': 'Este mes',
  'custom': 'Personalizado',
};

export default function TransactionsManager() {
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [type, setType] = useState('gasto_operativo');
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  // Filtro de fecha
  const [period, setPeriod] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    const checkFixedExpenses = async () => {
      const fixed = await getFixedExpenses();
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;

      // Obtener transacciones existentes primero
      let existingTransactions = await getTransactions();

      for (const exp of fixed) {
        if (!exp.active) continue;
        const day = exp.dayOfMonth || 1;
        const targetDate = new Date(now.getFullYear(), now.getMonth(), day);
        const transKey = `fixed-${exp.id}-${currentMonth}`;

        const alreadyExists = existingTransactions.some(
          t => t.description?.includes(transKey)
        );
        if (!alreadyExists && targetDate <= now) {
          await createTransaction({
            type: 'gasto_operativo',
            amount: exp.amount,
            description: `${exp.name} (gasto fijo) [${transKey}]`,
            category: exp.category || '',
          });
        }
      }
      // Recargar después de registrar
      const t = await getTransactions();
      setTransactions(t);
      setLoading(false);
    };
    checkFixedExpenses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createTransaction({ type, amount, description, category });
    setShowForm(false);
    setAmount(0);
    setDescription('');
    setCategory('');
    const t = await getTransactions();
    setTransactions(t);
  };

  const downloadCSV = () => {
    const rows = [['Fecha', 'Tipo', 'Monto', 'Descripción']];
    filteredTransactions.forEach(t => {
      rows.push([
        new Date(t.date).toLocaleDateString(),
        t.type,
        (t.type === 'venta' || t.type === 'otro_ingreso' ? '+' : '-') + t.amount.toFixed(2),
        t.description
      ]);
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'finanzas.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const filteredTransactions = transactions.filter(t => {
    const d = new Date(t.date);
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

  const typeLabels = {
    venta: 'Venta',
    compra_proveedor: 'Compra',
    gasto_operativo: 'Gasto operativo',
    otro_ingreso: 'Otro ingreso',
    otro_egreso: 'Otro egreso'
  };

  if (loading) return <div className="inv-loading">Cargando movimientos...</div>;

  return (
    <div>
      <div className="inv-header">
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <FaPlus /> Nuevo movimiento
        </button>
        <button className="btn-secondary" onClick={downloadCSV}>
          <FaDownload /> Descargar CSV
        </button>
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
            <h3>Nuevo movimiento</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tipo</label>
                <select value={type} onChange={e => setType(e.target.value)}>
                  <option value="gasto_operativo">Gasto operativo</option>
                  <option value="otro_ingreso">Otro ingreso</option>
                  <option value="otro_egreso">Otro egreso</option>
                </select>
              </div>
              <div className="form-group">
                <label>Monto</label>
                <input type="number" step="0.01" value={amount} onChange={e => setAmount(Number(e.target.value))} required />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <input value={description} onChange={e => setDescription(e.target.value)} required />
              </div>
              {type === 'gasto_operativo' && (
                <div className="form-group">
                  <label>Categoría</label>
                  <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Ej. Servicios, Materiales" />
                </div>
              )}
              <button type="submit" className="btn-primary">Guardar</button>
            </form>
          </div>
        </div>
      )}

      <table className="inv-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Monto</th>
            <th>Descripción</th>
          </tr>
        </thead>
        <tbody>
          {filteredTransactions.map(t => (
            <tr key={t.id}>
              <td>{new Date(t.date).toLocaleDateString()}</td>
              <td>{typeLabels[t.type] || t.type}</td>
              <td style={{ color: t.type === 'venta' || t.type === 'otro_ingreso' ? 'var(--success)' : 'var(--danger)' }}>
                {(t.type === 'venta' || t.type === 'otro_ingreso' ? '+' : '-') + t.amount.toFixed(2)}
              </td>
              <td>{t.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {filteredTransactions.length === 0 && !loading && (
        <div className="inv-loading">No hay movimientos registrados.</div>
      )}
    </div>
  );
}