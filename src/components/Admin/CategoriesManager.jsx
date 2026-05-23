import { useState, useEffect } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api';
import CategoryForm from './CategoryForm';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

export default function CategoriesManager() {
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const loadCategories = async () => {
    const data = await getCategories();
    setCategories(data);
  };

  useEffect(() => { loadCategories(); }, []);

  // Cerrar modal con botón atrás del navegador
  useEffect(() => {
    if (showModal) {
      window.history.pushState({ modalOpen: true }, '');
      const handlePopState = () => {
        if (showModal) {
          setShowModal(false);
          setEditing(null);
        }
      };
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [showModal]);

  const showMessage = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar esta categoría?')) {
      await deleteCategory(id);
      loadCategories();
      showMessage('Categoría eliminada');
    }
  };

  return (
    <div>
      <div className="search-filter-bar">
        <button
          className="btn-primary"
          onClick={() => { setEditing(null); setShowModal(true); }}
        >
          <FaPlus /> Nueva categoría
        </button>
      </div>

      <div className="categories-grid">
        {categories.map(cat => (
          <div key={cat.id} className="product-card">
            <div className="product-image-preview">
              {cat.coverImage ? (
                <img src={cat.coverImage} alt={cat.name} />
              ) : (
                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  background: 'var(--bg-secondary)',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem'
                }}>
                  {/* Icono de la categoría renderizado con tamaño grande */}
                  {cat.icon && (
                    <span style={{ color: 'var(--accent)' }}>
                      {/* Como no podemos importar dinámicamente el icono aquí,
                          mostramos una pista para que el CSS lo pinte;
                          el formulario ya maneja la selección visual */}
                      {cat.icon.replace('Fa', '')}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="product-info">
              <h3>{cat.name}</h3>
              <div className="product-category" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ color: 'var(--accent)', fontSize: '1.2rem' }}>
                  {/* Renderizamos el icono real usando el mapeo de FaIcons */}
                  {/* Necesitamos una función auxiliar, la agrego abajo */}
                </span>
                {cat.icon}
              </div>
              <div className="product-actions">
                <button className="btn-edit" onClick={() => { setEditing(cat); setShowModal(true); }}>
                  <FaEdit /> Editar
                </button>
                <button className="btn-delete" onClick={() => handleDelete(cat.id)}>
                  <FaTrash /> Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          No hay categorías. ¡Crea la primera!
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
              {editing ? 'Editar categoría' : 'Nueva categoría'}
            </h2>
            <CategoryForm
              initialCategory={editing}
              onSuccess={() => {
                setShowModal(false);
                loadCategories();
                showMessage(editing ? 'Categoría actualizada' : 'Categoría creada');
              }}
              onCancel={() => setShowModal(false)}
            />
          </div>
        </div>
      )}

      {showToast && <div className="toast">{toastMessage}</div>}
    </div>
  );
}