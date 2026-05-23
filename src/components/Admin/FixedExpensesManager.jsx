import { useState, useEffect } from 'react';
import { getFixedExpenses, createFixedExpense, updateFixedExpense, deleteFixedExpense } from '../../api';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import './FixedExpensesManager.css';

export default function FixedExpensesManager() {
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const data = await getFixedExpenses();
    setExpenses(data);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const expense = { name, amount, category, dayOfMonth, active };
    if (editing) {
      await updateFixedExpense(editing.id, expense);
    } else {
      await createFixedExpense(expense);
    }
    setShowForm(false);
    setEditing(null);
    resetForm();
    loadData();
  };

  const handleEdit = (expense) => {
    setEditing(expense);
    setName(expense.name);
    setAmount(expense.amount);
    setCategory(expense.category || '');
    setDayOfMonth(expense.dayOfMonth || 1);
    setActive(expense.active);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar gasto fijo?')) {
      await deleteFixedExpense(id);
      loadData();
    }
  };

  const resetForm = () => {
    setName('');
    setAmount(0);
    setCategory('');
    setDayOfMonth(1);
    setActive(true);
  };

  if (loading) return <div className="inv-loading">Cargando gastos fijos...</div>;

  return (
    <div>
      <div className="inv-header">
        <button className="btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
          <FaPlus /> Nuevo gasto fijo
        </button>
      </div>

      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{editing ? 'Editar' : 'Nuevo'} gasto fijo</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre</label>
                <input value={name} onChange={e => setName(e.target.value)} required placeholder="Ej. Alquiler" />
              </div>
              <div className="form-group">
                <label>Monto</label>
                <input type="number" step="0.01" value={amount} onChange={e => setAmount(Number(e.target.value))} required />
              </div>
              <div className="form-group">
                <label>Categoría</label>
                <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Ej. Servicios" />
              </div>
              <div className="form-group">
                <label>Día del mes (1-28)</label>
                <input type="number" min="1" max="28" value={dayOfMonth} onChange={e => setDayOfMonth(Number(e.target.value))} />
              </div>
              <div className="toggle-group" onClick={() => setActive(!active)}>
                <span className="toggle-label">Activo</span>
                <span className={`toggle-slider ${active ? 'active' : ''}`}></span>
              </div>
              <button type="submit" className="btn-primary">Guardar</button>
            </form>
          </div>
        </div>
      )}

      <div className="fixed-expenses-grid">
        {expenses.map(exp => (
          <div key={exp.id} className={`fixed-expense-card ${!exp.active ? 'inactive' : ''}`}>
            <div className="card-header">
              <h4>{exp.name}</h4>
              <div className="card-actions">
                <button className="btn-edit" onClick={() => handleEdit(exp)}><FaEdit /></button>
                <button className="btn-delete" onClick={() => handleDelete(exp.id)}><FaTrash /></button>
              </div>
            </div>
            <div className="card-details">
              <p><strong>Monto:</strong> ${exp.amount?.toFixed(2)}</p>
              <p><strong>Día:</strong> {exp.dayOfMonth || 1}</p>
              {exp.category && <p><strong>Categoría:</strong> {exp.category}</p>}
              <p><strong>Estado:</strong> {exp.active ? 'Activo' : 'Inactivo'}</p>
            </div>
          </div>
        ))}
      </div>
      {expenses.length === 0 && (
        <div className="inv-loading">No hay gastos fijos configurados.</div>
      )}
    </div>
  );
}