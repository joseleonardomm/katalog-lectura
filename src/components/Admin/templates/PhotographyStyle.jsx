import React from 'react';

export default function PhotographyStyle({
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
  const {
    imageFilter = 'none',
    textAlign = 'left',
    textPosX = 49,
    textPosY = 85,
    textScale = 1,
    shadowColor = '#000000',
    shadowIntensity = 5,
  } = options;

  const filterStyle = { none:'none', grayscale:'grayscale(100%)', sepia:'sepia(100%)', blur:'blur(5px)' };
  const showOldPrice = product.isOnSale && product.salePrice && product.salePrice < product.basePrice;
  const shadowOpacity = Math.min(1, shadowIntensity / 5);
  const textShadow = `0 2px 8px ${shadowColor}${Math.round(shadowOpacity*100).toString(16).padStart(2,'0')}`;
  const titleSize = `${2.2 * textScale}rem`;
  const priceSize = `${1.8 * textScale}rem`;
  const oldPriceSize = `${1 * textScale}rem`;
  const customTextSize = `${1 * textScale}rem`;
  const finalAlign = textAlign || 'left';

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', fontFamily: 'Inter, system-ui, sans-serif', overflow: 'hidden' }}>
      {productImage && (
        <img src={productImage} alt={product.name} crossOrigin="anonymous" style={{
          width: '100%', height: '100%', objectFit: 'contain',
          filter: filterStyle[imageFilter] || 'none', ...glowImageStyle,
        }} />
      )}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%', background: 'linear-gradient(transparent, rgba(0,0,0,0.5))', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', left: `${textPosX}%`, top: `${textPosY}%`, transform: 'translate(-50%,-50%)', textAlign: finalAlign, color: '#ffffff', pointerEvents: 'none', width: '90%' }}>
        <h2 style={{ fontSize: titleSize, fontWeight: 300, margin: 0, color: titleColor, textShadow }}>{product.name}</h2>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.3rem', justifyContent: finalAlign==='center'?'center':finalAlign==='right'?'flex-end':'flex-start' }}>
          <span style={{ fontSize: priceSize, fontWeight: 600, color: priceColor, textShadow }}>{formatMoney(effectivePrice)}</span>
          {showOldPrice && <span style={{ fontSize: oldPriceSize, textDecoration: 'line-through', opacity: 0.7, textShadow }}>{formatMoney(product.basePrice)}</span>}
        </div>
        {customText && <p style={{ fontSize: customTextSize, marginTop: '0.3rem', opacity: 0.9, textShadow }}>{customText}</p>}
      </div>
    </div>
  );
}