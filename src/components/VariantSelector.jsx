import React, { useState, useEffect } from 'react';
import './VariantSelector.css';

function VariantSelector({ product, formatPrice, onVariantChange }) {
  const [selectedOptions, setSelectedOptions] = useState({});
  const [currentVariant, setCurrentVariant] = useState(null);

  useEffect(() => {
    if (!product.hasVariants) return;
    const initial = {};
    product.variantTypes.forEach(vt => {
      if (vt.values.length) initial[vt.name] = vt.values[0];
    });
    setSelectedOptions(initial);
  }, [product]);

  useEffect(() => {
    if (!product.hasVariants) return;
    const variant = product.variants.find(v =>
      Object.entries(v.combination).every(([key, val]) => selectedOptions[key] === val)
    );
    setCurrentVariant(variant);
    if (onVariantChange) onVariantChange(variant);
  }, [selectedOptions, product, onVariantChange]);

  const handleOptionChange = (type, value) => {
    setSelectedOptions(prev => ({ ...prev, [type]: value }));
  };

  if (!product.hasVariants) return null;

  return (
    <div className="variant-selector">
      {product.variantTypes.map(vt => (
        <div key={vt.name} className="variant-group">
          <label>{vt.name}:</label>
          <div className="variant-options">
            {vt.values.map(val => (
              <button
                key={val}
                className={`variant-option ${selectedOptions[vt.name] === val ? 'active' : ''}`}
                onClick={() => handleOptionChange(vt.name, val)}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      ))}
      {currentVariant && (
        <div className="variant-info">
          {currentVariant.price !== undefined && currentVariant.price !== null && (
            <div className="variant-price">Precio: {formatPrice({ price: currentVariant.price, priceCurrency: product.priceCurrency })}</div>
          )}
          <div className="variant-stock">Stock: {currentVariant.stock > 0 ? `${currentVariant.stock} disponibles` : 'Agotado'}</div>
          {currentVariant.images && currentVariant.images.length > 0 && (
            <div className="variant-images">
              {currentVariant.images.map((img, idx) => (
                <img key={idx} src={img} alt={`Vista ${idx+1}`} style={{ width: '50px', borderRadius: '8px', marginRight: '8px' }} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default VariantSelector;