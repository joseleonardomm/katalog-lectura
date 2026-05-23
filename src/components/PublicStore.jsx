import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Header from './Header';
import HeroSlider from './HeroSlider';
import FullCategories from './FullCategories';
import ProductModal from './ProductModal';
import CartSidebar from './CartSidebar';
import ChatbotWidget from './ChatbotWidget';
import { getPublicStoreData, getPlanByUid, getPlansConfig } from '../api';
import './PublicStore.css';

export default function PublicStore() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [config, setConfig] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [plan, setPlan] = useState('free');
  const [hiddenCount, setHiddenCount] = useState(0);
  const [cart, setCart] = useState([]);
  const [currency, setCurrency] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [eurRate, setEurRate] = useState(null);
  const [rateLoading, setRateLoading] = useState(false);
  const [availableCurrencies, setAvailableCurrencies] = useState([]);
  const [storeUid, setStoreUid] = useState(null);

  // Para ocultar herramientas según el plan
  const [planFeatures, setPlanFeatures] = useState({});

  const getUserIdFromSlug = async (slug) => {
    const slugDoc = await getDoc(doc(db, 'slugs', slug));
    if (!slugDoc.exists()) return null;
    return slugDoc.data().uid;
  };

  useEffect(() => {
    if (!slug) return;
    const loadStore = async () => {
      try {
        const uid = await getUserIdFromSlug(slug);
        setStoreUid(uid);
        if (!uid) {
          setError('Tienda no encontrada');
          return;
        }
        const { products: prods, config: cfg } = await getPublicStoreData(slug);
        const normalizedProducts = (prods || []).map(p => {
          let priceNum = p.basePrice !== undefined ? p.basePrice : p.price;
          if (typeof priceNum === 'string') priceNum = parseFloat(priceNum);
          if (isNaN(priceNum)) priceNum = 0;
          const colors = (p.colors || []).map(c => ({
            ...c,
            images: c.images || [],
            stock: c.stock !== undefined ? c.stock : 0,
            price: c.price !== undefined ? c.price : null
          }));
          if (colors.length === 0) {
            colors.push({
              name: 'General',
              colorValue: '#cccccc',
              stock: p.stock || 0,
              images: p.baseImages || p.images || [],
              price: null
            });
          }
          return {
            ...p,
            basePrice: priceNum,
            priceCurrency: p.priceCurrency || 'USD',
            createdAt: p.createdAt || p.id,
            isOnSale: p.isOnSale || false,
            salePrice: p.salePrice,
            hasSizes: false,
            globalSizes: [],
            hasColors: colors.length > 1,
            colors: colors,
            hasTechnicalSpecs: p.hasTechnicalSpecs || false,
            technicalSpecs: p.technicalSpecs || {},
            isTopSeller: p.isTopSeller || false,
            stock: p.stock || 0
          };
        });
        const sortedProducts = [...normalizedProducts].sort((a, b) => (b.createdAt - a.createdAt));
        
        const userPlan = await getPlanByUid(uid);
        setPlan(userPlan);
        
        // Obtener límite dinámico desde la configuración de planes
        const plansConfig = await getPlansConfig();
        const planLimitValue = plansConfig[userPlan]?.productLimit ?? null;
        const limit = planLimitValue === null ? Infinity : planLimitValue;
        
        // Guardar features del plan para ocultar herramientas
        setPlanFeatures(plansConfig[userPlan]?.features || {});
        
        const visible = sortedProducts.slice(0, limit);
        setDisplayedProducts(visible);
        setHiddenCount(sortedProducts.length - visible.length);
        setProducts(sortedProducts);
        setConfig(cfg);
        
        const baseSymbol = cfg?.baseCurrency === 'USD' ? '$' : '€';
        const currencies = [{ code: cfg?.baseCurrency || 'USD', symbol: baseSymbol }];
        if (cfg?.showBs) currencies.push({ code: 'Bs', symbol: 'Bs' });
        setAvailableCurrencies(currencies);
        if (!currency) setCurrency(currencies[0].code);
        
        const catsSnapshot = await getDocs(collection(db, `users/${uid}/categories`));
        const cats = catsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategories(cats);
      } catch (err) {
        console.error(err);
        setError('Error al cargar la tienda');
      } finally {
        setLoading(false);
      }
    };
    loadStore();
  }, [slug]);

  useEffect(() => {
    const fetchRates = async () => {
      if (currency === 'Bs' && config?.showBs) {
        setRateLoading(true);
        setExchangeRate(config?.backupExchangeRate || 7.2);
        setEurRate(config?.backupEurRate || 7.8);
        setRateLoading(false);
      } else {
        setRateLoading(false);
      }
    };
    if (currency && config) fetchRates();
  }, [currency, config]);

  const filteredProducts = displayedProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const getEffectivePrice = (product, color = null) => {
    if (color?.price !== undefined && color?.price !== null) return color.price;
    if (product.isOnSale && product.salePrice && product.salePrice < product.basePrice) return product.salePrice;
    return product.basePrice;
  };

  const addToCart = (product, quantity = 1, selectedColor = null, selectedSize = null, effectivePrice = null) => {
    let finalPrice = effectivePrice;
    if (finalPrice === null) {
      finalPrice = getEffectivePrice(product, selectedColor);
    }
    const variantDescriptor = selectedColor ? `Color: ${selectedColor.name}` : '';
    const productToAdd = {
      ...product,
      effectivePrice: finalPrice,
      selectedColor,
      selectedSize,
      nameWithVariant: variantDescriptor ? `${product.name} (${variantDescriptor})` : product.name
    };
    setCart(prev => {
      const existing = prev.find(item =>
        item.id === product.id &&
        JSON.stringify(item.product.selectedColor) === JSON.stringify(selectedColor)
      );
      if (existing) {
        return prev.map(item =>
          (item.id === product.id && JSON.stringify(item.product.selectedColor) === JSON.stringify(selectedColor))
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { id: product.id, product: productToAdd, quantity }];
    });
  };

  const removeFromCart = (id, selectedColor) => {
    setCart(prev => prev.filter(item =>
      !(item.id === id && JSON.stringify(item.product.selectedColor) === JSON.stringify(selectedColor))
    ));
  };

  const updateQuantity = (id, qty, selectedColor) => {
    if (qty <= 0) {
      removeFromCart(id, selectedColor);
    } else {
      setCart(prev => prev.map(item =>
        (item.id === id && JSON.stringify(item.product.selectedColor) === JSON.stringify(selectedColor))
          ? { ...item, quantity: qty }
          : item
      ));
    }
  };

  const clearCart = () => setCart([]);
  const getCartTotal = () => cart.reduce((total, item) => total + (item.product.effectivePrice || item.product.basePrice) * item.quantity, 0);

  const formatPrice = (priceObj) => {
    let price = priceObj.price;
    if (typeof price === 'string') price = parseFloat(price);
    if (isNaN(price)) price = 0;
    const priceCurrency = priceObj.priceCurrency || 'USD';
    if (currency === priceCurrency) {
      const symbol = priceCurrency === 'USD' ? '$' : '€';
      return `${symbol}${price.toFixed(2)}`;
    }
    if (currency === 'Bs') {
      if (rateLoading) return 'Cargando...';
      let rate = priceCurrency === 'USD' ? exchangeRate : eurRate;
      if (rate === null) return 'Error';
      return `Bs ${(price * rate).toFixed(2)}`;
    }
    const symbol = priceCurrency === 'USD' ? '$' : '€';
    return `${symbol}${price.toFixed(2)}`;
  };

  const openProductModal = (product) => { setSelectedProduct(product); setIsModalOpen(true); };
  const hasSearch = searchTerm.trim().length > 0;

  const renderPrice = (product) => {
    const effective = getEffectivePrice(product);
    if (product.isOnSale && product.salePrice && product.salePrice < product.basePrice) {
      return (
        <div className="product-price-wrapper">
          <span className="old-price">{formatPrice({ price: product.basePrice, priceCurrency: product.priceCurrency })}</span>
          <span className="sale-price" style={{ color: config.priceColor || config.primaryColor }}>
            {formatPrice({ price: product.salePrice, priceCurrency: product.priceCurrency })}
          </span>
        </div>
      );
    }
    return <div className="product-price">{formatPrice({ price: effective, priceCurrency: product.priceCurrency })}</div>;
  };

  const getProductImage = (product) => {
    if (product.colors && product.colors.length > 0 && product.colors[0].images && product.colors[0].images.length > 0) {
      return product.colors[0].images[0];
    }
    return null;
  };

  if (loading) return <div className="store-loading">Cargando tienda...</div>;
  if (error) return <div className="store-error">{error}</div>;
  if (!config) return <div className="store-error">Configuración no encontrada</div>;

  const styleVariables = {
    '--primary': config.primaryColor || '#ff8c42',
    '--secondary': config.secondaryColor || '#e06e1a',
    '--header-text': config.headerTextColor || '#1e1e2a',
    '--header-bg': config.headerBgColor || '#ffffff',
    '--footer-text': config.footerTextColor || '#dddddd',
    '--footer-bg': config.footerBgColor || '#1e1e2a',
    '--section-title': config.sectionTitleColor || '#1e1e2a',
    '--product-text': config.productTextColor || '#2d3748',
    '--price-color': config.priceColor || config.primaryColor || '#ff8c42',
    '--button-primary-bg': config.buttonPrimaryBg || config.primaryColor || '#ff8c42',
    '--button-primary-text': config.buttonPrimaryText || '#ffffff',
    '--button-secondary-bg': config.buttonSecondaryBg || '#edf2f7',
    '--button-secondary-text': config.buttonSecondaryText || '#4a5568',
  };

  return (
    <>
      <style>{`:root { ${Object.entries(styleVariables).map(([k,v]) => `${k}: ${v};`).join('\n')} }`}</style>
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        currencies={availableCurrencies}
        currency={currency}
        setCurrency={setCurrency}
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
        formatPrice={formatPrice}
        config={config}
      />
      <main className="main-content">
        {!hasSearch && <HeroSlider slides={config.heroSlides || []} />}
        <div className="container">
          <FullCategories categories={categories} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
          <div className="section-title">
            {hasSearch ? `Resultados de búsqueda (${filteredProducts.length})` : selectedCategory ? `Productos de ${selectedCategory} (${filteredProducts.length})` : 'Todos los productos'}
          </div>
          {hiddenCount > 0 && (
            <div className="hidden-products-banner">
              ⚠️ Tu plan actual ({plan === 'free' ? 'Gratis' : plan === 'pro' ? 'Pro' : 'Business'}) solo permite mostrar los primeros {plan === 'free' ? 15 : plan === 'pro' ? 150 : 'todos'} productos. Hay {hiddenCount} productos ocultos. <a href="/register?upgrade=true">Mejora tu plan</a> para mostrarlos todos.
            </div>
          )}
          <div className="products-grid">
            {filteredProducts.map(product => {
              const effective = getEffectivePrice(product);
              const whatsappLink = `https://wa.me/${config.whatsappNumber || ''}?text=${encodeURIComponent(`Hola, me interesa ${product.name} (${formatPrice({ price: effective, priceCurrency: product.priceCurrency })})`)}`;
              const imageUrl = getProductImage(product);
              return (
                <div key={product.id} className="product-card">
                  <div className="product-image" onClick={() => openProductModal(product)}>
                    <img src={imageUrl || '/placeholder.svg'} alt={product.name} />
                    {product.isOnSale && product.salePrice && product.salePrice < product.basePrice && (
                      <span className="sale-badge">Oferta</span>
                    )}
                  </div>
                  <div className="product-info">
                    <h3 onClick={() => openProductModal(product)}>{product.name}</h3>
                    {product.description && (
                      <p className="product-description-short">
                        {product.description.length > 80
                          ? product.description.substring(0, 80) + '…'
                          : product.description}
                      </p>
                    )}
                    {renderPrice(product)}
                    {product.colors && product.colors.length > 1 && (
                      <div className="color-swatches-mini">
                        {product.colors.map((color, idx) => (
                          <span
                            key={idx}
                            className="mini-swatch"
                            style={{ backgroundColor: color.colorValue || '#ccc' }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    )}
                    <div className="product-buttons">
                      <button className="btn-add-to-cart" onClick={() => addToCart(product)}>🛍️ Agregar</button>
                      <button className="btn-whatsapp" onClick={() => window.open(whatsappLink, '_blank')}>📲 WhatsApp</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {planFeatures.fullCatalog !== false && (
            <div className="full-catalog-button">
              <button
                className="btn-open-full-catalog"
                style={{
                  background: 'var(--button-primary-bg, #ff8c42)',
                  color: 'var(--button-primary-text, white)',
                }}
                onClick={() => navigate(`/catalogo-v2/${slug}`)}
              >
                📂 Abrir catálogo completo
              </button>
            </div>
          )}

          {filteredProducts.length === 0 && (
            <div className="empty-state">
              {hasSearch ? `No se encontraron productos para "${searchTerm}"` : selectedCategory ? `No hay productos en la categoría "${selectedCategory}"` : 'No hay productos disponibles'}
            </div>
          )}
        </div>
      </main>
      <footer className="footer" style={{ backgroundColor: 'var(--footer-bg, #1e1e2a)' }}>
        <div className="container">
          <div className="footer-grid">
            <div>
              <h3 style={{ color: config.primaryColor }}>{config.siteName}</h3>
              <p>Tienda virtual</p>
              <div className="social-icons">
                {config.socialLinks?.instagram && <a href={config.socialLinks.instagram} target="_blank"><i className="fab fa-instagram"></i></a>}
                {config.socialLinks?.facebook && <a href={config.socialLinks.facebook} target="_blank"><i className="fab fa-facebook"></i></a>}
              </div>
            </div>
            <div>
              <h4>Contacto</h4>
              <p><i className="fas fa-phone-alt"></i> {config.location?.phone}<br /><i className="fas fa-envelope"></i> {config.location?.email}</p>
              <h4>Horario</h4>
              <p>{config.location?.schedule}</p>
            </div>
            <div>
              <h4>Ubicación</h4>
              <p>{config.location?.address || 'Dirección no disponible'}</p>
              {(config.location?.mapEmbed || config.location?.address) && (
                <a href={config.location?.mapEmbed || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.location.address)}`} target="_blank" rel="noopener noreferrer" className="map-button">🗺️ Abrir en Google Maps</a>
              )}
            </div>
          </div>
          <div className="footer-bottom">{config.footerText}</div>
        </div>
      </footer>
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onClear={clearCart}
        formatPrice={formatPrice}
        total={getCartTotal()}
        config={config}
      />
      <ProductModal
        isOpen={isModalOpen}
        product={selectedProduct}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={addToCart}
        formatPrice={formatPrice}
        currency={currency}
        config={config}
      />
      {planFeatures.chatbot !== false && <ChatbotWidget config={config} uid={storeUid} />}
    </>
  );
}