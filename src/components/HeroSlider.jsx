import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './HeroSlider.css';

function HeroSlider({ slides = [] }) {
  if (!slides.length) return null;
  const shouldLoop = slides.length >= 2;

  return (
    <div className="hero-slider-full">
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        spaceBetween={0}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={shouldLoop}
        className="hero-swiper-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className={`hero-slide-full ${slide.textPosition || 'center-left'}`}>
              <picture>
                <source media="(max-width: 768px)" srcSet={slide.imageMobile || slide.imageDesktop || slide.image} />
                <source media="(min-width: 769px)" srcSet={slide.imageDesktop || slide.imageMobile || slide.image} />
                <img src={slide.imageDesktop || slide.imageMobile || slide.image} alt={slide.title} className="hero-img" />
              </picture>
              <div className="hero-content-full">
                <h2>{slide.title}</h2>
                <p>{slide.subtitle}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default HeroSlider;