import { useRef } from 'react';
import html2canvas from 'html2canvas';
import { FaDownload, FaTimes } from 'react-icons/fa';
import './QuotesManager.css';

// Símbolos para las monedas más comunes
const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  VES: 'Bs',
  COP: '$',
  MXN: '$',
  ARS: '$',
  CLP: '$',
  PEN: 'S/',
  BRL: 'R$',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
};

export default function QuotePreview({ quote, companyInfo, onClose }) {
  const previewRef = useRef(null);

  const handleDownload = async () => {
    if (!previewRef.current) return;
    const canvas = await html2canvas(previewRef.current, { backgroundColor: '#ffffff', scale: 2 });
    const link = document.createElement('a');
    link.download = `cotizacion-${quote.quoteNumber || 'nueva'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const accentColor = companyInfo?.accentColor || '#ff8c42';
  const currencySymbol = CURRENCY_SYMBOLS[quote.currency] || '$';

  const formatMoney = (amount) => `${currencySymbol}${(amount || 0).toFixed(2)}`;

  const totalWithShipping = quote.shippingType === 'paid'
    ? quote.total + (quote.shippingCost || 0)
    : quote.total;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content preview-modal" onClick={e => e.stopPropagation()}>
        <div className="preview-actions">
          <h3>Vista previa</h3>
          <div>
            <button className="btn-primary" onClick={handleDownload}><FaDownload /> Descargar imagen</button>
            <button className="btn-secondary" onClick={onClose}><FaTimes /> Cerrar</button>
          </div>
        </div>
        <div ref={previewRef} className="quote-preview-document">
          {/* Encabezado */}
          <div className="preview-header" style={{ borderBottomColor: accentColor }}>
            {companyInfo?.logo && <img src={companyInfo.logo} alt="Logo" className="preview-logo" />}
            <div className="preview-company-info">
              <h2 style={{ color: accentColor }}>{companyInfo?.name || 'Empresa'}</h2>
              {companyInfo?.rif && <p><strong>RIF:</strong> {companyInfo.rif}</p>}
              {companyInfo?.address && <p>{companyInfo.address}</p>}
              {companyInfo?.phone && <p>Tel: {companyInfo.phone}</p>}
              {companyInfo?.email && <p>Email: {companyInfo.email}</p>}
            </div>
          </div>

          <div className="preview-title">
            <h1 style={{ color: accentColor }}>COTIZACIÓN</h1>
            {quote.quoteNumber && <p>N° {quote.quoteNumber}</p>}
            <p>Fecha: {new Date(quote.createdAt || Date.now()).toLocaleDateString()}</p>
            {quote.validUntil && <p>Válido hasta: {new Date(quote.validUntil).toLocaleDateString()}</p>}
            <p>Moneda: {quote.currency}</p>
          </div>

          {/* Datos del cliente */}
          <div className="preview-client" style={{ borderLeftColor: accentColor }}>
            <h3 style={{ color: accentColor }}>Cliente:</h3>
            <p><strong>{quote.client?.name}</strong></p>
            {quote.client?.idDocument && <p>ID: {quote.client.idDocument}</p>}
            {quote.client?.company && <p>{quote.client.company}</p>}
            {quote.client?.email && <p>{quote.client.email}</p>}
            {quote.client?.phone && <p>{quote.client.phone}</p>}
          </div>

          {/* Tabla de items */}
          <table className="preview-table">
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Cant.</th>
                <th>P. Unitario</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {quote.items?.map((item, i) => (
                <tr key={i}>
                  <td>{item.description}</td>
                  <td>{item.quantity}</td>
                  <td>{formatMoney(item.unitPrice)}</td>
                  <td>{formatMoney((item.quantity || 0) * (item.unitPrice || 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totales */}
          <div className="preview-totals">
            {quote.discount > 0 && <p>Descuento: {quote.discount}%</p>}
            {quote.tax > 0 && <p>Impuesto: {quote.tax}%</p>}
            <h3>Subtotal: {formatMoney(quote.total)}</h3>
            {quote.shippingType === 'free' && <p style={{ color: '#38a169' }}>🚚 Envío gratis incluido</p>}
            {quote.shippingType === 'paid' && (
              <p>Envío: {formatMoney(quote.shippingCost)}</p>
            )}
            <h2 style={{ color: accentColor }}>Total: {formatMoney(totalWithShipping)}</h2>
          </div>

          {quote.notes && (
            <div className="preview-notes">
              <h4>Notas:</h4>
              <p>{quote.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}