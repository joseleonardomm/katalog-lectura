import { useState, useEffect } from 'react';
import { getSlides, createSlide, updateSlide, deleteSlide, uploadImage } from '../../api';
import { FaCamera, FaTrash, FaEdit, FaPlus, FaCheck, FaImages, FaDownload } from 'react-icons/fa';
import './SlidesManager.css';

// Slides predeterminados para nuevas tiendas y para cargar en tiendas existentes
const DEFAULT_SLIDES = [
  {
    title: "Bienvenidos a nuestra tienda",
    subtitle: "Productos de calidad al mejor precio",
    imageDesktop: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1920&h=600&fit=crop",
    imageMobile: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=600&fit=crop",
    textPosition: "center-left"
  },
  {
    title: "Nuevos productos",
    subtitle: "Descubre las últimas tendencias",
    imageDesktop: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&h=600&fit=crop",
    imageMobile: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=600&fit=crop",
    textPosition: "center"
  },
  {
    title: "Envíos a todo el país",
    subtitle: "Recibe tu pedido en la puerta de tu casa",
    imageDesktop: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&h=600&fit=crop",
    imageMobile: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop",
    textPosition: "bottom-right"
  },
  {
    title: "Ofertas especiales",
    subtitle: "Hasta 50% de descuento en productos seleccionados",
    imageDesktop: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1920&h=600&fit=crop",
    imageMobile: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800&h=600&fit=crop",
    textPosition: "top-right"
  },
  {
    title: "Contáctanos",
    subtitle: "Estamos aquí para ayudarte. Escríbenos por WhatsApp",
    imageDesktop: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920&h=600&fit=crop",
    imageMobile: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop",
    textPosition: "bottom-left"
  }
];

