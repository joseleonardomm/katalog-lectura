import React from 'react';

export default function AmazonStyle({
  product,
  currentColor,
  productImage,
  effectivePrice,
  formatMoney,
  customText,
  options,
  glowImageStyle,
  titleColor = '#111111',
  priceColor = '#111111',
  backgroundColor = '#f0f0f0',   // nuevo color de fondo sólido
  logoPosition,
}) {
  const {
    showStars = true,
    showDescription = true,
    showThumbnails = true,
    textPosY = 11,
    textScale = 1,
  } = options;

  const showOldPrice = product.isOnSale && product.salePrice && product.salePrice < product.basePrice;
  const additionalImages = currentColor?.images?.slice(1, 4) || [];

  const titleSize = `${1.8 * textScale}rem`;
  const priceSize = `${2 * textScale}rem`;
  const oldPriceSize = `${1 * textScale}rem`;
  const customTextSize = `${0.9 * textScale}rem`;

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Área de imagen con color de fondo sólido */}
      <div style={{
        height: '45%',
        position: 'relative',
        overflow: 'hidden',
        background: backgroundColor,        // color sólido
      }}>
        {productImage && (
          <img
            src={productImage}
            alt={product.name}
            crossOrigin="anonymous"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              maxWidth: '80%',
              maxHeight: '80%',
              objectFit: 'contain',
              borderRadius: '16px',
              ...glowImageStyle,
            }}
          />
        )}
      </div>

      {showThumbnails && additionalImages.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', padding: '0.4rem 1rem', background: '#ffffff' }}>
          {additionalImages.map((img, idx) => (
            <div key={idx} style={{ width: '18%', aspectRatio: '1/1', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f0f0f0' }}>
              <img src={img} alt={`${product.name} ${idx + 2}`} crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          ))}
        </div>
      )}

      <div style={{ flex: 1, background: '#ffffff', padding: `${textPosY}px 1.5rem 1rem 1.5rem`, display: 'flex', flexDirection: 'column', gap: '0.2rem', justifyContent: 'center', position: 'relative' }}>
        <h2 style={{ fontSize: titleSize, fontWeight: 700, color: titleColor, margin: 0 }}>{product.name}</h2>
        {showStars && (
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {[1,2,3,4,5].map(i=><span key={i} style={{color:'#FFA41C', fontSize:'1.2rem'}}>★</span>)}
            <span style={{color:'#007185', fontSize:'0.8rem', marginLeft:'0.5rem'}}>Excelente calidad</span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.1rem' }}>
          <span style={{ fontSize: priceSize, fontWeight: 700, color: priceColor }}>{formatMoney(effectivePrice)}</span>
          {showOldPrice && <span style={{ fontSize: oldPriceSize, color: '#565959', textDecoration: 'line-through' }}>{formatMoney(product.basePrice)}</span>}
        </div>
        {showDescription && product.description && <p style={{ fontSize: '0.9rem', color: '#333', lineHeight: 1.4, margin: '0.2rem 0 0' }}>{product.description}</p>}
        {customText && <p style={{ fontSize: customTextSize, color: '#555', margin: '0.2rem 0 0' }}>{customText}</p>}
      </div>
    </div>
  );
}