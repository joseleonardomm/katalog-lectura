import React, { useState, useEffect } from 'react';
import { FaTrashAlt, FaTimes } from 'react-icons/fa';
import { getOrderFormConfig } from '../api';
import './CartSidebar.css';

function CartSidebar({ isOpen, onClose, cart, onUpdateQuantity, onRemove, onClear, formatPrice, total, config }) {
  const [orderForm, setOrderForm] = useState({ enabled: false, fields: [] });
  const [formData, setFormData] = useState({});
  const [showForm, setShowForm] = useState(false);

  const shipping = config?.shipping || { enabled: false, freeMode: 'global', freeFrom: 0, categories: [], states: [] };
  const [selectedStateId, setSelectedStateId] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingInfo, setShippingInfo] = useState(null);

  useEffect(() => {
    const loadFormConfig = async () => {
      const cfg = await getOrderFormConfig();
      setOrderForm(cfg);
      const initialData = {};
      if (cfg.fields) {
        cfg.fields.forEach(field => { initialData[field.label] = ''; });
      }
      setFormData(initialData);
    };
    loadFormConfig();
  }, []);

  useEffect(() => {
    setSelectedStateId('');
    setSelectedZoneId('');
    setShippingCost(0);
    setShippingInfo(null);
  }, [cart, isOpen]);

  useEffect(() => {
    if (!shipping.enabled || !selectedZoneId) {
      setShippingCost(0);
      setShippingInfo(null);
      return;
    }

    const state = shipping.states.find(s => s.id === selectedStateId);
    if (!state) return;
    const zone = state.zones.find(z => z.id === selectedZoneId);
    if (!zone) return;

    let extraTotal = 0;
    cart.forEach(item => {
      const catId = item.product.shippingCategory;
      if (catId && zone.extras && zone.extras[catId]) {
        extraTotal += zone.extras[catId] * item.quantity;
      }
    });

    let baseMin = zone.price + extraTotal;
    let baseMax = zone.priceMax !== undefined && zone.priceMax !== '' ? Number(zone.priceMax) + extraTotal : baseMin;
    let cost = baseMax; // usamos el máximo para el total

    if (shipping.freeMode === 'global' && total >= (shipping.freeFrom || 0)) {
      cost = 0;
      baseMin = 0;
      baseMax = 0;
    }

    setShippingCost(cost);
    setShippingInfo({
      min: baseMin,
      max: baseMax,
      deliveryTime: zone.deliveryTime,
      type: zone.type === 'domicilio' ? 'Domicilio' : 'Oficina de encomienda',
    });
  }, [selectedZoneId, cart, shipping, total]);

  const generateWhatsAppMessage = () => {
    let message = '*📋 Resumen de tu pedido:*\n\n';
    cart.forEach(item => {
      const effectivePrice = item.product.effectivePrice !== undefined ? item.product.effectivePrice : item.product.price;
      const subtotal = effectivePrice * item.quantity;
      message += `• ${item.product.nameWithVariant || item.product.name} x${item.quantity} = ${formatPrice({ price: subtotal, priceCurrency: item.product.priceCurrency })}\n`;
    });
    const totalPrice = total + shippingCost;
    message += `\n*💰 Total: ${formatPrice({ price: totalPrice, priceCurrency: cart[0]?.product.priceCurrency || 'USD' })}*`;

    if (shipping.enabled && selectedZoneId) {
      const state = shipping.states.find(s => s.id === selectedStateId);
      const zone = state?.zones.find(z => z.id === selectedZoneId);
      if (zone) {
        message += `\n\n*🚚 Envío:*`;
        message += `\n• Estado: ${state.name}`;
        message += `\n• Zona: ${zone.name}`;
        message += `\n• Tipo: ${zone.type === 'domicilio' ? 'Domicilio' : 'Oficina de encomienda'}`;
        message += `\n• Tiempo estimado: ${zone.deliveryTime}`;
        if (shippingInfo) {
          if (shippingInfo.min === shippingInfo.max) {
            message += `\n• Costo: ${shippingCost === 0 ? '¡Gratis!' : formatPrice({ price: shippingCost, priceCurrency: cart[0]?.product.priceCurrency || 'USD' })}`;
          } else {
            message += `\n• Costo: ${formatPrice({ price: shippingInfo.min, priceCurrency: cart[0]?.product.priceCurrency || 'USD' })} – ${formatPrice({ price: shippingInfo.max, priceCurrency: cart[0]?.product.priceCurrency || 'USD' })}`;
          }
        }
      }
    }

    if (orderForm.enabled && formData) {
      message += '\n\n*📝 Datos del cliente:*\n';
      orderForm.fields.forEach(field => {
        const value = formData[field.label] || '';
        message += `• ${field.label}: ${value}\n`;
      });
    }

    message += `\n\n🛍️ ¡Gracias por tu compra! En breve nos pondremos en contacto.`;
    return encodeURIComponent(message);
  };

  const handleWhatsAppCheckout = () => {
    if (orderForm.enabled && !showForm) {
      setShowForm(true);
      return;
    }
    if (orderForm.enabled) {
      const missingFields = orderForm.fields.filter(f => f.required && !formData[f.label]?.trim()).map(f => f.label);
      if (missingFields.length > 0) {
        alert(`Por favor completa los campos obligatorios: ${missingFields.join(', ')}`);
        return;
      }
    }
    if (shipping.enabled && !selectedZoneId) {
      alert('Por favor selecciona una zona de envío.');
      return;
    }
    const phone = config?.whatsappNumber || '';
    if (!phone) {
      alert('El vendedor no ha configurado un número de WhatsApp.');
      return;
    }
    const message = generateWhatsAppMessage();
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    setShowForm(false);
  };

  const handleFormChange = (fieldLabel, value) => setFormData(prev => ({ ...prev, [fieldLabel]: value }));

  return (
    <div className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="cart-header">
        <span>🛒 Mi carrito ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
        <FaTimes onClick={onClose} className="close-icon" />
      </div>

      <div className="cart-items">
        {cart.length === 0 ? (
          <div className="empty-cart">Carrito vacío 🛍️</div>
        ) : (
          cart.map(item => {
            const effectivePrice = item.product.effectivePrice !== undefined ? item.product.effectivePrice : item.product.price;
            return (
              <div key={`${item.id}-${JSON.stringify(item.product.selectedColor)}-${JSON.stringify(item.product.selectedSize)}`} className="cart-item">
                <div className="cart-item-info">
                  <div className="cart-item-title">{item.product.nameWithVariant || item.product.name}</div>
                  {item.product.selectedColor && (
                    <div className="cart-item-variant" style={{ fontSize: '0.75rem', color: '#666' }}>
                      Color: {item.product.selectedColor.name}
                      {item.product.selectedSize && `, Talla: ${item.product.selectedSize.name}`}
                    </div>
                  )}
                  <div className="cart-item-price">{formatPrice({ price: effectivePrice, priceCurrency: item.product.priceCurrency })}</div>
                  <div className="cart-item-quantity">
                    <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1, item.product.selectedColor, item.product.selectedSize)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1, item.product.selectedColor, item.product.selectedSize)}>+</button>
                  </div>
                </div>
                <div className="cart-item-subtotal">
                  {formatPrice({ price: effectivePrice * item.quantity, priceCurrency: item.product.priceCurrency })}
                  <button className="remove-btn" onClick={() => onRemove(item.id, item.product.selectedColor, item.product.selectedSize)}>
                    <FaTrashAlt />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {cart.length > 0 && (
        <>
          {shipping.enabled && (
            <div className="shipping-section">
              <h4>🚚 Envío</h4>
              <div className="form-group">
                <label>Estado</label>
                <select value={selectedStateId} onChange={e => { setSelectedStateId(e.target.value); setSelectedZoneId(''); }}>
                  <option value="">Seleccionar estado...</option>
                  {shipping.states.map(state => <option key={state.id} value={state.id}>{state.name}</option>)}
                </select>
              </div>
              {selectedStateId && (
                <div className="form-group">
                  <label>Zona</label>
                  <select value={selectedZoneId} onChange={e => setSelectedZoneId(e.target.value)}>
                    <option value="">Seleccionar zona...</option>
                    {shipping.states.find(s => s.id === selectedStateId)?.zones.map(zone => (
                      <option key={zone.id} value={zone.id}>{zone.name}</option>
                    ))}
                  </select>
                </div>
              )}
              {selectedZoneId && shippingInfo && (
                <div className="shipping-details">
                  <p><strong>Tipo:</strong> {shippingInfo.type}</p>
                  <p><strong>Tiempo estimado:</strong> {shippingInfo.deliveryTime}</p>
                  <p>
                    <strong>Costo:</strong>{' '}
                    {shippingCost === 0
                      ? '¡Gratis!'
                      : shippingInfo.min === shippingInfo.max
                        ? formatPrice({ price: shippingInfo.min, priceCurrency: cart[0]?.product.priceCurrency || 'USD' })
                        : `${formatPrice({ price: shippingInfo.min, priceCurrency: cart[0]?.product.priceCurrency || 'USD' })} – ${formatPrice({ price: shippingInfo.max, priceCurrency: cart[0]?.product.priceCurrency || 'USD' })}`
                    }
                  </p>
                </div>
              )}
            </div>
          )}

          {orderForm.enabled && showForm && (
            <div className="order-form">
              <h4>📝 Datos de contacto</h4>
              {orderForm.fields.map((field, index) => (
                <div key={index} className="form-group">
                  <label>{field.label}{field.required && <span className="required">*</span>}</label>
                  <input type="text" value={formData[field.label] || ''} onChange={e => handleFormChange(field.label, e.target.value)} placeholder={field.label} />
                </div>
              ))}
              <button className="checkout-btn primary" onClick={handleWhatsAppCheckout}>💬 Enviar pedido por WhatsApp</button>
              <button className="checkout-btn" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          )}

          {(!orderForm.enabled || !showForm) && (
            <>
              <div className="cart-total">
                <span>Total:</span>
                <span>{formatPrice({ price: total + shippingCost, priceCurrency: cart[0]?.product.priceCurrency || 'USD' })}</span>
              </div>
              <button className="checkout-btn" onClick={onClear}>Vaciar carrito</button>
              <button className="checkout-btn primary" onClick={handleWhatsAppCheckout}>💬 Enviar pedido por WhatsApp</button>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default CartSidebar;