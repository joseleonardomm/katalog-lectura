import React from 'react';

export default function DetailsStyle({
  product,
  productImage,
  effectivePrice,
  formatMoney,
  customText,
  options,
  glowImageStyle,
  titleColor = '#ffffff',
  priceColor = '#ffd700',
  detailsColor = '#ffffff',
  logoPosition,
  backgroundColor = '#000000',
}) {
  const { showPrice = true, detailsLines = [], textScale = 1 } = options;
  const showOldPrice = product.isOnSale && product.salePrice && product.salePrice < product.basePrice;
  const linesToShow = detailsLines.length > 0 ? detailsLines.filter(l => l.trim() !== '') : (customText ? customText.split('\n').filter(l => l.trim() !== '') : []);
  const titleSize = `${2.2 * textScale}rem`;
  const priceSize = `${1.5 * textScale}rem`;
  const oldPriceSize = `${0.9 * textScale}rem`;
  const detailsSize = `${1 * textScale}rem`;

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif', background: backgroundColor, overflow: 'hidden' }}>
      <div style={{ height: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', boxSizing: 'border-box' }}>
        {productImage && <img src={productImage} alt={product.name} crossOrigin="anonymous" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', ...glowImageStyle }} />}
      </div>
      <div style={{ width: '80%', height: '1px', background: '#444', alignSelf: 'center' }} />
      <div style={{ flex: 1, padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', overflow: 'auto' }}>
        <h2 style={{ fontSize: titleSize, fontWeight: 700, color: titleColor, margin: 0, textAlign: 'center', textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}>{product.name}</h2>
        {linesToShow.length > 0 && (
          <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: detailsSize, color: detailsColor, lineHeight: 1.6, textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
            {linesToShow.map((line, idx) => <li key={idx} style={{ marginBottom: '0.3rem' }}>{line}</li>)}
          </ul>
        )}
        {showPrice && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem', justifyContent: 'center' }}>
            <span style={{ fontSize: priceSize, fontWeight: 600, color: priceColor, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{formatMoney(effectivePrice)}</span>
            {showOldPrice && <span style={{ fontSize: oldPriceSize, color: '#ccc', textDecoration: 'line-through' }}>{formatMoney(product.basePrice)}</span>}
          </div>
        )}
        {linesToShow.length === 0 && !showPrice && <p style={{ fontSize: '0.9rem', color: '#888', margin: 0, textAlign: 'center' }}>Sin detalles adicionales.</p>}
      </div>
    </div>
  );
}