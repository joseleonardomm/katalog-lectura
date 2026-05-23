import { useState, useEffect } from 'react';
import { createProduct, updateProduct, uploadImage, getCategories, getConfig } from '../../api';
import { FaCamera, FaStar, FaTrash, FaPlus } from 'react-icons/fa';
import './ProductForm.css';

const colorPalette = [
  { name: 'Rojo', value: '#e53935' },
  { name: 'Azul', value: '#1e88e5' },
  { name: 'Verde', value: '#43a047' },
  { name: 'Negro', value: '#212121' },
  { name: 'Blanco', value: '#f5f5f5' },
  { name: 'Amarillo', value: '#fdd835' },
  { name: 'Naranja', value: '#fb8c00' },
  { name: 'Morado', value: '#8e24aa' },
  { name: 'Rosa', value: '#f06292' },
  { name: 'Gris', value: '#9e9e9e' },
];

export default function ProductForm({ initialProduct, onSuccess, onCancel }) {
  const [product, setProduct] = useState(initialProduct || {
    name: '', description: '', basePrice: 0, costPrice: 0, priceCurrency: 'USD', category: '',
    isTopSeller: false, isOnSale: false, salePrice: null,
    hasTechnicalSpecs: false, technicalSpecs: {}
  });
  const [categories, setCategories] = useState([]);
  const [shippingCategories, setShippingCategories] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [specsEntries, setSpecsEntries] = useState([]);
  
  const [baseColor, setBaseColor] = useState({
    name: 'General', colorValue: '#cccccc', stock: 0, images: [], price: null
  });
  const [additionalColors, setAdditionalColors] = useState([]);
  const [editingAdditionalIndex, setEditingAdditionalIndex] = useState(null);
  const [showAdditionalModal, setShowAdditionalModal] = useState(false);
  const [additionalColorForm, setAdditionalColorForm] = useState({
    name: '', colorValue: '#cccccc', stock: 0, images: [], price: ''
  });

  const [nameLength, setNameLength] = useState(product.name?.length || 0);
  const [descLength, setDescLength] = useState(product.description?.length || 0);
  const MAX_NAME = 100;
  const MAX_DESC = 500;

  useEffect(() => {
    const loadData = async () => {
      const [cats, cfg] = await Promise.all([getCategories(), getConfig()]);
      setCategories(cats);
      if (cfg?.shipping?.categories) {
        setShippingCategories(cfg.shipping.categories);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (initialProduct?.technicalSpecs && typeof initialProduct.technicalSpecs === 'object') {
      const entries = Object.entries(initialProduct.technicalSpecs);
      setSpecsEntries(entries.length ? entries.map(([key, value]) => ({ key, value })) : [{ key: '', value: '' }]);
    } else {
      setSpecsEntries([{ key: '', value: '' }]);
    }
  }, [initialProduct]);

  useEffect(() => {
    if (initialProduct && initialProduct.colors && initialProduct.colors.length > 0) {
      const [first, ...rest] = initialProduct.colors;
      setBaseColor(first);
      setAdditionalColors(rest);
    } else if (initialProduct && (initialProduct.baseImages || initialProduct.images)) {
      setBaseColor({
        name: 'General',
        colorValue: '#cccccc',
        stock: initialProduct.stock || 0,
        images: initialProduct.baseImages || initialProduct.images || [],
        price: null
      });
      setAdditionalColors([]);
    } else {
      setBaseColor({
        name: 'General',
        colorValue: '#cccccc',
        stock: 0,
        images: [],
        price: null
      });
      setAdditionalColors([]);
    }
    if (initialProduct) {
      setNameLength(initialProduct.name?.length || 0);
      setDescLength(initialProduct.description?.length || 0);
    }
  }, [initialProduct]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'name') {
      if (value.length <= MAX_NAME) {
        setProduct(prev => ({ ...prev, [name]: value }));
        setNameLength(value.length);
      }
    } else if (name === 'description') {
      if (value.length <= MAX_DESC) {
        setProduct(prev => ({ ...prev, [name]: value }));
        setDescLength(value.length);
      }
    } else {
      setProduct(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleCategoryChange = (e) => {
    const selectedId = e.target.value;
    const selectedCat = categories.find(c => c.id === selectedId);
    setProduct(prev => ({ ...prev, category: selectedCat ? selectedCat.name : '' }));
  };

  const toggleBoolean = (field) => {
    setProduct(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleBaseColorChange = (e) => {
    const { name, value } = e.target;
    setBaseColor(prev => ({ ...prev, [name]: value }));
  };

  const handleBaseColorValueChange = (colorValue) => {
    setBaseColor(prev => ({ ...prev, colorValue }));
    const found = colorPalette.find(c => c.value === colorValue);
    if (found && !baseColor.name) {
      setBaseColor(prev => ({ ...prev, name: found.name }));
    }
  };

  const uploadBaseColorImage = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadImage(file);
      if (res.url) setBaseColor(prev => ({ ...prev, images: [...prev.images, res.url] }));
    } catch (error) {
      console.error(error);
      alert('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const removeBaseColorImage = (index) => {
    const newImages = [...baseColor.images];
    newImages.splice(index, 1);
    setBaseColor(prev => ({ ...prev, images: newImages }));
  };

  const setBaseColorImageAsCover = (index) => {
    const newImages = [...baseColor.images];
    const [moved] = newImages.splice(index, 1);
    newImages.unshift(moved);
    setBaseColor(prev => ({ ...prev, images: newImages }));
  };

  const openAddAdditionalModal = () => {
    setEditingAdditionalIndex(null);
    setAdditionalColorForm({ name: '', colorValue: '#cccccc', stock: 0, images: [], price: '' });
    setShowAdditionalModal(true);
  };

  const openEditAdditionalModal = (index) => {
    const color = additionalColors[index];
    setEditingAdditionalIndex(index);
    setAdditionalColorForm({
      name: color.name,
      colorValue: color.colorValue || '#cccccc',
      stock: color.stock || 0,
      images: color.images || [],
      price: color.price !== undefined ? color.price : ''
    });
    setShowAdditionalModal(true);
  };

  const closeAdditionalModal = () => setShowAdditionalModal(false);

  const handleAdditionalFormChange = (e) => {
    const { name, value } = e.target;
    setAdditionalColorForm(prev => ({ ...prev, [name]: value }));
  };

  const uploadAdditionalImage = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadImage(file);
      if (res.url) setAdditionalColorForm(prev => ({ ...prev, images: [...prev.images, res.url] }));
    } catch (error) {
      console.error(error);
      alert('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const removeAdditionalImage = (index) => {
    const newImages = [...additionalColorForm.images];
    newImages.splice(index, 1);
    setAdditionalColorForm(prev => ({ ...prev, images: newImages }));
  };

  const setAdditionalImageAsCover = (index) => {
    const newImages = [...additionalColorForm.images];
    const [moved] = newImages.splice(index, 1);
    newImages.unshift(moved);
    setAdditionalColorForm(prev => ({ ...prev, images: newImages }));
  };

  const saveAdditionalColor = () => {
    if (!additionalColorForm.name.trim()) {
      alert('El nombre del color es obligatorio');
      return;
    }
    const newColor = {
      name: additionalColorForm.name,
      colorValue: additionalColorForm.colorValue,
      stock: parseInt(additionalColorForm.stock) || 0,
      images: additionalColorForm.images,
      price: additionalColorForm.price !== '' ? parseFloat(additionalColorForm.price) : undefined
    };
    if (editingAdditionalIndex !== null) {
      const updated = [...additionalColors];
      updated[editingAdditionalIndex] = newColor;
      setAdditionalColors(updated);
    } else {
      setAdditionalColors([...additionalColors, newColor]);
    }
    setShowAdditionalModal(false);
  };

  const removeAdditionalColor = (index) => {
    if (window.confirm('¿Eliminar este color variante?')) {
      setAdditionalColors(additionalColors.filter((_, i) => i !== index));
    }
  };

  const handleSpecKeyChange = (index, key) => {
    const newEntries = [...specsEntries];
    newEntries[index].key = key;
    setSpecsEntries(newEntries);
  };
  const handleSpecValueChange = (index, value) => {
    const newEntries = [...specsEntries];
    newEntries[index].value = value;
    setSpecsEntries(newEntries);
  };
  const addSpecRow = () => setSpecsEntries([...specsEntries, { key: '', value: '' }]);
  const removeSpecRow = (index) => {
    setSpecsEntries(specsEntries.filter((_, i) => i !== index));
  };
  const buildTechnicalSpecs = () => {
    const specs = {};
    specsEntries.forEach(entry => {
      if (entry.key.trim() && entry.value.trim()) specs[entry.key.trim()] = entry.value.trim();
    });
    return specs;
  };

  const cleanObject = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(item => cleanObject(item));
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) cleaned[key] = cleanObject(value);
    }
    return cleaned;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (product.name.length > MAX_NAME) {
      alert(`El nombre no puede superar los ${MAX_NAME} caracteres.`);
      return;
    }
    if (product.description.length > MAX_DESC) {
      alert(`La descripción no puede superar los ${MAX_DESC} caracteres.`);
      return;
    }
    const allColors = [baseColor, ...additionalColors];
    if (allColors.length === 0) {
      alert('Debe haber al menos un color para el producto.');
      return;
    }
    let finalProduct = { ...product };
    finalProduct.colors = allColors;
    finalProduct.technicalSpecs = finalProduct.hasTechnicalSpecs ? buildTechnicalSpecs() : {};
    delete finalProduct.baseImages;
    delete finalProduct.images;
    delete finalProduct.stock;

    if (!finalProduct.priceCurrency) finalProduct.priceCurrency = 'USD';
    if (finalProduct.isOnSale && (!finalProduct.salePrice || finalProduct.salePrice >= finalProduct.basePrice)) {
      alert('El precio de oferta debe ser menor al precio base.');
      return;
    }

    const cleanedProduct = cleanObject(finalProduct);
    if (initialProduct) await updateProduct(initialProduct.id, cleanedProduct);
    else await createProduct(cleanedProduct);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form product-form">
      <div className="form-grid">
        <div className="form-column">
          <div className="form-group">
            <label>Nombre del producto ({nameLength}/{MAX_NAME})</label>
            <input name="name" value={product.name} onChange={handleChange} maxLength={MAX_NAME} required placeholder="Máximo 100 caracteres" />
          </div>
          <div className="form-group">
            <label>Descripción ({descLength}/{MAX_DESC})</label>
            <textarea name="description" rows="4" value={product.description} onChange={handleChange} maxLength={MAX_DESC} placeholder="Máximo 500 caracteres" />
          </div>
          <div className="form-row">
            <div className="form-group half">
              <label>Precio base</label>
              <input name="basePrice" type="number" step="0.01" value={product.basePrice} onChange={handleChange} required />
            </div>
            <div className="form-group half">
              <label>Moneda</label>
              <select name="priceCurrency" value={product.priceCurrency} onChange={handleChange}>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>
          {/* Precio de costo (nuevo) */}
          <div className="form-row">
            <div className="form-group half">
              <label>Precio de costo</label>
              <input name="costPrice" type="number" step="0.01" value={product.costPrice || 0} onChange={handleChange} />
            </div>
          </div>

          {shippingCategories.length > 0 && (
            <div className="form-group">
              <label>Categoría de envío (tamaño)</label>
              <select name="shippingCategory" value={product.shippingCategory || ''} onChange={handleChange}>
                <option value="">Sin categoría</option>
                {shippingCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Categoría</label>
            {categories.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No hay categorías.</p>
            ) : (
              <select value={categories.find(c => c.name === product.category)?.id || ''} onChange={handleCategoryChange}>
                <option value="">Selecciona una categoría</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            )}
          </div>

          {/* Toggle: Más vendido */}
          <div className="toggle-group" onClick={() => toggleBoolean('isTopSeller')}>
            <span className="toggle-label">Más vendido</span>
            <span className={`toggle-slider ${product.isTopSeller ? 'active' : ''}`}></span>
          </div>

          {/* Toggle: En oferta */}
          <div className="toggle-group" onClick={() => toggleBoolean('isOnSale')}>
            <span className="toggle-label">En oferta</span>
            <span className={`toggle-slider ${product.isOnSale ? 'active' : ''}`}></span>
          </div>
          {product.isOnSale && (
            <div className="form-group">
              <label>Precio de oferta</label>
              <input name="salePrice" type="number" step="0.01" value={product.salePrice || ''} onChange={handleChange} />
            </div>
          )}

          {/* Toggle: Ficha técnica */}
          <div className="toggle-group" onClick={() => toggleBoolean('hasTechnicalSpecs')}>
            <span className="toggle-label">Mostrar ficha técnica</span>
            <span className={`toggle-slider ${product.hasTechnicalSpecs ? 'active' : ''}`}></span>
          </div>
          {product.hasTechnicalSpecs && (
            <div className="specs-editor">
              {specsEntries.map((entry, idx) => (
                <div key={idx} className="spec-row">
                  <input type="text" placeholder="Propiedad" value={entry.key} onChange={(e) => handleSpecKeyChange(idx, e.target.value)} />
                  <input type="text" placeholder="Valor" value={entry.value} onChange={(e) => handleSpecValueChange(idx, e.target.value)} />
                  <button type="button" className="remove-spec" onClick={() => removeSpecRow(idx)}>✕</button>
                </div>
              ))}
              <button type="button" className="add-spec" onClick={addSpecRow}>+ Agregar especificación</button>
            </div>
          )}

          <div className="color-base-section">
            <h3 style={{ color: 'var(--text-primary)', marginTop: '1.5rem' }}>Color base</h3>
            <div className="form-group">
              <label>Nombre del color (ej. General, Rojo, Azul)</label>
              <input name="name" value={baseColor.name} onChange={handleBaseColorChange} required />
            </div>
            <div className="form-group">
              <label>Selecciona el color (opcional, solo visual)</label>
              <div className="color-palette" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', alignItems: 'center', marginTop: '0.5rem' }}>
                {colorPalette.map(c => (
                  <button key={c.name} type="button" className={`palette-swatch ${baseColor.colorValue === c.value ? 'active' : ''}`}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', border: baseColor.colorValue === c.value ? '2px solid var(--accent)' : '1px solid var(--border-color)', backgroundColor: c.value, cursor: 'pointer', boxShadow: baseColor.colorValue === c.value ? '0 0 0 2px rgba(255,107,0,0.3)' : 'none' }}
                    onClick={() => handleBaseColorValueChange(c.value)} title={c.name} />
                ))}
                <input type="color" value={baseColor.colorValue} onChange={(e) => handleBaseColorValueChange(e.target.value)} className="custom-color-picker"
                  style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--border-color)', cursor: 'pointer', background: 'var(--bg-input)' }} />
              </div>
            </div>
            <div className="form-group">
              <label>Stock para este color</label>
              <input name="stock" type="number" value={baseColor.stock} onChange={handleBaseColorChange} />
            </div>
            <div className="form-group">
              <label>Imágenes de este color</label>
              <div className="file-upload-area">
                <input type="file" accept="image/*" onChange={(e) => uploadBaseColorImage(e.target.files[0])} disabled={uploading} id="baseColorImageUpload" style={{ display: 'none' }} />
                <label htmlFor="baseColorImageUpload" className="modern-upload-btn"><FaCamera /> Subir imagen</label>
              </div>
              <div className="image-preview-grid">
                {baseColor.images.map((img, idx) => (
                  <div key={idx} className="image-preview-wrapper">
                    <div className="image-preview">
                      <img src={img} alt="preview" />
                      {idx === 0 && <span className="cover-badge">Portada</span>}
                    </div>
                    <div className="image-actions">
                      {idx !== 0 && <button type="button" className="set-cover-btn" onClick={() => setBaseColorImageAsCover(idx)} title="Establecer como portada"><FaStar /></button>}
                      <button type="button" className="remove-img-btn" onClick={() => removeBaseColorImage(idx)} title="Eliminar imagen"><FaTrash /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="form-column variants-column">
          <div className="variants-header">
            <h3 style={{ color: 'var(--text-primary)' }}>Colores adicionales (variantes)</h3>
            <button type="button" className="btn-add-variant" onClick={openAddAdditionalModal}><FaPlus /> Agregar color variante</button>
          </div>
          <div className="variants-list">
            {additionalColors.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No hay colores adicionales. Puedes agregar variantes con diferentes colores, precios o stocks.</p>}
            {additionalColors.map((color, idx) => (
              <div key={idx} className="variant-card">
                <div className="variant-card-header">
                  <strong>{color.name}</strong>
                  <div>
                    <button type="button" onClick={() => openEditAdditionalModal(idx)}>Editar</button>
                    <button type="button" onClick={() => removeAdditionalColor(idx)}>Eliminar</button>
                  </div>
                </div>
                <div className="variant-details">
                  {color.price !== undefined && color.price !== null && <span>Precio especial: {color.price} {product.priceCurrency}</span>}
                  <span>Imágenes: {color.images?.length || 0}</span>
                  <span>Stock: {color.stock}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="form-actions" style={{ marginTop: '2rem' }}>
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn-primary">Guardar producto</button>
      </div>

      {showAdditionalModal && (
        <div className="modal-backdrop" onClick={closeAdditionalModal}>
          <div className="modal-content color-modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ color: 'var(--text-primary)' }}>{editingAdditionalIndex !== null ? 'Editar color variante' : 'Nuevo color variante'}</h2>
            <div className="form-group">
              <label>Nombre del color</label>
              <input name="name" value={additionalColorForm.name} onChange={handleAdditionalFormChange} required />
            </div>
            <div className="form-group">
              <label>Selecciona el color (opcional, solo visual)</label>
              <div className="color-palette" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', alignItems: 'center', marginTop: '0.5rem' }}>
                {colorPalette.map(c => (
                  <button key={c.name} type="button" className={`palette-swatch ${additionalColorForm.colorValue === c.value ? 'active' : ''}`}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', border: additionalColorForm.colorValue === c.value ? '2px solid var(--accent)' : '1px solid var(--border-color)', backgroundColor: c.value, cursor: 'pointer', boxShadow: additionalColorForm.colorValue === c.value ? '0 0 0 2px rgba(255,107,0,0.3)' : 'none' }}
                    onClick={() => setAdditionalColorForm(prev => ({ ...prev, colorValue: c.value, name: c.name }))} title={c.name} />
                ))}
                <input type="color" value={additionalColorForm.colorValue} onChange={(e) => setAdditionalColorForm(prev => ({ ...prev, colorValue: e.target.value }))} className="custom-color-picker"
                  style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--border-color)', cursor: 'pointer', background: 'var(--bg-input)' }} />
              </div>
            </div>
            <div className="form-group">
              <label>Stock para este color</label>
              <input name="stock" type="number" value={additionalColorForm.stock} onChange={handleAdditionalFormChange} />
            </div>
            <div className="form-group">
              <label>Precio especial (opcional)</label>
              <input name="price" type="number" step="0.01" value={additionalColorForm.price} onChange={handleAdditionalFormChange} />
              <small style={{ color: 'var(--text-muted)' }}>Si se deja vacío, se usará el precio base del producto.</small>
            </div>
            <div className="form-group">
              <label>Imágenes de este color</label>
              <div className="file-upload-area">
                <input type="file" accept="image/*" onChange={(e) => uploadAdditionalImage(e.target.files[0])} disabled={uploading} id="additionalImageUpload" style={{ display: 'none' }} />
                <label htmlFor="additionalImageUpload" className="modern-upload-btn"><FaCamera /> Subir imagen</label>
              </div>
              <div className="image-preview-grid">
                {additionalColorForm.images.map((img, idx) => (
                  <div key={idx} className="image-preview-wrapper">
                    <div className="image-preview">
                      <img src={img} alt="preview" />
                      {idx === 0 && <span className="cover-badge">Portada</span>}
                    </div>
                    <div className="image-actions">
                      {idx !== 0 && <button type="button" className="set-cover-btn" onClick={() => setAdditionalImageAsCover(idx)} title="Establecer como portada"><FaStar /></button>}
                      <button type="button" className="remove-img-btn" onClick={() => removeAdditionalImage(idx)} title="Eliminar imagen"><FaTrash /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={closeAdditionalModal}>Cancelar</button>
              <button type="button" className="btn-primary" onClick={saveAdditionalColor}>Guardar color</button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}