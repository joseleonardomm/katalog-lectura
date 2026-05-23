import React, { useState, useEffect } from 'react';
import { FaWhatsapp, FaCartPlus, FaMinus, FaPlus, FaShare } from 'react-icons/fa';
import './ProductModal.css';

function ProductModal({ isOpen, product, onClose, onAddToCart, formatPrice, currency, config }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(null);
  const [currentImages, setCurrentImages] = useState([]);
  const [availableStock, setAvailableStock] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.history.pushState({ modalOpen: true }, '');
      const handlePopState = () => {
        if (isOpen) onClose();
      };
      window.addEventListener('popstate', handlePopState);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('popstate', handlePopState);
        if (window.history.state?.modalOpen) {
          window.history.replaceState(null, '', window.location.href);
        }
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (product) {
      setQuantity(1);
      setSelectedImageIndex(0);
      if (product.colors && product.colors.length > 0) {
        setSelectedColor(product.colors[0]);
        setCurrentImages(product.colors[0].images || []);
        setAvailableStock(product.colors[0].stock || 0);
      } else {
        setSelectedColor(null);
        setCurrentImages([]);
        setAvailableStock(product.stock || 0);
      }
    }
  }, [product]);

  useEffect(() => {
    if (selectedColor) {
      setCurrentImages(selectedColor.images || []);
      setAvailableStock(selectedColor.stock || 0);
      setSelectedImageIndex(0);
      setQuantity(1);
    }
  }, [selectedColor]);

  if (!isOpen || !product) return null;

  const getEffectivePrice = () => {
    if (selectedColor?.price !== undefined && selectedColor?.price !== null) return selectedColor.price;
    if (product.isOnSale && product.salePrice && product.salePrice < product.basePrice) return product.salePrice;
    return product.basePrice;
  };

  const effectivePrice = getEffectivePrice();
  const colorDescription = selectedColor ? `Color: ${selectedColor.name}` : '';
  const productNameWithColor = colorDescription ? `${product.name} (${colorDescription})` : product.name;

  // Número de WhatsApp desde la configuración del administrador
  const whatsappNumber = config?.whatsappNumber || '';
  const whatsappMessage = `Hola! Me interesa ${productNameWithColor} (${formatPrice({ price: effectivePrice, priceCurrency: product.priceCurrency })}).`;

  const renderPrice = () => {
    if (product.isOnSale && product.salePrice && product.salePrice < product.basePrice && !selectedColor) {
      return (
        <div className="modal-price">
          <span className="old-price">{formatPrice({ price: product.basePrice, priceCurrency: product.priceCurrency })}</span>
          <span className="sale-price">{formatPrice({ price: product.salePrice, priceCurrency: product.priceCurrency })}</span>
        </div>
      );
    }
    return <div className="modal-price">{formatPrice({ price: effectivePrice, priceCurrency: product.priceCurrency })}</div>;
  };

  const handleAddToCart = () => {
    if (availableStock <= 0) return;
    onAddToCart(product, quantity, selectedColor, null, effectivePrice);
    onClose();
  };

  const getSwatchColor = (color) => color.colorValue || '#cccccc';

  const hasImages = currentImages.length > 0;
  const currentImage = hasImages ? currentImages[selectedImageIndex] : null;
  const isOutOfStock = availableStock <= 0;
  const showColorSelector = product.colors && product.colors.length > 1;

  // Compartir producto
  const handleShare = () => {
    const shareData = {
      title: product.name,
      text: `${productNameWithColor} – ${formatPrice({ price: effectivePrice, priceCurrency: product.priceCurrency })}`,
      url: window.location.href,
    };
    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(shareData.url);
      alert('Enlace copiado al portapapeles');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="modal-gallery">
          <div className="product-image-square">
            {currentImage ? <img src={currentImage} alt={product.name} /> : <div className="image-placeholder">Sin imagen</div>}
          </div>
          {hasImages && currentImages.length > 1 && (
            <div className="thumbnail-list">
              {currentImages.map((img, idx) => (
                <div
                  key={idx}
                  className={`thumbnail-item ${selectedImageIndex === idx ? 'active' : ''}`}
                  onClick={() => setSelectedImageIndex(idx)}
                >
                  <img src={img} alt={`miniatura ${idx + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-details">
          <h2>{product.name}</h2>
          {colorDescription && <div className="variant-description">{colorDescription}</div>}
          {renderPrice()}

          {showColorSelector && (
            <div className="color-selector">
              <span className="selector-label">Color:</span>
              <div className="color-swatches">
                {product.colors.map(color => (
                  <button
                    key={color.name}
                    className={`color-swatch ${selectedColor?.name === color.name ? 'active' : ''}`}
                    onClick={() => setSelectedColor(color)}
                    style={{ backgroundColor: getSwatchColor(color) }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="stock-info">
            <span className={isOutOfStock ? 'out-stock' : 'in-stock'}>
              {isOutOfStock ? '✗ Agotado' : `✓ Disponible (${availableStock} unidades)`}
            </span>
          </div>

          <div className="modal-description">
            <h4>Descripción</h4>
            <p>{product.description || 'Sin descripción'}</p>
          </div>

          {product.hasTechnicalSpecs && product.technicalSpecs && Object.keys(product.technicalSpecs).length > 0 && (
            <div className="modal-specs">
              <h4>Ficha técnica</h4>
              <table className="specs-table">
                <tbody>
                  {Object.entries(product.technicalSpecs).map(([key, value]) => (
                    <tr key={key}>
                      <td className="spec-key">{key}</td>
                      <td className="spec-value">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="modal-quantity">
            <span className="selector-label">Cantidad:</span>
            <div className="quantity-selector">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1 || isOutOfStock}>
                <FaMinus />
              </button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(Math.min(availableStock, quantity + 1))} disabled={quantity >= availableStock || isOutOfStock}>
                <FaPlus />
              </button>
            </div>
          </div>

          <div className="modal-buttons">
            <button
              className="btn-whatsapp"
              onClick={() =>
                window.open(
                  `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`,
                  '_blank'
                )
              }
            >
              <FaWhatsapp /> Consultar por WhatsApp
            </button>
            <button className="btn-add-cart" onClick={handleAddToCart} disabled={isOutOfStock}>
              <FaCartPlus /> Agregar al carrito
            </button>
            <button className="btn-share" onClick={handleShare}>
              <FaShare /> Compartir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductModal;