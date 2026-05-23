import { useState } from 'react';
import { createCategory, updateCategory, uploadImage } from '../../api';
import * as FaIcons from 'react-icons/fa';

const iconNames = [
  'FaMicrochip', 'FaLaptop', 'FaMobileAlt', 'FaHeadphones', 'FaDesktop', 'FaTabletAlt',
  'FaTv', 'FaGamepad', 'FaKeyboard', 'FaMouse', 'FaCamera', 'FaPrint',
  'FaCouch', 'FaBed', 'FaLightbulb', 'FaChair', 'FaHome', 'FaDoorOpen',
  'FaBath', 'FaShower', 'FaToilet', 'FaKitchenSet', 'FaBlender',
  'FaTshirt', 'FaShoePrints', 'FaHatCowboy', 'FaGlasses', 'FaRing', 'FaNecklace',
  'FaWatch', 'FaHandbag', 'FaBackpack', 'FaSocks',
  'FaUtensils', 'FaHamburger', 'FaPizzaSlice', 'FaCoffee', 'FaWineGlassAlt',
  'FaBeer', 'FaCandyCane', 'FaAppleAlt', 'FaCarrot', 'FaFish', 'FaCookie',
  'FaFutbol', 'FaBasketballBall', 'FaBicycle', 'FaRunning', 'FaDumbbell',
  'FaSwimmer', 'FaGolfBall', 'FaSkiing', 'FaHiking', 'FaHeartbeat',
  'FaCar', 'FaMotorcycle', 'FaBus', 'FaPlane', 'FaShip', 'FaTruck',
  'FaBicycle', 'FaAmbulance', 'FaTaxi',
  'FaDog', 'FaCat', 'FaPaw', 'FaFish', 'FaCrow', 'FaHorse', 'FaDove',
  'FaBaby', 'FaChild', 'FaBabyCarriage', 'FaGameConsole', 'FaTeddyBear',
  'FaSpa', 'FaCut', 'FaSoap', 'FaTooth', 'FaSyringe', 'FaHandsWash',
  'FaBook', 'FaGraduationCap', 'FaPencilAlt', 'FaBriefcase', 'FaCalculator',
  'FaFileAlt', 'FaClipboard', 'FaStickyNote',
  'FaTree', 'FaLeaf', 'FaSeedling', 'FaFlower', 'FaMountain', 'FaSun',
  'FaMusic', 'FaGuitar', 'FaDrum', 'FaFilm', 'FaTicketAlt', 'FaMicrophone',
  'FaStar', 'FaHeart', 'FaGift', 'FaShoppingCart', 'FaTag', 'FaTrophy',
  'FaGlobe', 'FaMapMarkerAlt', 'FaPhone', 'FaEnvelope', 'FaCog', 'FaWrench',
  'FaQuestionCircle', 'FaSmile', 'FaFire', 'FaGem'
];

const getIconComponent = (iconName) => {
  const IconComponent = FaIcons[iconName];
  return IconComponent ? <IconComponent /> : <FaIcons.FaQuestionCircle />;
};

export default function CategoryForm({ initialCategory, onSuccess, onCancel }) {
  const [form, setForm] = useState(initialCategory || { name: '', icon: 'FaBriefcase', coverImage: '' });
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleIconSelect = (iconName) => {
    setForm({ ...form, icon: iconName });
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const res = await uploadImage(file);
    if (res.url) setForm({ ...form, coverImage: res.url });
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (initialCategory) {
      await updateCategory(initialCategory.id, form);
    } else {
      await createCategory(form);
    }
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <div className="form-group">
        <label>Nombre de la categoría</label>
        <input name="name" value={form.name} onChange={handleChange} required />
      </div>

      <div className="form-group">
        <label>Icono</label>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 0 }}>
          Selecciona un icono para la portada
        </p>
        <div className="icon-grid" style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          marginTop: '12px',
          maxHeight: '250px',
          overflowY: 'auto',
          padding: '8px',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          background: 'var(--bg-card)'
        }}>
          {iconNames.map(iconName => {
            const isSelected = form.icon === iconName;
            return (
              <div
                key={iconName}
                onClick={() => handleIconSelect(iconName)}
                title={iconName.replace('Fa', '')}
                style={{
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border-color)',
                  borderRadius: '12px',
                  background: isSelected ? 'var(--accent-soft)' : 'var(--bg-input)',
                  color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
                  transition: '0.2s',
                  boxShadow: isSelected ? '0 0 0 2px rgba(255,107,0,0.3)' : 'none'
                }}
              >
                {getIconComponent(iconName)}
              </div>
            );
          })}
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
          Más de 100 iconos disponibles. Desplázate para ver todos.
        </p>
      </div>

      <div className="form-group">
        <label>Imagen de portada (opcional)</label>
        <div className="file-upload-area">
          <input type="file" accept="image/*" onChange={handleCoverUpload} disabled={uploading} id="category-cover-upload" style={{ display: 'none' }} />
          <label htmlFor="category-cover-upload" className="modern-upload-btn">
            {uploading ? 'Subiendo...' : '📁 Subir portada'}
          </label>
        </div>
        {form.coverImage && (
          <div className="image-preview-grid" style={{ marginTop: '0.5rem' }}>
            <div className="image-preview-wrapper">
              <div className="image-preview" style={{ width: '80px', height: '80px' }}>
                <img src={form.coverImage} alt="portada" />
              </div>
              <button
                type="button"
                className="remove-img-btn"
                onClick={() => setForm({ ...form, coverImage: '' })}
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="form-actions" style={{ marginTop: '1.5rem' }}>
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn-primary">Guardar</button>
      </div>
    </form>
  );
}