import { useState, useEffect } from 'react';
import { createProduct, updateProduct, uploadImage, getCategories } from '../../api';
import './ProductForm.css';

export default function ProductForm({ initialProduct, onSuccess, onCancel }) {
  // Estado base
  const [product, setProduct] = useState(initialProduct || {
    name: '', description: '', basePrice: 0, priceCurrency: 'USD', category: '',
    baseImages: [], isTopSeller: false, isOnSale: false, salePrice: null,
    hasSizes: false,
    globalSizes: [],          // { name: '', defaultStock: 0 }
    hasColors: false,
    colors: [],
    hasTechnicalSpecs: false, technicalSpecs: {}
  });
  const [categories, setCategories] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [specsEntries, setSpecsEntries] = useState([]);
  const [globalSizesState, setGlobalSizesState] = useState(product.globalSizes || []);
  const [colorsState, setColorsState] = useState(product.colors || []);
  const [editingColorIndex, setEditingColorIndex] = useState(null);
  const [showColorModal, setShowColorModal] = useState(false);
  const [colorForm, setColorForm] = useState({
    name: '', price: '', images: [], isTopSeller: false, isOnSale: false, salePrice: '',
    sizes: []  // cada elemento: { name: '', stock: 0 }
  });

  useEffect(() => {
    const loadCategories = async () => {
      const cats = await getCategories();
      setCategories(cats);
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (product.technicalSpecs && typeof product.technicalSpecs === 'object') {
      const entries = Object.entries(product.technicalSpecs);
      setSpecsEntries(entries.length ? entries.map(([key, value]) => ({ key, value })) : [{ key: '', value: '' }]);
    } else {
      setSpecsEntries([{ key: '', value: '' }]);
    }
  }, [product.technicalSpecs]);

  useEffect(() => {
    setGlobalSizesState(product.globalSizes || []);
    setColorsState(product.colors || []);
  }, [product.globalSizes, product.colors]);

  // Manejadores base
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleCategoryChange = (e) => {
    const selectedId = e.target.value;
    const selectedCat = categories.find(c => c.id === selectedId);
    setProduct(prev => ({ ...prev, category: selectedCat ? selectedCat.name : '' }));
  };

  const handleBaseImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const res = await uploadImage(file);
    if (res.url) setProduct(prev => ({ ...prev, baseImages: [...prev.baseImages, res.url] }));
    setUploading(false);
  };

  const removeBaseImage = (index) => {
    const newImages = [...product.baseImages];
    newImages.splice(index, 1);
    setProduct(prev => ({ ...prev, baseImages: newImages }));
  };

  // Ficha técnica
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

  // Manejadores de tallas globales
  const addGlobalSize = () => {
    setGlobalSizesState([...globalSizesState, { name: '', defaultStock: 0 }]);
  };
  const updateGlobalSize = (index, field, value) => {
    const updated = [...globalSizesState];
    updated[index][field] = field === 'defaultStock' ? (parseInt(value) || 0) : value;
    setGlobalSizesState(updated);
  };
  const removeGlobalSize = (index) => {
    setGlobalSizesState(globalSizesState.filter((_, i) => i !== index));
  };

  // Manejadores de colores con tallas dinámicas
  const openAddColorModal = () => {
    setEditingColorIndex(null);
    // Inicializar tallas del color con copia de las globales
    const initialSizes = globalSizesState.map(sz => ({
      name: sz.name,
      stock: sz.defaultStock || 0
    }));
    setColorForm({
      name: '', price: '', images: [], isTopSeller: false, isOnSale: false, salePrice: '',
      sizes: initialSizes
    });
    setShowColorModal(true);
  };

  const openEditColorModal = (index) => {
    const color = colorsState[index];
    setEditingColorIndex(index);
    setColorForm({
      name: color.name,
      price: color.price !== undefined ? color.price : '',
      images: color.images || [],
      isTopSeller: color.isTopSeller || false,
      isOnSale: color.isOnSale || false,
      salePrice: color.salePrice !== undefined ? color.salePrice : '',
      sizes: color.sizes ? [...color.sizes] : []
    });
    setShowColorModal(true);
  };

  const closeColorModal = () => setShowColorModal(false);

  const handleColorFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setColorForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // Gestión de tallas dentro del color
  const addColorSize = () => {
    setColorForm(prev => ({
      ...prev,
      sizes: [...prev.sizes, { name: '', stock: 0 }]
    }));
  };
  const updateColorSize = (index, field, value) => {
    const updatedSizes = [...colorForm.sizes];
    updatedSizes[index][field] = field === 'stock' ? (parseInt(value) || 0) : value;
    setColorForm(prev => ({ ...prev, sizes: updatedSizes }));
  };
  const removeColorSize = (index) => {
    const updatedSizes = colorForm.sizes.filter((_, i) => i !== index);
    setColorForm(prev => ({ ...prev, sizes: updatedSizes }));
  };

  const uploadColorImage = async (file) => {
    if (!file) return;
    setUploading(true);
    const res = await uploadImage(file);
    if (res.url) setColorForm(prev => ({ ...prev, images: [...prev.images, res.url] }));
    setUploading(false);
  };

  const removeColorImage = (index) => {
    const newImages = [...colorForm.images];
    newImages.splice(index, 1);
    setColorForm(prev => ({ ...prev, images: newImages }));
  };

  const saveColor = () => {
    if (!colorForm.name.trim()) {
      alert('El nombre del color es obligatorio');
      return;
    }
    const validSizes = colorForm.sizes.filter(sz => sz.name.trim() !== '');
    const newColor = {
      name: colorForm.name,
      images: colorForm.images,
      price: colorForm.price !== '' ? parseFloat(colorForm.price) : null,
      isTopSeller: colorForm.isTopSeller,
      isOnSale: colorForm.isOnSale,
      salePrice: colorForm.salePrice !== '' ? parseFloat(colorForm.salePrice) : null,
      sizes: validSizes
    };
    if (editingColorIndex !== null) {
      const updated = [...colorsState];
      updated[editingColorIndex] = newColor;
      setColorsState(updated);
    } else {
      setColorsState([...colorsState, newColor]);
    }
    setShowColorModal(false);
  };

  const removeColor = (index) => {
    if (window.confirm('¿Eliminar este color?')) {
      setColorsState(colorsState.filter((_, i) => i !== index));
    }
  };

  // Función para limpiar objetos de undefined (copia de removeUndefined de api.js)
  const cleanObject = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) {
      return obj.map(item => cleanObject(item));
    }
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanObject(value);
      }
    }
    return cleaned;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let finalProduct = { ...product };

    // Asegurar valores por defecto para arrays y campos críticos
    finalProduct.globalSizes = finalProduct.globalSizes || [];
    finalProduct.colors = finalProduct.colors || [];
    finalProduct.baseImages = finalProduct.baseImages || [];
    finalProduct.technicalSpecs = finalProduct.technicalSpecs || {};
    finalProduct.salePrice = (finalProduct.isOnSale && finalProduct.salePrice !== undefined) ? finalProduct.salePrice : null;
    finalProduct.priceCurrency = finalProduct.priceCurrency || 'USD';
    finalProduct.basePrice = finalProduct.basePrice || 0;
    finalProduct.hasSizes = finalProduct.hasSizes || false;
    finalProduct.hasColors = finalProduct.hasColors || false;
    finalProduct.isTopSeller = finalProduct.isTopSeller || false;
    finalProduct.isOnSale = finalProduct.isOnSale || false;

    // Sanitizar cada color
    if (finalProduct.colors && finalProduct.colors.length) {
      finalProduct.colors = finalProduct.colors.map(color => ({
        ...color,
        images: color.images || [],
        sizes: color.sizes || [],
        price: color.price !== undefined ? color.price : null,
        salePrice: (color.isOnSale && color.salePrice !== undefined) ? color.salePrice : null
      }));
    }

    if (finalProduct.hasTechnicalSpecs) {
      finalProduct.technicalSpecs = buildTechnicalSpecs();
    } else {
      finalProduct.technicalSpecs = {};
    }

    if (finalProduct.isOnSale && (!finalProduct.salePrice || finalProduct.salePrice >= finalProduct.basePrice)) {
      alert('El precio de oferta debe ser menor al precio base.');
      return;
    }

    // Limpieza final de undefined
    const cleanedProduct = cleanObject(finalProduct);

    if (initialProduct) {
      await updateProduct(initialProduct.id, cleanedProduct);
    } else {
      await createProduct(cleanedProduct);
    }
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form product-form">
      <div className="form-grid">
        {/* Columna izquierda: datos principales */}
        <div className="form-column">
          <div className="form-group">
            <label>Nombre del producto</label>
            <input name="name" value={product.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea name="description" rows="4" value={product.description} onChange={handleChange} />
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

          <div className="form-group checkbox-group">
            <label>
              <input type="checkbox" name="hasSizes" checked={product.hasSizes} onChange={handleChange} />
              ¿El producto tiene tallas / tamaños?
            </label>
          </div>
          {product.hasSizes && (
            <div className="form-group">
              <label>Tallas / tamaños generales</label>
              {globalSizesState.map((sz, idx) => (
                <div key={idx} className="size-row">
                  <input
                    type="text"
                    placeholder="Nombre (ej. S, 40cm)"
                    value={sz.name}
                    onChange={(e) => updateGlobalSize(idx, 'name', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Stock inicial (opcional)"
                    value={sz.defaultStock}
                    onChange={(e) => updateGlobalSize(idx, 'defaultStock', e.target.value)}
                  />
                  <button type="button" className="remove-size" onClick={() => removeGlobalSize(idx)}>✕</button>
                </div>
              ))}
              <button type="button" className="add-size" onClick={addGlobalSize}>+ Agregar talla general</button>
            </div>
          )}

          <div className="form-group">
            <label>Categoría</label>
            {categories.length === 0 ? (
              <p className="info-text">No hay categorías.</p>
            ) : (
              <select value={categories.find(c => c.name === product.category)?.id || ''} onChange={handleCategoryChange}>
                <option value="">Selecciona una categoría</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            )}
          </div>

          <div className="form-group">
            <label>Imágenes del producto</label>
            <div className="file-upload-area">
              <input type="file" accept="image/*" onChange={handleBaseImageUpload} disabled={uploading} id="baseImageUpload" style={{ display: 'none' }} />
              <label htmlFor="baseImageUpload" className="modern-upload-btn">📁 Subir imagen</label>
            </div>
            <div className="image-preview-grid">
              {product.baseImages.map((img, idx) => (
                <div key={idx} className="image-preview">
                  <img src={img} alt="preview" />
                  <button type="button" className="remove-img" onClick={() => removeBaseImage(idx)}>✕</button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half checkbox-group">
              <label><input type="checkbox" name="isTopSeller" checked={product.isTopSeller} onChange={handleChange} /> Más vendido</label>
            </div>
            <div className="form-group half checkbox-group">
              <label><input type="checkbox" name="isOnSale" checked={product.isOnSale} onChange={handleChange} /> En oferta</label>
            </div>
          </div>
          {product.isOnSale && (
            <div className="form-group">
              <label>Precio de oferta</label>
              <input name="salePrice" type="number" step="0.01" value={product.salePrice || ''} onChange={handleChange} />
            </div>
          )}

          <div className="form-group checkbox-group">
            <label>
              <input type="checkbox" name="hasTechnicalSpecs" checked={product.hasTechnicalSpecs} onChange={handleChange} />
              Mostrar ficha técnica
            </label>
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
        </div>

        {/* Columna derecha: colores */}
        <div className="form-column colors-column">
          <div className="colors-header">
            <h3>Colores / Variantes</h3>
            <button type="button" className="btn-add-color" onClick={openAddColorModal}>+ Agregar nuevo color</button>
          </div>
          <div className="colors-list">
            {colorsState.length === 0 && <p className="info-text">No hay colores agregados.</p>}
            {colorsState.map((color, idx) => (
              <div key={idx} className="color-card">
                <div className="color-card-header">
                  <strong>{color.name}</strong>
                  <div>
                    <button type="button" className="edit-color-btn" onClick={() => openEditColorModal(idx)}>Editar</button>
                    <button type="button" className="delete-color-btn" onClick={() => removeColor(idx)}>Eliminar</button>
                  </div>
                </div>
                <div className="color-details">
                  {color.price !== undefined && color.price !== null && <span>Precio especial: {color.price} {product.priceCurrency}</span>}
                  <span>Imágenes: {color.images?.length || 0}</span>
                  {color.sizes && color.sizes.length > 0 && (
                    <div className="color-sizes">
                      <strong>Tallas:</strong> {color.sizes.map(sz => `${sz.name} (${sz.stock})`).join(', ')}
                    </div>
                  )}
                  {color.isTopSeller && <span className="badge top">Más vendido</span>}
                  {color.isOnSale && <span className="badge sale">Oferta</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn-primary">Guardar producto</button>
      </div>

      {/* Modal para agregar/editar color */}
      {showColorModal && (
        <div className="modal-backdrop" onClick={closeColorModal}>
          <div className="modal-content color-modal" onClick={e => e.stopPropagation()}>
            <h2>{editingColorIndex !== null ? 'Editar color' : 'Nuevo color'}</h2>
            <div className="form-group">
              <label>Nombre del color</label>
              <input name="name" value={colorForm.name} onChange={handleColorFormChange} required />
            </div>
            <div className="form-group">
              <label>Precio especial (opcional)</label>
              <input name="price" type="number" step="0.01" value={colorForm.price} onChange={handleColorFormChange} />
            </div>
            <div className="form-group">
              <label>Imágenes de este color</label>
              <div className="file-upload-area">
                <input type="file" accept="image/*" onChange={(e) => uploadColorImage(e.target.files[0])} disabled={uploading} id="colorImageUpload" style={{ display: 'none' }} />
                <label htmlFor="colorImageUpload" className="modern-upload-btn">📁 Subir imagen</label>
              </div>
              <div className="image-preview-grid">
                {colorForm.images.map((img, idx) => (
                  <div key={idx} className="image-preview">
                    <img src={img} alt="preview" />
                    <button type="button" className="remove-img" onClick={() => removeColorImage(idx)}>✕</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group half checkbox-group">
                <label><input type="checkbox" name="isTopSeller" checked={colorForm.isTopSeller} onChange={handleColorFormChange} /> Más vendido</label>
              </div>
              <div className="form-group half checkbox-group">
                <label><input type="checkbox" name="isOnSale" checked={colorForm.isOnSale} onChange={handleColorFormChange} /> En oferta</label>
              </div>
            </div>
            {colorForm.isOnSale && (
              <div className="form-group">
                <label>Precio de oferta</label>
                <input name="salePrice" type="number" step="0.01" value={colorForm.salePrice} onChange={handleColorFormChange} />
              </div>
            )}

            <div className="sizes-header">
              <label>Tallas / Tamaños de este color (con stock)</label>
              <button type="button" className="btn-add-size" onClick={addColorSize}>+ Agregar talla</button>
            </div>
            <div className="sizes-list">
              {colorForm.sizes.map((sz, idx) => (
                <div key={idx} className="size-row">
                  <input type="text" placeholder="Nombre (ej. S, 40cm)" value={sz.name} onChange={(e) => updateColorSize(idx, 'name', e.target.value)} />
                  <input type="number" placeholder="Stock" value={sz.stock} onChange={(e) => updateColorSize(idx, 'stock', e.target.value)} />
                  <button type="button" className="remove-size" onClick={() => removeColorSize(idx)}>✕</button>
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={closeColorModal}>Cancelar</button>
              <button type="button" className="btn-primary" onClick={saveColor}>Guardar color</button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}