import React from 'react';
import { FaHeart, FaComment, FaPaperPlane, FaBookmark } from 'react-icons/fa';

export default function InstagramStyle({
  product,
  productImage,
  effectivePrice,
  formatMoney,
  customText,
  options,
  glowImageStyle,
  titleColor = '#111111',
  priceColor = '#111111',
  logoPosition,
  showLogo,
  logoUrl,
  siteName = 'Tu Tienda',
}) {
  const { showComments = true, titleSize = '1rem', priceSize = '1.1rem', textScale = 1 } = options;
  const showOldPrice = product.isOnSale && product.salePrice && product.salePrice < product.basePrice;
  const finalTitleSize = `${parseFloat(titleSize) * textScale}rem`;
  const finalPriceSize = `${parseFloat(priceSize) * textScale}rem`;

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif', background: '#ffffff' }}>
      {/* Cabecera */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.8rem 1rem', borderBottom: '1px solid #efefef' }}>
        <div style={{ width: '2.2rem', height: '2.2rem', borderRadius: '50%', overflow: 'hidden', border: '1.5px solid #e0e0e0', background: '#fafafa', flexShrink: 0 }}>
          {showLogo && logoUrl ? (
            <img src={logoUrl} alt="Logo" crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#888' }}>
              {siteName?.charAt(0)?.toUpperCase() || 'T'}
            </div>
          )}
        </div>
        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#262626' }}>{siteName || 'Tu Tienda'}</span>
      </div>

      {/* Imagen */}
      <div style={{ width: '100%', aspectRatio: '1/1', background: '#fafafa', overflow: 'hidden' }}>
        {productImage ? (
          <img src={productImage} alt={product.name} crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover', ...glowImageStyle }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>Sin imagen</div>
        )}
      </div>

      {/* Iconos */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 1rem' }}>
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <FaHeart style={{ fontSize: '1.3rem', color: '#ed4956' }} />
          <FaComment style={{ fontSize: '1.3rem', color: '#262626' }} />
          <FaPaperPlane style={{ fontSize: '1.3rem', color: '#262626' }} />
        </div>
        <FaBookmark style={{ fontSize: '1.3rem', color: '#0095f6' }} />
      </div>

      {/* Textos */}
      <div style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        <h2 style={{ fontSize: finalTitleSize, fontWeight: 600, color: titleColor, margin: 0, lineHeight: 1.3 }}>{product.name}</h2>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ fontSize: finalPriceSize, fontWeight: 700, color: priceColor }}>{formatMoney(effectivePrice)}</span>
          {showOldPrice && <span style={{ fontSize: '0.85rem', color: '#8e8e8e', textDecoration: 'line-through' }}>{formatMoney(product.basePrice)}</span>}
        </div>
        {customText && <p style={{ fontSize: '0.85rem', color: '#555', margin: '0.2rem 0 0', lineHeight: 1.3 }}>{customText}</p>}
      </div>

      {/* Comentarios */}
      {showComments && (
        <div style={{ padding: '0.6rem 1rem', borderTop: '1px solid #efefef', marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <div style={{ width: '1.4rem', height: '1.4rem', borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: '#888' }}>C</div>
            <span style={{ fontSize: '0.75rem', color: '#8e8e8e' }}>carlos_mendez ¡Excelente producto!</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '1.4rem', height: '1.4rem', borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: '#888' }}>L</div>
            <span style={{ fontSize: '0.75rem', color: '#8e8e8e' }}>laura.garcia Me encantó, lo recomiendo</span>
          </div>
        </div>
      )}
    </div>
  );
}