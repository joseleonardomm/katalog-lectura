import React, { useCallback, useEffect, useRef } from 'react';
import * as Icons from 'react-icons/fa';
import './FullCategories.css';

function FullCategories({ categories = [], selectedCategory, onSelectCategory, config }) {
  if (categories.length === 0) return null;

  const sectionRef = useRef(null);

  const applySectionColor = useCallback((element, color) => {
    if (element) {
      element.style.setProperty('color', color, 'important');
    }
  }, []);

  // Callback ref para aplicar el color ni bien se monte el elemento
  const setSectionRef = useCallback((node) => {
    sectionRef.current = node;
    if (node && config) {
      const color = config.sectionTitleColor || config.primaryColor || '#1e1e2a';
      applySectionColor(node, color);
    }
  }, [config, applySectionColor]);

  // Actualizar el color si cambia la configuración
  useEffect(() => {
    if (sectionRef.current && config) {
      const color = config.sectionTitleColor || config.primaryColor || '#1e1e2a';
      applySectionColor(sectionRef.current, color);
    }
  }, [config, applySectionColor]);

  const getIconComponent = (iconName) => {
    const Icon = Icons[iconName];
    return Icon ? <Icon /> : <Icons.FaBriefcase />;
  };

  // Colores para los títulos de las categorías (seguimos usando el mismo enfoque directo)
  const categoryTitleColor = config?.categoryTitleColor || '#ffffff';

  return (
    <div className="full-categories-section">
      {/* 🔻 Título de sección con color forzado via JS */}
      <div
        className="section-title"
        ref={setSectionRef}
      >
        📂 Categorías
      </div>

      <div className="full-categories-grid">
        <div
          className={`full-category-card ${!selectedCategory ? 'active' : ''}`}
          onClick={() => onSelectCategory(null)}
        >
          <div className="full-category-icon"><Icons.FaMicrochip /></div>
          <div className="full-category-info">
            <h3 style={{ color: categoryTitleColor }}>Todos</h3>
            <p>Ver todos los productos</p>
          </div>
        </div>
        {categories.map(cat => (
          <div
            key={cat.id}
            className={`full-category-card ${selectedCategory === cat.name ? 'active' : ''}`}
            onClick={() => onSelectCategory(cat.name)}
            style={{
              backgroundImage: cat.coverImage ? `url(${cat.coverImage})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative'
            }}
          >
            {cat.coverImage && (
              <div
                className="category-card-overlay"
                style={{
                  position: 'absolute', top: 0, left: 0,
                  width: '100%', height: '100%',
                  background: 'rgba(0,0,0,0.4)',
                  borderRadius: '24px', zIndex: 0
                }}
              />
            )}
            <div className="full-category-icon" style={{ position: 'relative', zIndex: 1 }}>
              {getIconComponent(cat.icon)}
            </div>
            <div className="full-category-info" style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{ color: categoryTitleColor }}>{cat.name}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FullCategories;