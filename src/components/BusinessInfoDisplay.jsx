import { useState, useEffect, useRef } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './BusinessInfoDisplay.css';

export default function BusinessInfoDisplay({ uid }) {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const blockRefs = useRef([]);
  const parallaxRefs = useRef([]);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }
    const loadInfo = async () => {
      try {
        const configSnap = await getDoc(doc(db, 'users', uid, 'config', 'settings'));
        if (configSnap.exists()) {
          const data = configSnap.data();
          const businessInfo = data.businessInfo || [];
          setBlocks(businessInfo);
        }
      } catch (err) {
        console.error('Error al cargar información del negocio:', err);
      } finally {
        setLoading(false);
      }
    };
    loadInfo();
  }, [uid]);

  // Animación de entrada
  useEffect(() => {
    if (blocks.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('bid-visible');
          }
        });
      },
      { threshold: 0.2 }
    );

    const currentRefs = blockRefs.current;
    currentRefs.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => {
      currentRefs.forEach(ref => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [blocks]);

  // Parallax
  useEffect(() => {
    const handleScroll = () => {
      parallaxRefs.current.forEach((el) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        if (rect.top < windowHeight && rect.bottom > 0) {
          const scrolled = window.pageYOffset;
          const rate = 0.4;
          const yPos = (scrolled - el.offsetTop) * rate;
          const img = el.querySelector('.bid-parallax-img');
          if (img) {
            img.style.transform = `translateY(${yPos}px)`;
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [blocks]);

  if (loading) return null;
  if (blocks.length === 0) return null;

  const getTextAlignmentStyle = (align) => {
    switch (align) {
      case 'center': return { textAlign: 'center' };
      case 'right': return { textAlign: 'right' };
      default: return { textAlign: 'left' };
    }
  };

  const getImageAlignmentStyle = (align) => {
    switch (align) {
      case 'left': return { justifyContent: 'flex-start' };
      case 'right': return { justifyContent: 'flex-end' };
      default: return { justifyContent: 'center' };
    }
  };

  return (
    <div className="business-info-display">
      {blocks.map((block, idx) => (
        <div key={block.id || idx}>
          {block.type === 'text' && (
            <div
              ref={el => (blockRefs.current[idx] = el)}
              className={`bid-block bid-text-block ${idx % 2 === 0 ? 'bid-bg-light' : 'bid-bg-dark'}`}
              style={getTextAlignmentStyle(block.textAlign)}
            >
              <div className="bid-content">
                <h2
                  className="bid-title"
                  style={{ color: block.titleColor || undefined }}
                >
                  {block.title}
                </h2>
                {block.text && (
                  <p
                    className="bid-text"
                    style={{ color: block.textColor || undefined }}
                  >
                    {block.text}
                  </p>
                )}
              </div>
            </div>
          )}

          {block.type === 'image' && (
            <div
              ref={el => (blockRefs.current[idx] = el)}
              className="bid-block bid-image-block"
            >
              <div className="bid-content">
                {block.title && <h2 className="bid-title">{block.title}</h2>}
                {block.image && (
                  <div
                    className="bid-image-container"
                    style={getImageAlignmentStyle(block.imageAlign)}
                  >
                    <div className="bid-full-image">
                      <img
                        src={block.image}
                        alt={block.title || 'Imagen'}
                        loading="lazy"
                        onClick={() => setSelectedImage(block.image)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {block.type === 'parallax' && (
            <div
              className="bid-parallax-container"
              ref={el => (parallaxRefs.current[idx] = el)}
            >
              <div className="bid-parallax-sticky">
                <div className="bid-parallax-image-wrapper">
                  <img
                    src={block.parallaxImage}
                    alt="Parallax"
                    className="bid-parallax-img"
                  />
                </div>
                {block.showText && block.title && (
                  <div className="bid-parallax-overlay">
                    <h2 className="bid-parallax-title">{block.title}</h2>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      {selectedImage && (
        <div className="bid-lightbox" onClick={() => setSelectedImage(null)}>
          <div className="bid-lightbox-inner" onClick={e => e.stopPropagation()}>
            <button className="bid-lightbox-close" onClick={() => setSelectedImage(null)}>✕</button>
            <img src={selectedImage} alt="Ampliada" />
          </div>
        </div>
      )}
    </div>
  );
}