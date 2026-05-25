import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import './TopProducts.css';

function TopProducts({ products, formatPrice, onProductClick, config, currency, exchangeRate, eurRate }) {
  if (!products || products.length === 0) return null;
  const primaryColor = config?.primaryColor || '#ff8c42';

  // Función para formatear precios según moneda
  const formatProductPrice = (price) => {
    const num = Number(price);
    if (isNaN(num)) return '0.00';
    if (currency === 'BS') return `Bs ${(num * (exchangeRate || 1)).toFixed(2)}`;
    if (currency === 'EUR') return `€${(num * (eurRate || 0.9)).toFixed(2)}`;
    return `$${num.toFixed(2)}`;
  };

  const getEffectivePrice = (product) => {
    if (product.isOnSale && product.salePrice && product.salePrice < product.price) return product.salePrice;
    return product.price;
  };

  const topProducts = [...products]
    .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
    .slice(0, 10);

  if (topProducts.length === 0) return null;

  return (
    <div className="top-products-section">
      {/* 🔻 Título con color directo de la configuración */}
      <div className="section-title" style={{ color: config?.sectionTitleColor || '#1e1e2a' }}>
        🔥 Los más vendidos
      </div>
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
          const effectivePrice = getEffectivePrice(product);
          const firstImage = product.images?.[0] || (product.colors?.[0]?.images?.[0]) || 'https://via.placeholder.com/300';
          return (
            <SwiperSlide key={product.id}>
              <div className="product-card" onClick={() => onProductClick?.(product)}>
                <div className="product-image">
                  <img src={firstImage} alt={product.name} loading="lazy" />
                </div>
                <div className="product-info">
                  <h4>{product.name}</h4>
                  <div className="product-price-wrapper">
                    {product.isOnSale ? (
                      <>
                        <span className="old-price">{formatProductPrice(product.price)}</span>
                        <span className="sale-price" style={{ color: config?.priceColor || primaryColor }}>
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