// Galería de imágenes prediseñadas para fondos (más de 30 categorías)
const presetImages = [
  // Genéricos / Tienda
  { url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1920&h=600&fit=crop', label: 'Shopping' },
  { url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&h=600&fit=crop', label: 'Tecnología' },
  { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1920&h=600&fit=crop', label: 'Productos' },

  // Ofertas / Envíos
  { url: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1920&h=600&fit=crop', label: 'Ofertas' },
  { url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&h=600&fit=crop', label: 'Envíos' },

  // Moda y accesorios
  { url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&h=600&fit=crop', label: 'Moda' },
  { url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1920&h=600&fit=crop', label: 'Deportes' },

  // Juguetes (solo la que funciona)
  { url: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=1920&h=600&fit=crop', label: 'Juguetes' },

  // Cosméticos
  { url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1920&h=600&fit=crop', label: 'Cosméticos' },
  { url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1920&h=600&fit=crop', label: 'Maquillaje' },

  // Accesorios de vehículos
  { url: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=1920&h=600&fit=crop', label: 'Acc. Vehículos' },
  { url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&h=600&fit=crop', label: 'Autos' },

  // Ferreterías
  { url: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1920&h=600&fit=crop', label: 'Ferretería' },
  { url: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=1920&h=600&fit=crop', label: 'Herramientas' },

  // Joyas
  { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&h=600&fit=crop', label: 'Joyas' },
  { url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1920&h=600&fit=crop', label: 'Joyería' },

  // Mascotas
  { url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=1920&h=600&fit=crop', label: 'Mascotas' },
  { url: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1920&h=600&fit=crop', label: 'Mascotas' },

  // Productos de limpieza
  { url: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=1920&h=600&fit=crop', label: 'Limpieza' },
  { url: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=1920&h=600&fit=crop', label: 'Hogar limpio' },

  // Decoración del hogar
  { url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1920&h=600&fit=crop', label: 'Decoración' },
  { url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=1920&h=600&fit=crop', label: 'Hogar' },

  // Libros y cultura
  { url: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=1920&h=600&fit=crop', label: 'Libros' },
  { url: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=1920&h=600&fit=crop', label: 'Lectura' },

  // Equipos electrónicos
  { url: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1920&h=600&fit=crop', label: 'Electrónicos' },
  { url: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1920&h=600&fit=crop', label: 'Gadgets' },

  // Pasteles decorativos
  { url: 'https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=1920&h=600&fit=crop', label: 'Pasteles' },
  { url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=1920&h=600&fit=crop', label: 'Repostería' },

  // Flores (solo la que funciona)
  { url: 'https://images.unsplash.com/photo-1457530378978-8bac673b8062?w=1920&h=600&fit=crop', label: 'Flores' },

  // Comida
  { url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&h=600&fit=crop', label: 'Comida' },
  { url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&h=600&fit=crop', label: 'Restaurante' },
];

export default function SlidesManager() {
  const [slides, setSlides] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPresetGallery, setShowPresetGallery] = useState(false);
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    imageDesktop: '',
    imageMobile: '',
    textPosition: 'center-left',
  });
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const loadSlides = async () => {
    const data = await getSlides();
    setSlides(data);
  };

  useEffect(() => {
    loadSlides();
  }, []);

  useEffect(() => {
    if (showModal) {
      window.history.pushState({ modalOpen: true }, '');
      const handlePopState = () => {
        if (showModal) {
          setShowModal(false);
          setEditing(null);
          setShowPresetGallery(false);
        }
      };
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [showModal]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'desktop') setUploadingDesktop(true);
    else setUploadingMobile(true);

    const res = await uploadImage(file);
    if (res.url) {
      setForm((prev) => ({
        ...prev,
        [type === 'desktop' ? 'imageDesktop' : 'imageMobile']: res.url,
      }));
    }

    if (type === 'desktop') setUploadingDesktop(false);
    else setUploadingMobile(false);
  };

  const handlePresetSelect = (url) => {
    setForm(prev => ({
      ...prev,
      imageDesktop: url,
      imageMobile: url.replace('w=1920&h=600', 'w=800&h=600'),
    }));
    setShowPresetGallery(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.subtitle || (!form.imageDesktop && !form.imageMobile)) {
      alert('Completa al menos título, subtítulo y una imagen (desktop o mobile)');
      return;
    }
    const finalSlide = {
      ...form,
      imageDesktop: form.imageDesktop || form.imageMobile,
      imageMobile: form.imageMobile || form.imageDesktop,
    };

    if (editing) {
      await updateSlide(editing.id, finalSlide);
      showMessage('Slide actualizado');
    } else {
      await createSlide(finalSlide);
      showMessage('Slide creado');
    }

    setShowModal(false);
    setEditing(null);
    setShowPresetGallery(false);
    setForm({ title: '', subtitle: '', imageDesktop: '', imageMobile: '', textPosition: 'center-left' });
    loadSlides();
  };

  const showMessage = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleEdit = (slide) => {
    setEditing(slide);
    setForm(slide);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este slide?')) {
      await deleteSlide(id);
      loadSlides();
      showMessage('Slide eliminado');
    }
  };

  const loadDefaultSlides = async () => {
    if (window.confirm('Se añadirán 5 slides predeterminados a tu tienda. ¿Continuar?')) {
      for (const slide of DEFAULT_SLIDES) {
        await createSlide(slide);
      }
      loadSlides();
      showMessage('Slides predeterminados cargados');
    }
  };

  return (
    <div className="slides-manager">
      <div className="search-filter-bar">
        <input type="text" placeholder="Buscar slide..." value="" readOnly style={{ flex: 1 }} />
        <button className="btn-secondary" onClick={loadDefaultSlides} title="Cargar 5 slides predeterminados">
          <FaDownload /> Cargar predeterminados
        </button>
        <button className="btn-primary" onClick={() => {
          setEditing(null);
          setForm({ title: '', subtitle: '', imageDesktop: '', imageMobile: '', textPosition: 'center-left' });
          setShowModal(true);
        }}>
          <FaPlus /> Nuevo slide
        </button>
      </div>

      <div className="slides-grid">
        {slides.map((slide) => (
          <div key={slide.id} className="slide-card">
            <div className="slide-image-preview">
              <img src={slide.imageDesktop || slide.imageMobile} alt={slide.title} />
            </div>
            <div className="slide-info">
              <h3>{slide.title}</h3>
              <div className="slide-title">{slide.subtitle}</div>
              <div className="slide-actions">
                <button className="btn-edit" onClick={() => handleEdit(slide)}>
                  <FaEdit /> Editar
                </button>
                <button className="btn-delete" onClick={() => handleDelete(slide.id)}>
                  <FaTrash /> Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {slides.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          No hay slides todavía.
          <br />
          <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={loadDefaultSlides}>
            <FaDownload /> Cargar slides predeterminados
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => { setShowModal(false); setShowPresetGallery(false); }}>
          <div className="modal-content slides-modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
              {editing ? 'Editar slide' : 'Nuevo slide'}
            </h2>
            <form onSubmit={handleSubmit} className="slide-form">
              <div className="form-group">
                <label>Título</label>
                <input name="title" value={form.title} onChange={handleChange} required placeholder="Ej: Oferta especial" />
              </div>
              <div className="form-group">
                <label>Subtítulo</label>
                <input name="subtitle" value={form.subtitle} onChange={handleChange} required placeholder="Ej: Hasta 40% off" />
              </div>
              <div className="form-group">
                <label>Posición del texto</label>
                <select name="textPosition" value={form.textPosition} onChange={handleChange}>
                  <option value="top-left">Superior izquierda</option>
                  <option value="top-center">Superior centro</option>
                  <option value="top-right">Superior derecha</option>
                  <option value="center-left">Centro izquierda</option>
                  <option value="center">Centro</option>
                  <option value="center-right">Centro derecha</option>
                  <option value="bottom-left">Inferior izquierda</option>
                  <option value="bottom-center">Inferior centro</option>
                  <option value="bottom-right">Inferior derecha</option>
                </select>
              </div>

              {/* Galería de fondos prediseñados */}
              <div className="form-group">
                <label>Galería de fondos (más de 30 categorías)</label>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowPresetGallery(!showPresetGallery)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <FaImages /> {showPresetGallery ? 'Ocultar galería' : 'Elegir de la galería'}
                </button>
                {showPresetGallery && (
                  <div className="preset-gallery">
                    {presetImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="preset-image"
                        onClick={() => handlePresetSelect(img.url)}
                        title={img.label}
                      >
                        <img src={img.url} alt={img.label} />
                        <span>{img.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Imagen Desktop */}
              <div className="form-group">
                <label>Imagen para PC (escritorio)</label>
                <div className="file-upload-area">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'desktop')}
                    disabled={uploadingDesktop}
                    id="slide-desktop-upload"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="slide-desktop-upload" className="modern-upload-btn">
                    {uploadingDesktop ? 'Subiendo...' : <><FaCamera /> Seleccionar imagen PC</>}
                  </label>
                </div>
                {form.imageDesktop && (
                  <div className="image-preview-grid" style={{ marginTop: '0.5rem' }}>
                    <div className="image-preview-wrapper">
                      <div className="image-preview" style={{ width: '100px', height: '60px' }}>
                        <img src={form.imageDesktop} alt="desktop preview" />
                      </div>
                      <button
                        type="button"
                        className="remove-img-btn"
                        onClick={() => setForm({ ...form, imageDesktop: '' })}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                )}
                <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>
                  Recomendado: 1920×600px
                </small>
              </div>

              {/* Imagen Mobile */}
              <div className="form-group">
                <label>Imagen para móvil</label>
                <div className="file-upload-area">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'mobile')}
                    disabled={uploadingMobile}
                    id="slide-mobile-upload"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="slide-mobile-upload" className="modern-upload-btn">
                    {uploadingMobile ? 'Subiendo...' : <><FaCamera /> Seleccionar imagen móvil</>}
                  </label>
                </div>
                {form.imageMobile && (
                  <div className="image-preview-grid" style={{ marginTop: '0.5rem' }}>
                    <div className="image-preview-wrapper">
                      <div className="image-preview" style={{ width: '100px', height: '75px' }}>
                        <img src={form.imageMobile} alt="mobile preview" />
                      </div>
                      <button
                        type="button"
                        className="remove-img-btn"
                        onClick={() => setForm({ ...form, imageMobile: '' })}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                )}
                <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>
                  Recomendado: 800×600px
                </small>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => { setShowModal(false); setShowPresetGallery(false); }}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  <FaCheck /> Guardar slide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showToast && <div className="toast">{toastMessage}</div>}
    </div>
  );
}