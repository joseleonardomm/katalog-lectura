import { useRef, useState } from 'react';
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
  
  // Sliders temporales para ajustar anchos de columna (%)
  const [col1, setCol1] = useState(40); // Descripción
  const [col2, setCol2] = useState(15); // Cant.
  const [col3, setCol3] = useState(20); // P. Unitario
  const [col4, setCol4] = useState(25); // Total

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
        
        {/* Controles temporales de ajuste de columnas (solo desarrollo) */}
        <div style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '0.8rem',
          marginBottom: '1rem',
          fontSize: '0.8rem',
          color: '#1a202c'
        }}>
          <strong>Ajustes de ancho de columna (%)</strong>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            <label>Descripción: {col1}%
              <input type="range" min="20" max="60" value={col1} onChange={e => setCol1(Number(e.target.value))} style={{ display: 'block' }} />
            </label>
            <label>Cant: {col2}%
              <input type="range" min="5" max="30" value={col2} onChange={e => setCol2(Number(e.target.value))} style={{ display: 'block' }} />
            </label>
            <label>P. Unit: {col3}%
              <input type="range" min="10" max="35" value={col3} onChange={e => setCol3(Number(e.target.value))} style={{ display: 'block' }} />
            </label>
            <label>Total: {col4}%
              <input type="range" min="10" max="35" value={col4} onChange={e => setCol4(Number(e.target.value))} style={{ display: 'block' }} />
            </label>
          </div>
        </div>

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

          {/* Tabla de items con anchos dinámicos */}
          <table className="preview-table" style={{ tableLayout: 'fixed', width: '100%' }}>
            <colgroup>
              <col style={{ width: `${col1}%` }} />
              <col style={{ width: `${col2}%` }} />
              <col style={{ width: `${col3}%` }} />
              <col style={{ width: `${col4}%` }} />
            </colgroup>
            <thead>
              <tr>
                <th>Descripción</th>
                <th style={{ textAlign: 'center' }}>Cant.</th>
                <th style={{ textAlign: 'center' }}>P. Unitario</th>
                <th style={{ textAlign: 'right', paddingRight: 0 }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {quote.items?.map((item, i) => (
                <tr key={i}>
                  <td>{item.description}</td>
                  <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'center' }}>{formatMoney(item.unitPrice)}</td>
                  <td style={{ textAlign: 'right', paddingRight: 0, borderRight: 'none' }}>{formatMoney((item.quantity || 0) * (item.unitPrice || 0))}</td>
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