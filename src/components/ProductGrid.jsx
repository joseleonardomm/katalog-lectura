import React from 'react';
import './ProductGrid.css';

function ProductGrid({ products, formatPrice, onProductClick, title, currency, exchangeRate, eurRate, onAddToCart }) {
  if (!products || products.length === 0) {
    return (
      <div className="product-grid-section">
        {title && <div className="section-title">{title}</div>}
        <div className="empty-state">
          <p>No se encontraron productos</p>
        </div>
      </div>
    );
  }

  // Función interna para formatear precios según la moneda seleccionada
  const formatProductPrice = (price) => {
    const num = Number(price);
    if (isNaN(num)) return '0.00';
    if (currency === 'BS') return `Bs ${(num * (exchangeRate || 1)).toFixed(2)}`;
    if (currency === 'EUR') return `€${(num * (eurRate || 0.9)).toFixed(2)}`;
    return `$${num.toFixed(2)}`;
  };

  const getFirstImage = (product) => {
    // Prioriza la imagen del primer color, luego images del producto, luego placeholder
    if (product.colors?.[0]?.images?.[0]) return product.colors[0].images[0];
    if (product.images?.[0]) return product.images[0];
    return 'https://via.placeholder.com/300';
  };

  return (
    <div className="product-grid-section">
      {title && <div className="section-title">{title}</div>}
      <div className="catalog-grid">
        {products.map((product) => {
          const effectivePrice = product.offerPrice || product.basePrice || 0;
          const firstImage = getFirstImage(product);

          return (
            <div
              key={product.id}
              className="catalog-item"
              onClick={() => onProductClick?.(product)}
            >
              <div className="catalog-image">
                <img src={firstImage} alt={product.name} loading="lazy" />
                {product.isOnOffer && <span className="offer-badge">Oferta</span>}
              </div>
              <div className="catalog-info">
                <h4>{product.name}</h4>
                <div className="product-price">
                  {product.isOnOffer ? (
                    <>
                      <span className="old-price">{formatProductPrice(product.basePrice)}</span>
                      <span className="sale-price">{formatProductPrice(effectivePrice)}</span>
                    </>
                  ) : (
                    <span>{formatProductPrice(effectivePrice)}</span>
                  )}
                </div>
                <button
                  className="btn-outline-orange quick-view"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart?.(product, 1, 0);
                  }}
                >
                  Ver detalles
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProductGrid;