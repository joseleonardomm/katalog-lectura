import { useState, useEffect } from 'react';
import { createQuote, updateQuote, updateCompanyInfo } from '../../../api';
import { FaPlus, FaTrash, FaSave, FaEye, FaBuilding } from 'react-icons/fa';
import QuotePreview from './QuotePreview';
import './QuotesManager.css';

const EMPTY_ITEM = { description: '', quantity: 1, unitPrice: 0 };

// Lista de monedas populares con su código y símbolo
const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'USD - Dólar estadounidense' },
  { code: 'EUR', symbol: '€', label: 'EUR - Euro' },
  { code: 'VES', symbol: 'Bs', label: 'VES - Bolívar venezolano' },
  { code: 'COP', symbol: '$', label: 'COP - Peso colombiano' },
  { code: 'MXN', symbol: '$', label: 'MXN - Peso mexicano' },
  { code: 'ARS', symbol: '$', label: 'ARS - Peso argentino' },
  { code: 'CLP', symbol: '$', label: 'CLP - Peso chileno' },
  { code: 'PEN', symbol: 'S/', label: 'PEN - Sol peruano' },
  { code: 'BRL', symbol: 'R$', label: 'BRL - Real brasileño' },
  { code: 'GBP', symbol: '£', label: 'GBP - Libra esterlina' },
  { code: 'JPY', symbol: '¥', label: 'JPY - Yen japonés' },
  { code: 'CNY', symbol: '¥', label: 'CNY - Yuan chino' },
];

