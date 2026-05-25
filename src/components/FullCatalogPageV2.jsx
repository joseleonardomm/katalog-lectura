import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getPublicStoreData } from '../api';
import ProductModal from './ProductModal';
import CartSidebar from './CartSidebar';
import ChatbotWidget from './ChatbotWidget';
import './FullCatalogPageV2.css';

export default function FullCatalogPageV2() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [config, setConfig] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currency, setCurrency] = useState(null);
  const [availableCurrencies, setAvailableCurrencies] = useState([]);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [eurRate, setEurRate] = useState(null);
  const [rateLoading, setRateLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [showOnlyOnSale, setShowOnlyOnSale] = useState(false);

  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [storeUid, setStoreUid] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

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
            price: c.price !== undefined ? c.price : null,
          }));
          if (colors.length === 0) {
            colors.push({
              name: 'General',
              colorValue: '#cccccc',
              stock: p.stock || 0,
              images: p.baseImages || p.images || [],
              price: null,
            });
          }
          return {
            ...p,
            basePrice: priceNum,
            priceCurrency: p.priceCurrency || 'USD',
            isOnSale: p.isOnSale || false,
            salePrice: p.salePrice || null,
            colors,
            hasTechnicalSpecs: p.hasTechnicalSpecs || false,
            technicalSpecs: p.technicalSpecs || {},
          };
        });
        setProducts(normalizedProducts);
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
    if (currency === 'Bs' && config?.showBs) {
      setRateLoading(true);
      setExchangeRate(config?.backupExchangeRate || 7.2);
      setEurRate(config?.backupEurRate || 7.8);
      setRateLoading(false);
    } else {
      setRateLoading(false);
    }
  }, [currency, config]);

  const getUserIdFromSlug = async (slug) => {
    const slugDoc = await getDoc(doc(db, 'slugs', slug));
    return slugDoc.exists() ? slugDoc.data().uid : null;
  };

  const getEffectivePrice = useCallback((product, color = null) => {
    if (color?.price) return color.price;
    if (product.isOnSale && product.salePrice && product.salePrice < product.basePrice)
      return product.salePrice;
    return product.basePrice;
  }, []);

  const addToCart = useCallback((product, quantity = 1, selectedColor = null) => {
    const finalPrice = getEffectivePrice(product, selectedColor);
    const productToAdd = {
      ...product,
      effectivePrice: finalPrice,
      selectedColor,
      nameWithVariant: selectedColor ? `${product.name} (Color: ${selectedColor.name})` : product.name,
    };
    setCart(prev => {
      const existing = prev.find(item =>
        item.id === product.id &&
        JSON.stringify(item.product.selectedColor) === JSON.stringify(selectedColor)
      );
      if (existing) {
        return prev.map(item =>
          item.id === product.id && JSON.stringify(item.product.selectedColor) === JSON.stringify(selectedColor)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { id: product.id, product: productToAdd, quantity }];
    });
  }, [getEffectivePrice]);

  const removeFromCart = (id, selectedColor) => {
    setCart(prev => prev.filter(item =>
      !(item.id === id && JSON.stringify(item.product.selectedColor) === JSON.stringify(selectedColor))
    ));
  };

  const updateQuantity = (id, qty, selectedColor) => {
    if (qty <= 0) removeFromCart(id, selectedColor);
    else
      setCart(prev => prev.map(item =>
        (item.id === id && JSON.stringify(item.product.selectedColor) === JSON.stringify(selectedColor))
          ? { ...item, quantity: qty }
          : item
      ));
  };

  const clearCart = () => setCart([]);
  const getCartTotal = () =>
    cart.reduce((total, item) => total + (item.product.effectivePrice || item.product.basePrice) * item.quantity, 0);

  const formatPrice = useCallback((priceObj) => {
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
  }, [currency, rateLoading, exchangeRate, eurRate]);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (debouncedSearch.trim()) {
      const search = debouncedSearch.toLowerCase();
      result = result.filter(
        p => p.name.toLowerCase().includes(search) ||
             (p.description && p.description.toLowerCase().includes(search))
      );
    }
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }
    if (showOnlyOnSale) {
      result = result.filter(p => p.isOnSale && p.salePrice && p.salePrice < p.basePrice);
    }
    const min = parseFloat(priceMin);
    const max = parseFloat(priceMax);
    if (!isNaN(min)) result = result.filter(p => getEffectivePrice(p) >= min);
    if (!isNaN(max)) result = result.filter(p => getEffectivePrice(p) <= max);
    return result;
  }, [products, debouncedSearch, selectedCategory, priceMin, priceMax, showOnlyOnSale, getEffectivePrice]);

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const getProductImage = (product) => {
    if (product.colors && product.colors[0]?.images?.length > 0) {
      return product.colors[0].images[0];
    }
    return null;
  };

  const handlePriceMinChange = (e) => setPriceMin(e.target.value);
  const handlePriceMaxChange = (e) => setPriceMax(e.target.value);
  const resetFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedCategory('all');
    setPriceMin('');
    setPriceMax('');
    setShowOnlyOnSale(false);
  };

  if (loading) return <div className="catalogv2-loading">Cargando catálogo…</div>;
  if (error) return <div className="catalogv2-error">{error}</div>;
  if (!config) return <div className="catalogv2-error">Configuración no encontrada</div>;

  // ✅ Variables de apariencia completas
  const styleVariables = {
    '--primary': config.primaryColor || '#ff8c42',
    '--secondary': config.secondaryColor || '#e06e1a',
    '--store-bg': config.storeBackgroundColor || '#f8f9fa',
    '--header-text': config.headerTextColor || '#1e1e2a',
    '--header-bg': config.headerBgColor || '#ffffff',
    '--footer-text': config.footerTextColor || '#dddddd',
    '--footer-bg': config.footerBgColor || '#1e1e2a',
    '--footer-title': config.footerTitleColor || '#ffffff',
    '--footer-subtitle': config.footerSubtitleColor || '#a0a0b8',
    '--section-title': config.sectionTitleColor || '#1e1e2a',
    '--category-title': config.categoryTitleColor || '#ffffff',
    '--product-text': config.productTextColor || '#2d3748',
    '--price-color': config.priceColor || config.primaryColor || '#ff8c42',
    '--catalog-btn-bg': config.catalogButtonBg || config.primaryColor || '#ff6b00',
    '--catalog-btn-text': config.catalogButtonText || '#ffffff',
    '--button-primary-bg': config.buttonPrimaryBg || config.primaryColor || '#ff8c42',
    '--button-primary-text': config.buttonPrimaryText || '#ffffff',
    '--button-secondary-bg': config.buttonSecondaryBg || '#edf2f7',
    '--button-secondary-text': config.buttonSecondaryText || '#4a5568',
  };

  return (
    <div className="catalogv2-root" style={{ backgroundColor: 'var(--store-bg)' }}>
      <style>{`:root { ${Object.entries(styleVariables).map(([k,v]) => `${k}: ${v};`).join('\n')} }`}</style>
      <header className="catalogv2-topbar" style={{ backgroundColor: 'var(--header-bg)', color: 'var(--header-text)' }}>
        <button className="catalogv2-back-btn" onClick={() => navigate(`/tienda/${slug}`)} style={{ color: 'var(--header-text)' }}>
          ← Volver a la tienda
        </button>
        <h1 className="catalogv2-title" style={{ color: 'var(--header-text)' }}>Catálogo completo</h1>
        <div className="catalogv2-cart-icon" onClick={() => setIsCartOpen(true)}>
          🛒 {cart.reduce((s, i) => s + i.quantity, 0) > 0 && <span className="cart-count">{cart.reduce((s, i) => s + i.quantity, 0)}</span>}
        </div>
      </header>

      <main className="catalogv2-main">
        <section className="catalogv2-filters">
          <div className="filter-card">
            <div className="filter-search-box">
              <input
                type="text"
                placeholder="🔍 Buscar productos…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-categories">
              <div className="categories-scroll">
                <button
                  className={`category-chip ${selectedCategory === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('all')}
                >
                  Todos
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    className={`category-chip ${selectedCategory === cat.name ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat.name)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-controls">
              <div className="filter-price-range">
                <span className="price-label">Precio:</span>
                <input
                  type="number"
                  placeholder="Mín"
                  value={priceMin}
                  onChange={handlePriceMinChange}
                  className="price-input"
                />
                <span className="price-separator">—</span>
                <input
                  type="number"
                  placeholder="Máx"
                  value={priceMax}
                  onChange={handlePriceMaxChange}
                  className="price-input"
                />
              </div>
              <div className="filter-actions">
                <label className="toggle-sale">
                  <input
                    type="checkbox"
                    checked={showOnlyOnSale}
                    onChange={() => setShowOnlyOnSale(!showOnlyOnSale)}
                  />
                  <span className="toggle-label">Solo ofertas</span>
                </label>
                <button className="reset-btn" onClick={resetFilters}>
                  ✕ Limpiar
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="catalogv2-grid">
          {filteredProducts.length === 0 ? (
            <div className="catalogv2-empty">No se encontraron productos.</div>
          ) : (
            filteredProducts.map(product => {
              const imageUrl = getProductImage(product);
              const effective = getEffectivePrice(product);
              const whatsappLink = `https://wa.me/${config.whatsappNumber || ''}?text=${encodeURIComponent(
                `Hola, me interesa ${product.name} (${formatPrice({ price: effective, priceCurrency: product.priceCurrency })})`
              )}`;
              return (
                <div key={product.id} className="catalogv2-card" onClick={() => openProductModal(product)}>
                  <div className="card-image">
                    <img src={imageUrl || '/placeholder.svg'} alt={product.name} loading="lazy" />
                    {product.isOnSale && product.salePrice && (
                      <span className="sale-badge">Oferta</span>
                    )}
                  </div>
                  <div className="card-info">
                    <h3 className="card-name" style={{ color: 'var(--product-text)' }}>{product.name}</h3>
                    {product.description && (
                      <p className="card-description" style={{ color: 'var(--product-text)' }}>
                        {product.description.length > 80
                          ? product.description.substring(0, 80) + '…'
                          : product.description}
                      </p>
                    )}
                    <div className="card-price">
                      {product.isOnSale && product.salePrice ? (
                        <>
                          <span className="old-price">
                            {formatPrice({ price: product.basePrice, priceCurrency: product.priceCurrency })}
                          </span>
                          <span className="current-price" style={{ color: 'var(--price-color)' }}>
                            {formatPrice({ price: product.salePrice, priceCurrency: product.priceCurrency })}
                          </span>
                        </>
                      ) : (
                        <span className="current-price" style={{ color: 'var(--price-color)' }}>
                          {formatPrice({ price: effective, priceCurrency: product.priceCurrency })}
                        </span>
                      )}
                    </div>
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
                    <button
                      className="card-add-btn"
                      style={{ backgroundColor: 'var(--catalog-btn-bg)', color: 'var(--catalog-btn-text)' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                    >
                      🛒 Agregar
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </main>

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
      <ChatbotWidget config={config} uid={storeUid} />
    </div>
  );
}