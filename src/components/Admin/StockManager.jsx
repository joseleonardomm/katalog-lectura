import { useState, useEffect } from 'react';
import { getProducts, getCategories } from '../../api';
import { FaSearch, FaDownload, FaSortAmountDown } from 'react-icons/fa';
import './StockManager.css';

export default function StockManager() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [onlyOnSale, setOnlyOnSale] = useState(false);
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [sortBy, setSortBy] = useState('name'); // 'name', 'price', 'stock'

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
    setProducts(prods);
    setCategories(cats);
    setLoading(false);
  };

  // Calcular stock total de un producto (suma de todos los colores)
  const totalStock = (product) =>
    product.colors?.reduce((sum, color) => sum + (color.stock || 0), 0) || 0;

  // Formatear precio de forma segura
  const formatMoney = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? '—' : `$${num.toFixed(2)}`;
  };

  // Aplicar filtros y ordenación
  const filteredProducts = products
    .filter((product) => {
      // Búsqueda
      if (search && !product.name.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      // Categoría
      if (filterCategory && product.category !== filterCategory) {
        return false;
      }
      // Solo ofertas
      if (onlyOnSale && !product.isOnSale) {
        return false;
      }
      // Solo stock bajo (≤ 5 unidades totales)
      if (onlyLowStock && totalStock(product) > 5) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price') return (b.basePrice || 0) - (a.basePrice || 0);
      if (sortBy === 'stock') return totalStock(b) - totalStock(a);
      return 0;
    });

  // Descargar CSV
  const downloadCSV = () => {
    const rows = [['Producto', 'Categoría', 'Costo', 'Venta', 'Stock total', 'Oferta']];
    filteredProducts.forEach((p) => {
      rows.push([
        p.name,
        p.category || '',
        formatMoney(p.costPrice),
        formatMoney(p.basePrice),
        totalStock(p),
        p.isOnSale ? 'Sí' : 'No',
      ]);
    });
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stock.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="inv-loading">Cargando stock...</div>;

  return (
    <div className="stock-manager-v2">
      {/* Cabecera con título y descarga */}
      <div className="stock-header">
        <h3>Estado del inventario</h3>
        <button className="btn-secondary" onClick={downloadCSV}>
          <FaDownload /> Descargar CSV
        </button>
      </div>

      {/* Panel de filtros */}
      <div className="stock-filters">
        <div className="filter-search-box">
          <FaSearch className="filter-icon" />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="filter-input"
          />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="filter-select"
        >
          <option value="">📁 Todas las categorías</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="filter-select"
        >
          <option value="name">Ordenar por nombre</option>
          <option value="price">Ordenar por precio</option>
          <option value="stock">Ordenar por stock</option>
        </select>

        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={onlyOnSale}
            onChange={() => setOnlyOnSale(!onlyOnSale)}
          />
          Solo ofertas
        </label>

        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={onlyLowStock}
            onChange={() => setOnlyLowStock(!onlyLowStock)}
          />
          Stock bajo (≤ 5 uds.)
        </label>

        {(search || filterCategory || onlyOnSale || onlyLowStock || sortBy !== 'name') && (
          <button
            className="btn-clear-filters"
            onClick={() => {
              setSearch('');
              setFilterCategory('');
              setOnlyOnSale(false);
              setOnlyLowStock(false);
              setSortBy('name');
            }}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Cuadrícula de productos */}
      <div className="stock-grid">
        {filteredProducts.map((product) => {
          const total = totalStock(product);
          const lowStock = total <= 5;
          const maxStock = 100; // referencia para la barra
          const percentage = Math.min(100, Math.round((total / maxStock) * 100));

          return (
            <div
              key={product.id}
              className={`stock-card ${lowStock ? 'low-stock' : ''}`}
            >
              <div className="stock-card-header">
                <h4>{product.name}</h4>
                <span className={`stock-badge ${lowStock ? 'danger' : ''}`}>
                  {total} uds.
                </span>
              </div>

              {/* Barra de progreso */}
              <div className="stock-bar-bg">
                <div
                  className={`stock-bar-fill ${lowStock ? 'danger' : ''}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>

              <div className="stock-details">
                <div className="stock-prices">
                  <span>Costo: {formatMoney(product.costPrice)}</span>
                  <span>Venta: {formatMoney(product.basePrice)}</span>
                </div>

                {/* Desglose por colores (colapsable) */}
                <details className="stock-colors-details">
                  <summary>Colores ({product.colors?.length || 0})</summary>
                  <div className="stock-colors">
                    {product.colors?.map((color, idx) => (
                      <div key={idx} className="stock-color-row">
                        <span className="color-name">{color.name}</span>
                        <span className={`color-stock ${(color.stock || 0) <= 3 ? 'low' : ''}`}>
                          {color.stock || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="inv-loading">No se encontraron productos.</div>
      )}
    </div>
  );
}