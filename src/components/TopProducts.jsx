import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import './TopProducts.css';

function TopProducts({ products, formatPrice, onProductClick, config }) {
  if (products.length === 0) return null;
  const primaryColor = config?.primaryColor || '#ff8c42';

  const getEffectivePrice = (product) => {
    if (product.isOnSale && product.salePrice && product.salePrice < product.price) return product.salePrice;
    return product.price;
  };

  const renderPrice = (product) => {
    if (product.isOnSale && product.salePrice && product.salePrice < product.price) {
      return (
        <div className="product-price-wrapper">
          <span className="old-price">{formatPrice({ price: product.price, priceCurrency: product.priceCurrency })}</span>
          <span className="sale-price" style={{ color: primaryColor }}>
            {formatPrice({ price: product.salePrice, priceCurrency: product.priceCurrency })}
          </span>
        </div>
      );
    }
    return <div className="product-price">{formatPrice({ price: product.price, priceCurrency: product.priceCurrency })}</div>;
  };

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
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <div className="product-card" onClick={() => onProductClick(product)}>
              <div className="product-image">
                <img src={product.images[0]} alt={product.name} loading="lazy" />
              </div>
              <div className="product-info">
                <h4>{product.name}</h4>
                {renderPrice(product)}
                <div className="top-badge" style={{ color: primaryColor }}>⭐ más vendido</div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default TopProducts;