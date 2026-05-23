// Solo formato historia 9:16 por ahora
export const formats = {
  'story-9-16': { label: 'Historia (9:16)', width: 1080, height: 1920, icon: '📱' },
};

// Plantillas predefinidas para historia
export const templates = [
  {
    id: 'producto-destacado',
    name: 'Producto Destacado',
    icon: '⭐',
    defaults: {
      textPosX: 50,
      textPosY: 71,
      logoPosition: 'bottom-right',
      backgroundColor: '#000000',
      titleColor: '#ffffff',
      priceColor: '#ffffff',
      textAlign: 'center',
      imageScale: 85,
    },
    styles: {
      background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
      imageAreaHeight: '60%',
      imageFit: 'cover',
      imageWidth: '85%',
      imageMaxHeight: '90%',
      imageBorderRadius: '20px',
      nameFontSize: '2.5rem',
      priceFontSize: '3rem',
      oldPriceFontSize: '1.8rem',
      customTextFontSize: '1.6rem',
      textBlockWidth: '90%',
    },
  },
  {
    id: 'oferta',
    name: 'Oferta / Sale',
    icon: '🔥',
    defaults: {
      textPosX: 50,
      textPosY: 71,
      logoPosition: 'bottom-right',
      backgroundColor: '#000000',
      titleColor: '#ffffff',
      priceColor: '#ffe100',
      textAlign: 'center',
      imageScale: 85,
    },
    styles: {
      background: 'linear-gradient(45deg, #1a1a1a, #2d2d2d)',
      imageAreaHeight: '55%',
      imageFit: 'cover',
      imageWidth: '75%',
      imageMaxHeight: '85%',
      imageBorderRadius: '50%',
      nameFontSize: '2.2rem',
      priceFontSize: '3.5rem',
      oldPriceFontSize: '1.8rem',
      customTextFontSize: '1.6rem',
      textBlockWidth: '90%',
    },
  },
];