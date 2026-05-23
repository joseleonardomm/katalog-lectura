import { useState, useEffect } from 'react';
import { getProducts, deleteProduct, getUserProductsCount, getCurrentUserPlan, getPlansConfig } from '../../api';
import ProductForm from './ProductForm';

export default function ProductsManager() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [productCount, setProductCount] = useState(0);
  const [planLimit, setPlanLimit] = useState(15);

  const loadProducts = async () => {
    const data = await getProducts();
    setProducts(data);
    const cats = [...new Set(data.map(p => p.category).filter(Boolean))];
    setCategories(cats);
    const count = await getUserProductsCount();
    setProductCount(count);
    
    const plan = await getCurrentUserPlan();
    const plansConfig = await getPlansConfig();
    const limitValue = plansConfig[plan]?.productLimit ?? null;
    setPlanLimit(limitValue === null ? Infinity : limitValue);
  };

  useEffect(() => { loadProducts(); }, []);

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

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar producto permanentemente?')) {
      await deleteProduct(id);
      loadProducts();
      showMessage('Producto eliminado');
    }
  };

  const showMessage = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSuccess = () => {
    setShowModal(false);
    setEditing(null);
    loadProducts();
    showMessage(editing ? 'Producto actualizado' : 'Producto creado');
  };

  const canAddProduct = productCount < planLimit;

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                        (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
    const matchCategory = categoryFilter ? p.category === categoryFilter : true;
    return matchSearch && matchCategory;
  });

  const getProductPrice = (product) => {
    let price = product.basePrice !== undefined && product.basePrice !== null ? product.basePrice : product.price;
    if (price === undefined || price === null) return 0;
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(num) ? 0 : num;
  };

  const getProductImage = (product) => {
    if (product.colors && product.colors.length > 0 && product.colors[0].images && product.colors[0].images.length > 0) {
      return product.colors[0].images[0];
    }
    if (product.baseImages && product.baseImages.length > 0) return product.baseImages[0];
    if (product.images && product.images.length > 0) return product.images[0];
    return null;
  };

  return (
    <div>
      <div className="search-filter-bar">
        <input type="text" placeholder="🔍 Buscar producto..." value={search} onChange={e => setSearch(e.target.value)} />
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="">📁 Todas las categorías</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      {!canAddProduct && (
        <div style={{ background: '#fff3cd', color: '#856404', padding: '10px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
          ⚠️ Has alcanzado el límite de {planLimit === Infinity ? 'ilimitado' : planLimit} productos de tu plan actual. Mejora para agregar más.
        </div>
      )}

      <div className="products-grid">
        {filteredProducts.map(p => (
          <div key={p.id} className="product-card">
            <div className="product-image-preview">
              {getProductImage(p) ? (
                <img src={getProductImage(p)} alt={p.name} />
              ) : (
                <div style={{ padding: '40px', color: '#a0aec0' }}>📷 Sin imagen</div>
              )}
            </div>
            <div className="product-info">
              <h3>{p.name || 'Sin nombre'}</h3>
              <div className="product-category">{p.category || 'General'}</div>
              <div className="product-price">${getProductPrice(p).toFixed(2)}</div>
              {p.isOnSale && p.salePrice && (
                <div className="product-sale-badge" style={{ background: '#e53e3e', color: 'white', padding: '2px 8px', borderRadius: '20px', fontSize: '0.7rem', display: 'inline-block', marginTop: '5px' }}>
                  Oferta: ${typeof p.salePrice === 'number' ? p.salePrice.toFixed(2) : parseFloat(p.salePrice).toFixed(2)}
                </div>
              )}
              <div className="product-actions">
                <button className="btn-edit" onClick={() => { setEditing(p); setShowModal(true); }}>✏️ Editar</button>
                <button className="btn-delete" onClick={() => handleDelete(p.id)}>🗑️ Eliminar</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#718096' }}>No hay productos. ¡Crea uno nuevo!</div>
      )}

      <button className="add-product-btn" onClick={() => {
        if (!canAddProduct) {
          alert(`Has alcanzado el límite de ${planLimit === Infinity ? 'ilimitado' : planLimit} productos de tu plan. Mejora para agregar más.`);
          return;
        }
        setEditing(null);
        setShowModal(true);
      }} title="Agregar producto">+</button>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{editing ? '✏️ Editar Producto' : '➕ Nuevo Producto'}</h2>
            <ProductForm initialProduct={editing} onSuccess={handleSuccess} onCancel={() => setShowModal(false)} categories={categories} />
          </div>
        </div>
      )}

      {showToast && <div className="toast">{toastMessage}</div>}
    </div>
  );
}