import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import './TopProducts.css';

function TopProducts({ products, formatPrice, onProductClick, config, currency, exchangeRate, eurRate }) {
  if (!products || products.length === 0) return null;
  const primaryColor = config?.primaryColor || '#ff8c42';

  // Función interna para formatear precios según la moneda seleccionada
  const formatProductPrice = (price) => {
    const num = Number(price);
    if (isNaN(num)) return '0.00';
    if (currency === 'BS') return `Bs ${(num * (exchangeRate || 1)).toFixed(2)}`;
    if (currency === 'EUR') return `€${(num * (eurRate || 0.9)).toFixed(2)}`;
    return `$${num.toFixed(2)}`;
  };

  const getFirstImage = (product) => {
    if (product.colors?.[0]?.images?.[0]) return product.colors[0].images[0];
    if (product.images?.[0]) return product.images[0];
    return 'https://via.placeholder.com/300';
  };

  const topProducts = [...products]
    .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
    .slice(0, 10);

  if (topProducts.length === 0) return null;

  return (
    <div className="top-products-section">
      <div className="section-title">🔥 Los más vendidos</div>
      <Swiper
        modules={[Navigation]}
        spaceBetween={20}
        slidesPerView={1}
        navigation
        breakpoints={{
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 }
        }}
        className="top-products-swiper"
      >
        {topProducts.map((product) => {
          const effectivePrice = product.offerPrice || product.basePrice || 0;
          const firstImage = getFirstImage(product);

          return (
            <SwiperSlide key={product.id}>
              <div className="product-card" onClick={() => onProductClick?.(product)}>
                <div className="product-image">
                  <img src={firstImage} alt={product.name} loading="lazy" />
                  {product.isOnOffer && <span className="offer-badge">Oferta</span>}
                </div>
                <div className="product-info">
                  <h4>{product.name}</h4>
                  <div className="product-price-wrapper">
                    {product.isOnOffer ? (
                      <>
                        <span className="old-price">{formatProductPrice(product.basePrice)}</span>
                        <span className="sale-price" style={{ color: primaryColor }}>
                          {formatProductPrice(effectivePrice)}
                        </span>
                      </>
                    ) : (
                      <span className="product-price">{formatProductPrice(effectivePrice)}</span>
                    )}
                  </div>
                  <div className="top-badge" style={{ color: primaryColor }}>⭐ más vendido</div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}

export default TopProducts;