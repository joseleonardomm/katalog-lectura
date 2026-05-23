import React from 'react';

export default function HeroProductStyle({
  product,
  productImage,
  effectivePrice,
  formatMoney,
  customText,
  options,
  glowImageStyle,
  titleColor = '#ffffff',
  priceColor = '#ffffff',
  logoPosition,
}) {
  const { showStars = true, showDescription = true, textScale = 1 } = options;
  const showOldPrice = product.isOnSale && product.salePrice && product.salePrice < product.basePrice;
  const titleSize = `${2.5 * textScale}rem`;
  const priceSize = `${3 * textScale}rem`;
  const oldPriceSize = `${1.3 * textScale}rem`;
  const descSize = `${1 * textScale}rem`;
  const customTextSize = `${1.1 * textScale}rem`;

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif', padding: '2rem', boxSizing: 'border-box', gap: '0.8rem' }}>
      <div style={{ width: '75%', aspectRatio: '1/1', borderRadius: '24px', overflow: 'hidden', background: productImage ? `url(${productImage}) center/cover no-repeat` : '#f0f0f0', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', marginBottom: '0.5rem', ...glowImageStyle }}>
        {productImage && <img src={productImage} alt={product.name} crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '24px' }} />}
      </div>
      {showStars && <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>{[1,2,3,4,5].map(i=><span key={i} style={{color:'#FFA41C', fontSize:'1.8rem'}}>★</span>)}</div>}
      <h2 style={{ fontSize: titleSize, fontWeight: 700, color: titleColor, margin: 0, textAlign: 'center', textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>{product.name}</h2>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <span style={{ fontSize: priceSize, fontWeight: 700, color: priceColor, textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>{formatMoney(effectivePrice)}</span>
        {showOldPrice && <span style={{ fontSize: oldPriceSize, color: '#cccccc', textDecoration: 'line-through' }}>{formatMoney(product.basePrice)}</span>}
      </div>
      {showDescription && product.description && <p style={{ fontSize: descSize, color: titleColor, opacity: 0.8, textAlign: 'center', margin: 0, maxWidth: '85%', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>{product.description}</p>}
      {customText && <p style={{ fontSize: customTextSize, color: '#f0f0f0', textAlign: 'center', margin: 0, fontWeight: 500, textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>{customText}</p>}
    </div>
  );
}