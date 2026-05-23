import React from 'react';
import './ProductGrid.css';

function ProductGrid({ products, formatPrice, onProductClick, title }) {
  if (products.length === 0) {
    return (
      <div className="product-grid-section">
        <div className="section-title">{title}</div>
        <div className="empty-state">
          <p>No se encontraron productos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-grid-section">
      <div className="section-title">{title}</div>
      <div className="catalog-grid">
        {products.map((product) => (
          <div
            key={product.id}
            className="catalog-item"
            onClick={() => onProductClick(product)}
          >
            <div className="catalog-image">
              <img src={product.images[0]} alt={product.name} loading="lazy" />
            </div>
            <div className="catalog-info">
              <h4>{product.name}</h4>
              <div className="product-price">{formatPrice(product.priceUSD)}</div>
              <button className="btn-outline-orange quick-view">Ver detalles</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductGrid;