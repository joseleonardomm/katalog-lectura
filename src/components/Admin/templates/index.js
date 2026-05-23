import AmazonStyle from './AmazonStyle';
import PhotographyStyle from './PhotographyStyle';
import InstagramStyle from './InstagramStyle';
import HeroProductStyle from './HeroProductStyle';
import DetailsStyle from './DetailsStyle';

export const formats = {
  'story-9-16': { label: 'Historia (9:16)', width: 1080, height: 1920, icon: '📱' },
};

export const templates = [
  {
    id: 'amazon',
    name: 'Amazon Style',
    icon: '📦',
    component: AmazonStyle,
    defaults: {
      backgroundColor: '#f0f0f0',      // nuevo color por defecto
      textScale: 1,
      textPosY: 11,
      showStars: true,
      showDescription: true,
      showThumbnails: true,
      showGlow: false,
    },
    features: {
      allowBackground: true,           // ahora se puede cambiar el fondo
      design: ['stars', 'description', 'thumbnails', 'glow', 'textVerticalPosition'],
      allowTextScale: true,
      allowTextPosition: false,
      allowTextAlign: false,
      allowTitleColor: true,
      allowPriceColor: true,
      allowDetailsColor: false,
      allowCustomText: true,
      allowShadow: false,
    },
  },
  // ... el resto de plantillas igual que antes (photography, instagram, hero, details)
  {
    id: 'photography',
    name: 'Fotografía',
    icon: '📷',
    component: PhotographyStyle,
    defaults: {
      backgroundColor: '#000000',
      textScale: 0.7,
      textPosX: 49,
      textPosY: 85,
      textAlign: 'left',
      imageFilter: 'none',
      shadowColor: '#000000',
      shadowIntensity: 5,
    },
    features: {
      allowBackground: false,
      design: ['imageFilter'],
      allowTextScale: true,
      allowTextPosition: true,
      allowTextAlign: true,
      allowTitleColor: true,
      allowPriceColor: true,
      allowDetailsColor: false,
      allowCustomText: true,
      allowShadow: true,
    },
  },
  {
    id: 'instagram',
    name: 'Instagram Post',
    icon: '📱',
    component: InstagramStyle,
    defaults: {
      backgroundColor: '#ffffff',
      textScale: 1,
      showComments: true,
      titleSize: '1rem',
      priceSize: '1.1rem',
    },
    features: {
      allowBackground: false,
      design: ['comments'],
      allowTextScale: true,
      allowTextPosition: false,
      allowTextAlign: false,
      allowTitleColor: true,
      allowPriceColor: true,
      allowDetailsColor: false,
      allowCustomText: true,
      allowShadow: false,
    },
  },
  {
    id: 'hero',
    name: 'Producto Destacado',
    icon: '⭐',
    component: HeroProductStyle,
    defaults: {
      backgroundColor: '#000000',
      textScale: 0.7,
      showStars: true,
      showDescription: true,
      showGlow: false,
    },
    features: {
      allowBackground: true,
      design: ['stars', 'description', 'glow'],
      allowTextScale: true,
      allowTextPosition: false,
      allowTextAlign: false,
      allowTitleColor: true,
      allowPriceColor: true,
      allowDetailsColor: false,
      allowCustomText: true,
      allowShadow: false,
    },
  },
  {
    id: 'details',
    name: 'Ficha Técnica',
    icon: '📋',
    component: DetailsStyle,
    defaults: {
      backgroundColor: '#000000',
      textScale: 0.7,
      showPrice: true,
      detailsLines: [],
    },
    features: {
      allowBackground: true,
      design: ['showPrice', 'detailsLines'],
      allowTextScale: true,
      allowTextPosition: false,
      allowTextAlign: false,
      allowTitleColor: true,
      allowPriceColor: true,
      allowDetailsColor: true,
      allowCustomText: false,
      allowShadow: false,
    },
  },
];