export default function QuoteForm({ initialQuote, companyInfo: initialCompanyInfo, onClose, showMessage }) {
  const [quote, setQuote] = useState({
    client: { name: '', email: '', phone: '', company: '', idDocument: '' },
    items: [{ ...EMPTY_ITEM }],
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
    notes: '',
    status: 'pending',
    validUntil: '',
    quoteNumber: '',
    currency: 'USD',           // moneda por defecto
    shippingType: 'none',
    shippingCost: 0,
    companyInfo: { ...initialCompanyInfo }
  });
  const [companyInfo, setCompanyInfo] = useState(initialCompanyInfo);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialQuote) {
      setQuote({
        ...initialQuote,
        client: { ...initialQuote.client, idDocument: initialQuote.client?.idDocument || '' },
        items: initialQuote.items?.length ? initialQuote.items : [{ ...EMPTY_ITEM }],
        currency: initialQuote.currency || 'USD',
        shippingType: initialQuote.shippingType || 'none',
        shippingCost: initialQuote.shippingCost || 0,
        companyInfo: initialQuote.companyInfo || { ...initialCompanyInfo }
      });
    }
  }, [initialQuote]);

  useEffect(() => {
    calculateTotals();
  }, [quote.items, quote.tax, quote.discount]);

  const calculateTotals = () => {
    const subtotal = quote.items.reduce((sum, item) => sum + (item.quantity * (item.unitPrice || 0)), 0);
    const discountAmount = subtotal * (quote.discount / 100);
    const taxAmount = (subtotal - discountAmount) * (quote.tax / 100);
    const total = subtotal - discountAmount + taxAmount;
    setQuote(prev => ({ ...prev, subtotal, total }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...quote.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setQuote(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setQuote(prev => ({ ...prev, items: [...prev.items, { ...EMPTY_ITEM }] }));
  };

  const removeItem = (index) => {
    const newItems = quote.items.filter((_, i) => i !== index);
    setQuote(prev => ({ ...prev, items: newItems.length ? newItems : [{ ...EMPTY_ITEM }] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateCompanyInfo(companyInfo);
      if (initialQuote) {
        await updateQuote(initialQuote.id, quote);
        showMessage('success', 'Cotización actualizada');
      } else {
        await createQuote(quote);
        showMessage('success', 'Cotización creada');
      }
      onClose();
    } catch (err) {
      showMessage('error', 'Error al guardar');
    }
    setSaving(false);
  };

  const handleCompanyInfoChange = (field, value) => {
    setCompanyInfo(prev => ({ ...prev, [field]: value }));
    setQuote(prev => ({ ...prev, companyInfo: { ...prev.companyInfo, [field]: value } }));
  };

  // Obtener el símbolo de la moneda seleccionada
  const selectedCurrency = CURRENCIES.find(c => c.code === quote.currency);
  const currencySymbol = selectedCurrency ? selectedCurrency.symbol : '$';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content quote-modal" onClick={e => e.stopPropagation()}>
        <h2>{initialQuote ? 'Editar cotización' : 'Nueva cotización'}</h2>

        {/* Información de la empresa */}
        <div className="form-section">
          <h3><FaBuilding /> Datos de la empresa</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Nombre</label>
              <input value={companyInfo.name} onChange={e => handleCompanyInfoChange('name', e.target.value)} placeholder="Nombre de la empresa" />
            </div>
            <div className="form-group">
              <label>Logo URL</label>
              <input value={companyInfo.logo} onChange={e => handleCompanyInfoChange('logo', e.target.value)} placeholder="URL del logo" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>RIF / Registro</label>
              <input value={companyInfo.rif || ''} onChange={e => handleCompanyInfoChange('rif', e.target.value)} placeholder="J-12345678-9" />
            </div>
            <div className="form-group">
              <label>Color de acento</label>
              <div className="bim-color-picker">
                <input
                  type="color"
                  value={companyInfo.accentColor || '#ff8c42'}
                  onChange={e => handleCompanyInfoChange('accentColor', e.target.value)}
                />
                <span className="bim-color-value">{companyInfo.accentColor || '#ff8c42'}</span>
              </div>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Teléfono</label>
              <input value={companyInfo.phone} onChange={e => handleCompanyInfoChange('phone', e.target.value)} placeholder="Teléfono" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input value={companyInfo.email} onChange={e => handleCompanyInfoChange('email', e.target.value)} placeholder="Email" />
            </div>
          </div>
          <div className="form-group">
            <label>Dirección</label>
            <input value={companyInfo.address} onChange={e => handleCompanyInfoChange('address', e.target.value)} placeholder="Dirección" />
          </div>
        </div>

        {/* Datos del cliente */}
        <div className="form-section">
          <h3>Datos del cliente</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Nombre</label>
              <input value={quote.client.name} onChange={e => setQuote(prev => ({ ...prev, client: { ...prev.client, name: e.target.value } }))} placeholder="Nombre del cliente" />
            </div>
            <div className="form-group">
              <label>Documento de identidad</label>
              <input value={quote.client.idDocument || ''} onChange={e => setQuote(prev => ({ ...prev, client: { ...prev.client, idDocument: e.target.value } }))} placeholder="Cédula, DNI, etc." />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Teléfono</label>
              <input value={quote.client.phone} onChange={e => setQuote(prev => ({ ...prev, client: { ...prev.client, phone: e.target.value } }))} placeholder="Teléfono" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input value={quote.client.email} onChange={e => setQuote(prev => ({ ...prev, client: { ...prev.client, email: e.target.value } }))} placeholder="Email" />
            </div>
          </div>
          <div className="form-group">
            <label>Empresa</label>
            <input value={quote.client.company} onChange={e => setQuote(prev => ({ ...prev, client: { ...prev.client, company: e.target.value } }))} placeholder="Empresa (opcional)" />
          </div>
        </div>

        {/* Moneda */}
        <div className="form-section">
          <h3>Moneda</h3>
          <div className="form-row">
            <div className="form-group" style={{ maxWidth: '400px' }}>
              <label>Moneda</label>
              <select value={quote.currency} onChange={e => setQuote(prev => ({ ...prev, currency: e.target.value }))}>
                {CURRENCIES.map(curr => (
                  <option key={curr.code} value={curr.code}>{curr.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Envío */}
        <div className="form-section">
          <h3>Envío</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Tipo de envío</label>
              <select value={quote.shippingType} onChange={e => setQuote(prev => ({ ...prev, shippingType: e.target.value }))}>
                <option value="none">No especificado</option>
                <option value="free">Envío gratis</option>
                <option value="paid">Envío con costo</option>
              </select>
            </div>
            {quote.shippingType === 'paid' && (
              <div className="form-group">
                <label>Costo de envío ({currencySymbol})</label>
                <input
                  type="number"
                  step="0.01"
                  value={quote.shippingCost || ''}
                  onChange={e => setQuote(prev => ({ ...prev, shippingCost: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="form-section">
          <h3>Productos / Servicios</h3>
          {quote.items.map((item, index) => (
            <div key={index} className="item-row">
              <div className="form-group flex-2">
                <label>Descripción</label>
                <input value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} placeholder="Descripción" />
              </div>
              <div className="form-group">
                <label>Cant.</label>
                <input type="number" min="1" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)} />
              </div>
              <div className="form-group">
                <label>P. unitario ({currencySymbol})</label>
                <input type="number" step="0.01" value={item.unitPrice} onChange={e => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)} />
              </div>
              <button className="btn-icon btn-danger remove-item" onClick={() => removeItem(index)} title="Eliminar item"><FaTrash /></button>
            </div>
          ))}
          <button className="btn-secondary add-item" onClick={addItem}><FaPlus /> Agregar item</button>
        </div>

        {/* Totales */}
        <div className="form-section totals-section">
          <div className="form-row">
            <div className="form-group">
              <label>Descuento (%)</label>
              <input type="number" min="0" max="100" value={quote.discount} onChange={e => setQuote(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))} />
            </div>
            <div className="form-group">
              <label>Impuesto (%)</label>
              <input type="number" min="0" max="100" value={quote.tax} onChange={e => setQuote(prev => ({ ...prev, tax: parseFloat(e.target.value) || 0 }))} />
            </div>
            <div className="form-group total-display">
              <label>Total: <strong>{currencySymbol}{quote.total.toFixed(2)}</strong></label>
            </div>
          </div>
        </div>

        {/* Notas, estado, vigencia, número */}
        <div className="form-section">
          <div className="form-row">
            <div className="form-group">
              <label>Notas</label>
              <textarea rows="2" value={quote.notes} onChange={e => setQuote(prev => ({ ...prev, notes: e.target.value }))} placeholder="Notas internas o para el cliente" />
            </div>
            <div className="form-group">
              <label>Estado</label>
              <select value={quote.status} onChange={e => setQuote(prev => ({ ...prev, status: e.target.value }))}>
                <option value="pending">Pendiente</option>
                <option value="in_progress">En proceso</option>
                <option value="accepted">Aceptada</option>
                <option value="rejected">Rechazada</option>
                <option value="expired">Expirada</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Válido hasta</label>
              <input type="date" value={quote.validUntil} onChange={e => setQuote(prev => ({ ...prev, validUntil: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Número de cotización</label>
              <input value={quote.quoteNumber} onChange={e => setQuote(prev => ({ ...prev, quoteNumber: e.target.value }))} placeholder="Ej: COT-001" />
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={() => setShowPreview(true)}><FaEye /> Vista previa</button>
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            <FaSave /> {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      {showPreview && (
        <QuotePreview
          quote={quote}
          companyInfo={companyInfo}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}