import React, { useState, useEffect } from 'react';
import { FaTrashAlt, FaTimes, FaCreditCard, FaCopy, FaCheck } from 'react-icons/fa';
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

  // Métodos de pago
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

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
    let cost = baseMax;

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

  const activePaymentMethods = config?.paymentMethods?.filter(m => m.active) || [];

  return (
    <div className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="cart-header">
        <span>🛒 Mi carrito ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
        <FaTimes onClick={onClose} className="close-icon" />
      </div>

      {/* CONTENEDOR CON SCROLL que abarca productos, envío, pagos, total y botones */}
      <div className="cart-scrollable">
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

            {/* ========== MÉTODOS DE PAGO ========== */}
            {activePaymentMethods.length > 0 && (
              <div className="cart-payment-methods">
                <button
                  className="btn-payment-toggle"
                  onClick={() => setShowPaymentMethods(!showPaymentMethods)}
                >
                  <FaCreditCard /> {showPaymentMethods ? 'Ocultar métodos de pago' : 'Ver métodos de pago'}
                </button>

                {showPaymentMethods && (
                  <div className="payment-methods-list">
                    {activePaymentMethods.map((method, idx) => (
                      <div key={method.id} className="payment-method-item">
                        <div className="payment-method-header">
                          <span className="payment-method-type">
                            {method.type === 'pago_movil' ? '📱 Pago Móvil' :
                             method.type === 'transferencia' ? '🏦 Transferencia' :
                             method.type === 'paypal' ? '🅿️ PayPal' : '💳 Otro'}
                          </span>
                          <span className="payment-method-label">{method.label}</span>
                        </div>
                        <div className="payment-method-details">
                          {method.type === 'pago_movil' || method.type === 'transferencia' ? (
                            <>
                              {method.details.bank && (
                                <div className="payment-detail-row">
                                  <span><strong>Banco:</strong> {method.details.bank}</span>
                                  <button
                                    className="btn-copy-icon"
                                    onClick={() => {
                                      navigator.clipboard.writeText(method.details.bank);
                                      setCopiedIndex(`${idx}-bank`);
                                      setTimeout(() => setCopiedIndex(null), 2000);
                                    }}
                                    title="Copiar banco"
                                  >
                                    {copiedIndex === `${idx}-bank` ? <FaCheck /> : <FaCopy />}
                                  </button>
                                </div>
                              )}
                              {method.details.phone && (
                                <div className="payment-detail-row">
                                  <span><strong>Teléfono:</strong> {method.details.phone}</span>
                                  <button
                                    className="btn-copy-icon"
                                    onClick={() => {
                                      navigator.clipboard.writeText(method.details.phone);
                                      setCopiedIndex(`${idx}-phone`);
                                      setTimeout(() => setCopiedIndex(null), 2000);
                                    }}
                                    title="Copiar teléfono"
                                  >
                                    {copiedIndex === `${idx}-phone` ? <FaCheck /> : <FaCopy />}
                                  </button>
                                </div>
                              )}
                              {method.details.idNumber && (
                                <div className="payment-detail-row">
                                  <span><strong>Cédula:</strong> {method.details.idNumber}</span>
                                  <button
                                    className="btn-copy-icon"
                                    onClick={() => {
                                      navigator.clipboard.writeText(method.details.idNumber);
                                      setCopiedIndex(`${idx}-id`);
                                      setTimeout(() => setCopiedIndex(null), 2000);
                                    }}
                                    title="Copiar cédula"
                                  >
                                    {copiedIndex === `${idx}-id` ? <FaCheck /> : <FaCopy />}
                                  </button>
                                </div>
                              )}
                            </>
                          ) : method.type === 'paypal' ? (
                            <div className="payment-detail-row">
                              <a href={method.details.paypalLink} target="_blank" rel="noopener noreferrer" className="paypal-link">
                                Ir a PayPal
                              </a>
                              <button
                                className="btn-copy-icon"
                                onClick={() => {
                                  navigator.clipboard.writeText(method.details.paypalLink);
                                  setCopiedIndex(`${idx}-paypal`);
                                  setTimeout(() => setCopiedIndex(null), 2000);
                                }}
                                title="Copiar enlace"
                              >
                                {copiedIndex === `${idx}-paypal` ? <FaCheck /> : <FaCopy />}
                              </button>
                            </div>
                          ) : (
                            <div className="payment-detail-row">
                              <span>{method.details.customText}</span>
                              <button
                                className="btn-copy-icon"
                                onClick={() => {
                                  navigator.clipboard.writeText(method.details.customText);
                                  setCopiedIndex(`${idx}-custom`);
                                  setTimeout(() => setCopiedIndex(null), 2000);
                                }}
                                title="Copiar información"
                              >
                                {copiedIndex === `${idx}-custom` ? <FaCheck /> : <FaCopy />}
                              </button>
                            </div>
                          )}
                        </div>
                        {method.instructions && (
                          <p className="payment-method-instructions">{method.instructions}</p>
                        )}
                      </div>
                    ))}
                    <div className="payment-reminder">
                      <p>💡 Recuerda enviar tu comprobante de pago al WhatsApp de la tienda después de realizar el pago.</p>
                    </div>
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
    </div>
  );
}

export default CartSidebar;