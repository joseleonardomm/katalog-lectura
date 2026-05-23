import { useState, useEffect, useRef } from 'react';
import { getProducts, getConfig } from '../../api';
import { formats, templates } from './templates/index';
import html2canvas from 'html2canvas';
import {
  FaSearch, FaPalette, FaFont, FaImage, FaSlidersH, FaDownload, FaExpand, FaTimes, FaStar,
} from 'react-icons/fa';
import './ContentCreator.css';

export default function ContentCreator() {
  const [products, setProducts] = useState([]);
  const [config, setConfig] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  const [selectedFormat] = useState('story-9-16');
  const [customText, setCustomText] = useState('');
  const [showLogo, setShowLogo] = useState(true);
  const [logoPosition, setLogoPosition] = useState('bottom-right');
  const [overlayColor, setOverlayColor] = useState('#000000');
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const previewRef = useRef(null);

  const [productSearch, setProductSearch] = useState('');
  const [showProductGrid, setShowProductGrid] = useState(false);

  const [titleColor, setTitleColor] = useState('#ffffff');
  const [priceColor, setPriceColor] = useState('#ffffff');
  const [detailsColor, setDetailsColor] = useState('#ffffff');

  const [templateOptions, setTemplateOptions] = useState({});
  const [detailsLines, setDetailsLines] = useState([]);

  const [naturalWidth, setNaturalWidth] = useState(1080);
  const [naturalHeight, setNaturalHeight] = useState(1920);

  const [activeTool, setActiveTool] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const [prods, cfg] = await Promise.all([getProducts(), getConfig()]);
      setProducts(prods);
      setConfig(cfg);
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedTemplate) return;
    const def = selectedTemplate.defaults || {};
    setOverlayColor(def.backgroundColor || '#000000');

    if (selectedTemplate.id === 'amazon' || selectedTemplate.id === 'instagram') {
      setTitleColor('#111111'); setPriceColor('#111111');
    } else if (selectedTemplate.id === 'details') {
      setTitleColor('#ffffff'); setPriceColor('#ffd700'); setDetailsColor('#ffffff');
    } else {
      setTitleColor('#ffffff'); setPriceColor('#ffffff');
    }

    setTemplateOptions({ ...def });
    if (selectedTemplate.id === 'details') setDetailsLines(def.detailsLines || ['']);
    else setDetailsLines([]);

    setCustomText('');
    setActiveTool(null);
  }, [selectedTemplate]);

  const selectedProduct = products.find(p => p.id === selectedProductId) || null;
  const currentColor = selectedProduct?.colors?.[selectedColorIndex] || null;
  const productImage = currentColor?.images?.[0] || null;
  const primaryColor = config?.primaryColor || '#ff6b00';
  const secondaryColor = config?.secondaryColor || '#e06e1a';
  const logoUrl = config?.logoUrl || '';
  const priceCurrency = selectedProduct?.priceCurrency || 'USD';
  const currencySymbol = priceCurrency === 'USD' ? '$' : '€';

  const formatMoney = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '';
    return `${currencySymbol}${num.toFixed(2)}`;
  };

  const effectivePrice = selectedProduct
    ? (selectedProduct.isOnSale && selectedProduct.salePrice && selectedProduct.salePrice < selectedProduct.basePrice)
      ? selectedProduct.salePrice : selectedProduct.basePrice
    : 0;

  useEffect(() => {
    if (selectedTemplate?.id === 'photography' && productImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => { setNaturalWidth(img.naturalWidth); setNaturalHeight(img.naturalHeight); };
      img.src = productImage;
    }
  }, [productImage, selectedTemplate]);

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));
  const getProductThumb = (product) => (product.colors && product.colors[0]?.images?.[0]) || null;

  const handleSelectProduct = (productId) => {
    setSelectedProductId(productId);
    setSelectedColorIndex(0);
    setShowProductGrid(false);
    setProductSearch('');
  };

  const handleTemplateSelect = (template) => setSelectedTemplate(template);

  const addDetailLine = () => setDetailsLines(prev => [...prev, '']);
  const updateDetailLine = (index, value) => setDetailsLines(prev => { const u=[...prev]; u[index]=value; return u; });
  const removeDetailLine = (index) => { if(detailsLines.length<=1)return; setDetailsLines(prev=>prev.filter((_,i)=>i!==index)); };

  // ==================== DESCARGA SIN ZOOM ====================
  const downloadImage = async () => {
    if (!previewRef.current) return;

    // Dimensiones destino
    let targetWidth, targetHeight;
    if (selectedTemplate?.id === 'photography') {
      targetWidth = naturalWidth;
      targetHeight = naturalHeight;
    } else {
      const f = formats[selectedFormat];
      targetWidth = f.width;
      targetHeight = f.height;
    }

    // Crear un contenedor oculto del tamaño final
    const cloneContainer = document.createElement('div');
    cloneContainer.style.position = 'absolute';
    cloneContainer.style.left = '-9999px';
    cloneContainer.style.top = '-9999px';
    cloneContainer.style.width = `${targetWidth}px`;
    cloneContainer.style.height = `${targetHeight}px`;
    cloneContainer.style.overflow = 'hidden';
    cloneContainer.style.fontFamily = 'Inter, system-ui, sans-serif';
    cloneContainer.style.background = overlayColor || '#000000';

    // Clonar el contenido del preview actual
    const clone = previewRef.current.cloneNode(true);
    clone.style.width = '100%';
    clone.style.height = '100%';
    clone.style.maxWidth = 'none';
    clone.style.maxHeight = 'none';
    clone.style.aspectRatio = 'auto';

    // Asegurar que todas las imágenes estén cargadas
    const images = clone.querySelectorAll('img');
    await Promise.all(
      Array.from(images).map(img =>
        img.complete ? Promise.resolve() : new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        })
      )
    );

    cloneContainer.appendChild(clone);
    document.body.appendChild(cloneContainer);

    try {
      // Ajustar la escala de fuentes para que coincida con el tamaño final
      const currentWidth = previewRef.current.offsetWidth || 280;
      const scaleFactor = targetWidth / currentWidth;
      const baseFontSize = 16;
      const originalRootFontSize = document.documentElement.style.fontSize;
      document.documentElement.style.fontSize = `${baseFontSize * scaleFactor}px`;

      const canvas = await html2canvas(cloneContainer, {
        scale: 2,               // nitidez extra
        useCORS: true,
        allowTaint: false,
        backgroundColor: null,
      });

      // Restaurar tamaño de fuente raíz
      document.documentElement.style.fontSize = originalRootFontSize;

      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `katalog-${selectedProduct?.name || 'producto'}-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (err) {
      console.error('Error al generar imagen', err);
      alert('Error al generar la imagen.');
    } finally {
      // Limpiar el clon
      document.body.removeChild(cloneContainer);
    }
  };

  const format = formats[selectedFormat];
  const previewStyles = (() => {
    const base = {
      fontFamily: 'Inter, system-ui, sans-serif',
      margin: '0 auto',
      position: 'relative',
      overflow: 'hidden',
      background: overlayColor || '#000000',
    };
    if (selectedTemplate?.id === 'photography') {
      const ratio = naturalHeight / naturalWidth;
      return { ...base, width: '100%', maxWidth: '280px', height: `${280 * ratio}px`, maxHeight: '460px' };
    } else {
      return { ...base, width: '100%', maxWidth: '280px', aspectRatio: `${format.width}/${format.height}` };
    }
  })();

  const glowImageStyle = templateOptions.showGlow
    ? { boxShadow: `0 0 ${(templateOptions.glowIntensity || 5) * 4}px ${templateOptions.glowColor || '#ffd700'}` }
    : {};

  const finalTemplateOptions =
    selectedTemplate.id === 'details'
      ? { ...templateOptions, detailsLines }
      : templateOptions;

  const commonProps = {
    product: selectedProduct,
    currentColor,
    productImage,
    effectivePrice,
    formatMoney,
    priceCurrency,
    customText,
    options: finalTemplateOptions,
    glowImageStyle,
    templateStyle: previewStyles,
    titleColor,
    priceColor,
    detailsColor,
    backgroundColor: overlayColor,
    showLogo,
    logoUrl,
    logoPosition,
    siteName: config?.siteName,
  };
  const TemplateComponent = selectedTemplate?.component;

  const features = selectedTemplate.features || {};

  const tools = [
    { id: 'product', icon: <FaSearch />, label: 'Producto' },
    { id: 'template', icon: <FaPalette />, label: 'Plantilla' },
    { id: 'design', icon: <FaSlidersH />, label: 'Diseño' },
    { id: 'text', icon: <FaFont />, label: 'Texto' },
    { id: 'logo', icon: <FaStar />, label: 'Logo' },
    { id: 'background', icon: <FaImage />, label: 'Fondo' },
    { id: 'download', icon: <FaDownload />, label: 'Descargar' },
  ];

  const renderToolPanel = () => {
    if (!activeTool) return null;

    const unavailable = (msg = 'No disponible para esta plantilla') => (
      <div className="unavailable-msg">{msg}</div>
    );

    return (
      <div className="studio-sidebar">
        <div className="sidebar-header">
          <span>{tools.find(t => t.id === activeTool)?.label || ''}</span>
          <button className="icon-btn" onClick={() => setActiveTool(null)}><FaTimes /></button>
        </div>
        <div className="sidebar-content">
          {/* PRODUCTO */}
          {activeTool === 'product' && (
            <>
              <div className="product-search-wrapper">
                <input
                  type="text" placeholder="Buscar producto..." value={productSearch}
                  onChange={e => { setProductSearch(e.target.value); setShowProductGrid(true); }}
                  onFocus={() => setShowProductGrid(true)}
                />
                {showProductGrid && productSearch && (
                  <div className="product-dropdown">
                    {filteredProducts.length === 0 ? <div className="no-results">Sin resultados</div> :
                      filteredProducts.slice(0, 20).map(p => (
                        <div key={p.id} className={`product-dropdown-item ${selectedProductId === p.id ? 'selected' : ''}`}
                          onClick={() => handleSelectProduct(p.id)}>
                          <img src={getProductThumb(p) || '/placeholder.svg'} alt={p.name} />
                          <span>{p.name}</span>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
              {selectedProduct && (
                <div className="selected-product-badge">
                  <img src={getProductThumb(selectedProduct) || '/placeholder.svg'} alt={selectedProduct.name} />
                  <span>{selectedProduct.name}</span>
                  <button className="btn-change" onClick={() => setShowProductGrid(true)}>Cambiar</button>
                </div>
              )}
              {selectedProduct && selectedProduct.colors?.length > 1 && (
                <div className="color-options" style={{ marginTop: '0.5rem' }}>
                  {selectedProduct.colors.map((c, i) => (
                    <button key={i} className={`color-card ${i === selectedColorIndex ? 'active' : ''}`}
                      onClick={() => setSelectedColorIndex(i)}>
                      <img src={c.images?.[0] || '/placeholder.svg'} alt={c.name} style={{ backgroundColor: c.colorValue || '#ccc' }} />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* PLANTILLA */}
          {activeTool === 'template' && (
            <div className="template-list">
              {templates.map(t => (
                <button key={t.id} className={`template-card ${selectedTemplate.id === t.id ? 'active' : ''}`}
                  onClick={() => handleTemplateSelect(t)}>
                  {t.icon} {t.name}
                </button>
              ))}
            </div>
          )}

          {/* DISEÑO */}
          {activeTool === 'design' && (
            <>
              {features.design?.includes('stars') && (
                <label className="checkbox-group"><input type="checkbox" checked={templateOptions.showStars !== false} onChange={() => setTemplateOptions(prev => ({ ...prev, showStars: !prev.showStars }))} /> Mostrar estrellas</label>
              )}
              {features.design?.includes('description') && (
                <label className="checkbox-group"><input type="checkbox" checked={templateOptions.showDescription !== false} onChange={() => setTemplateOptions(prev => ({ ...prev, showDescription: !prev.showDescription }))} /> Mostrar descripción</label>
              )}
              {features.design?.includes('thumbnails') && (
                <label className="checkbox-group"><input type="checkbox" checked={templateOptions.showThumbnails !== false} onChange={() => setTemplateOptions(prev => ({ ...prev, showThumbnails: !prev.showThumbnails }))} /> Mostrar miniaturas</label>
              )}
              {features.design?.includes('comments') && (
                <label className="checkbox-group"><input type="checkbox" checked={templateOptions.showComments !== false} onChange={() => setTemplateOptions(prev => ({ ...prev, showComments: !prev.showComments }))} /> Mostrar comentarios</label>
              )}
              {features.design?.includes('imageFilter') && (
                <>
                  <label>Filtro de imagen</label>
                  <select value={templateOptions.imageFilter || 'none'} onChange={e => setTemplateOptions(prev => ({ ...prev, imageFilter: e.target.value }))}>
                    <option value="none">Normal</option><option value="grayscale">Blanco y negro</option><option value="sepia">Sepia</option><option value="blur">Difuminado</option>
                  </select>
                </>
              )}
              {features.design?.includes('showPrice') && (
                <label className="checkbox-group"><input type="checkbox" checked={templateOptions.showPrice !== false} onChange={() => setTemplateOptions(prev => ({ ...prev, showPrice: !prev.showPrice }))} /> Mostrar precio</label>
              )}
              {features.design?.includes('detailsLines') && (
                <>
                  <label>Características del producto</label>
                  <div className="details-lines">
                    {detailsLines.map((line, idx) => (
                      <div key={idx} className="detail-row">
                        <input type="text" value={line} onChange={e => updateDetailLine(idx, e.target.value)} placeholder={`Característica ${idx + 1}`} />
                        {detailsLines.length > 1 && <button onClick={() => removeDetailLine(idx)}>✕</button>}
                      </div>
                    ))}
                    <button
                      onClick={addDetailLine}
                      style={{
                        background: 'var(--accent)',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        marginTop: '0.3rem',
                      }}
                    >
                      + Agregar característica
                    </button>
                  </div>
                </>
              )}
              {features.design?.includes('glow') && (
                <>
                  <label className="checkbox-group"><input type="checkbox" checked={templateOptions.showGlow !== false} onChange={() => setTemplateOptions(prev => ({ ...prev, showGlow: !prev.showGlow }))} /> Aplicar resplandor</label>
                  {templateOptions.showGlow && (
                    <>
                      <div className="control-group"><label>Color resplandor</label><input type="color" value={templateOptions.glowColor || '#ffd700'} onChange={e => setTemplateOptions(prev => ({ ...prev, glowColor: e.target.value }))} /></div>
                      <div className="control-group"><label>Intensidad: {templateOptions.glowIntensity || 5}</label><input type="range" min="1" max="10" value={templateOptions.glowIntensity || 5} onChange={e => setTemplateOptions(prev => ({ ...prev, glowIntensity: Number(e.target.value) }))} /></div>
                    </>
                  )}
                </>
              )}
              {features.design?.includes('textVerticalPosition') && (
                <div className="control-group">
                  <label>Posición vertical del texto: {templateOptions.textPosY ?? 11}px</label>
                  <input
                    type="range"
                    min="0" max="80"
                    value={templateOptions.textPosY ?? 11}
                    onChange={e => setTemplateOptions(prev => ({ ...prev, textPosY: Number(e.target.value) }))}
                  />
                </div>
              )}
              {features.design?.length === 0 && unavailable('Sin opciones de diseño para esta plantilla')}
            </>
          )}

          {/* TEXTO */}
          {activeTool === 'text' && (
            <>
              {features.allowCustomText !== false && (
                <div className="control-group">
                  <label>Texto adicional</label>
                  <input type="text" placeholder="Ej: ¡Envíos gratis!" value={customText} onChange={e => setCustomText(e.target.value)} />
                </div>
              )}
              {features.allowTitleColor !== false && (
                <div className="control-group">
                  <label>Color título</label>
                  <input type="color" value={titleColor} onChange={e => setTitleColor(e.target.value)} />
                </div>
              )}
              {features.allowPriceColor !== false && (
                <div className="control-group">
                  <label>Color precio</label>
                  <input type="color" value={priceColor} onChange={e => setPriceColor(e.target.value)} />
                </div>
              )}
              {features.allowDetailsColor && (
                <div className="control-group">
                  <label>Color características</label>
                  <input type="color" value={detailsColor} onChange={e => setDetailsColor(e.target.value)} />
                </div>
              )}
              {features.allowTextScale && (
                <div className="control-group">
                  <label>Tamaño del texto: {(templateOptions.textScale ?? 1).toFixed(1)}x</label>
                  <input type="range" min="0.5" max="2" step="0.1" value={templateOptions.textScale ?? 1} onChange={e => setTemplateOptions(prev => ({ ...prev, textScale: Number(e.target.value) }))} />
                </div>
              )}
              {features.allowTextAlign && (
                <>
                  <label>Alineación</label>
                  <div className="alignment-options">
                    <button className={`align-btn ${(templateOptions.textAlign || 'center') === 'left' ? 'active' : ''}`} onClick={() => setTemplateOptions(prev => ({ ...prev, textAlign: 'left' }))}>Izq</button>
                    <button className={`align-btn ${(templateOptions.textAlign || 'center') === 'center' ? 'active' : ''}`} onClick={() => setTemplateOptions(prev => ({ ...prev, textAlign: 'center' }))}>Centro</button>
                    <button className={`align-btn ${(templateOptions.textAlign || 'center') === 'right' ? 'active' : ''}`} onClick={() => setTemplateOptions(prev => ({ ...prev, textAlign: 'right' }))}>Der</button>
                  </div>
                </>
              )}
              {features.allowTextPosition && (
                <>
                  <div className="control-group">
                    <label>Posición horizontal: {templateOptions.textPosX ?? 50}%</label>
                    <input type="range" min="5" max="95" value={templateOptions.textPosX ?? 50} onChange={e => setTemplateOptions(prev => ({ ...prev, textPosX: Number(e.target.value) }))} />
                  </div>
                  <div className="control-group">
                    <label>Posición vertical: {templateOptions.textPosY ?? 85}%</label>
                    <input type="range" min="10" max="95" value={templateOptions.textPosY ?? 85} onChange={e => setTemplateOptions(prev => ({ ...prev, textPosY: Number(e.target.value) }))} />
                  </div>
                </>
              )}
              {features.allowShadow && (
                <>
                  <label>Color de sombra</label>
                  <input type="color" value={templateOptions.shadowColor || '#000000'} onChange={e => setTemplateOptions(prev => ({ ...prev, shadowColor: e.target.value }))} />
                  <div className="control-group">
                    <label>Intensidad sombra: {templateOptions.shadowIntensity ?? 5}</label>
                    <input type="range" min="1" max="10" value={templateOptions.shadowIntensity ?? 5} onChange={e => setTemplateOptions(prev => ({ ...prev, shadowIntensity: Number(e.target.value) }))} />
                  </div>
                </>
              )}
            </>
          )}

          {/* LOGO */}
          {activeTool === 'logo' && (
            <>
              <label className="checkbox-group"><input type="checkbox" checked={showLogo} onChange={() => setShowLogo(!showLogo)} /> Mostrar logo</label>
              <label>Posición</label>
              <div className="logo-positions">
                {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(pos => (
                  <button key={pos} className={`logo-pos-btn ${logoPosition === pos ? 'active' : ''}`} onClick={() => setLogoPosition(pos)}>
                    {pos === 'top-left' ? '↖️' : pos === 'top-right' ? '↗️' : pos === 'bottom-left' ? '↙️' : '↘️'}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* FONDO */}
          {activeTool === 'background' && (
            features.allowBackground ? (
              <div className="control-group">
                <label>Color de fondo</label>
                <input type="color" value={overlayColor} onChange={e => setOverlayColor(e.target.value)} />
              </div>
            ) : unavailable('El fondo está fijo en esta plantilla')
          )}
        </div>
      </div>
    );
  };

  const logoStyle = {
    position: 'absolute',
    width: '15%',
    zIndex: 10,
    ...(logoPosition === 'top-left' && { top: '2%', left: '3%' }),
    ...(logoPosition === 'top-right' && { top: '2%', right: '3%' }),
    ...(logoPosition === 'bottom-left' && { bottom: '2%', left: '3%' }),
    ...(logoPosition === 'bottom-right' && { bottom: '2%', right: '3%' }),
  };

  if (loading) return <div className="studio-loading">Cargando estudio...</div>;

  return (
    <div className={`content-creator-v2 ${fullscreen ? 'fullscreen-active' : ''}`}>
      <div className="studio-topbar">
        <h2>Estudio</h2>
        <div className="topbar-actions">
          <button className="icon-btn fullscreen-btn" onClick={() => setFullscreen(true)} title="Ver a tamaño real">
            <FaExpand /> <span>Original</span>
          </button>
        </div>
      </div>

      <div className="studio-main">
        {activeTool && renderToolPanel()}

        <div className="studio-preview-area">
          <div className="preview-canvas-wrapper">
            <div ref={previewRef} className="preview-canvas" style={previewStyles}>
              {selectedProduct && TemplateComponent && <TemplateComponent {...commonProps} />}
              {showLogo && logoUrl && selectedProduct && (
                <img src={logoUrl} alt="Logo" crossOrigin="anonymous" style={logoStyle} />
              )}
              {!selectedProduct && (
                <div className="empty-preview">Selecciona un producto</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="studio-toolbar">
        {tools.map(tool => (
          <button
            key={tool.id}
            className={`toolbar-btn ${activeTool === tool.id ? 'active' : ''}`}
            onClick={() => {
              if (tool.id === 'download') downloadImage();
              else setActiveTool(activeTool === tool.id ? null : tool.id);
            }}
          >
            <span className="tool-icon">{tool.icon}</span>
            <span className="tool-label">{tool.label}</span>
          </button>
        ))}
      </div>

      {fullscreen && (
        <div className="fullscreen-overlay" onClick={() => setFullscreen(false)}>
          <div className="fullscreen-container" onClick={e => e.stopPropagation()}>
            <button className="fullscreen-close" onClick={() => setFullscreen(false)}><FaTimes /></button>
            <div className="fullscreen-preview" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
              <div style={{
                width: selectedTemplate?.id === 'photography' ? 'auto' : '100%',
                maxWidth: selectedTemplate?.id === 'photography' ? '90%' : '400px',
                maxHeight: '100%',
                aspectRatio: selectedTemplate?.id === 'photography' ? 'auto' : '1080/1920',
                height: selectedTemplate?.id === 'photography' ? 'auto' : 'auto',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <div ref={previewRef} style={previewStyles}>
                  {selectedProduct && TemplateComponent && <TemplateComponent {...commonProps} />}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}