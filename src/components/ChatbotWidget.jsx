import { useState, useEffect, useRef } from 'react';
import { FaRobot, FaTimes, FaWhatsapp, FaPaperPlane, FaChevronUp } from 'react-icons/fa';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import './ChatbotWidget.css';

export default function ChatbotWidget({ config, uid }) {
  const [isOpen, setIsOpen] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTooltip, setShowTooltip] = useState(true);
  const [answeredIds, setAnsweredIds] = useState(new Set());
  const [showFaqMenu, setShowFaqMenu] = useState(false);
  const chatEndRef = useRef(null);
  const widgetRef = useRef(null);
  const inputRef = useRef(null);

  // Listener en tiempo real desde Firestore
  useEffect(() => {
    if (!uid) return;
    const configRef = doc(db, `users/${uid}/config`, 'settings');
    const unsubscribe = onSnapshot(
      configRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const faqArray = data.faq;
          setFaqs(Array.isArray(faqArray) && faqArray.length > 0 ? faqArray : []);
        } else {
          setFaqs([]);
        }
      },
      (error) => {
        console.error('Error al escuchar FAQs:', error);
        setFaqs([]);
      }
    );
    return () => unsubscribe();
  }, [uid]);

  // Inicializar mensajes de bienvenida al abrir
  useEffect(() => {
    if (isOpen && faqs.length > 0 && chatMessages.length === 0) {
      setChatMessages([
        {
          type: 'bot',
          text: '¡Hola! 👋 Soy tu asistente virtual. Selecciona una pregunta o escribe la tuya.',
          id: 'welcome'
        }
      ]);
    }
  }, [isOpen, faqs]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // Tooltip automático
  useEffect(() => {
    if (showTooltip && !isOpen) {
      const timer = setTimeout(() => setShowTooltip(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showTooltip, isOpen]);

  // Al abrir, ocultar tooltip y enfocar input
  useEffect(() => {
    if (isOpen) {
      setShowTooltip(false);
    }
  }, [isOpen]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowFaqMenu(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const primaryColor = config?.primaryColor || '#ff8c42';
  const whatsappNumber = config?.whatsappNumber || '';

  // Preguntas que aún no han sido respondidas (para el menú)
  const unansweredFaqs = faqs.filter((faq, idx) => !answeredIds.has(`faq-${faq.id || idx}`));

  // Manejar clic en una pregunta (desde menú o sugerencias)
  const handleFaqClick = (faq, index) => {
    const msgId = `faq-${faq.id || index}`;
    
    if (answeredIds.has(msgId)) return;

    const userMsg = {
      type: 'user',
      text: faq.question,
      id: `user-${msgId}`
    };

    const botMsg = {
      type: 'bot',
      text: faq.answer,
      id: `bot-${msgId}`
    };

    setChatMessages(prev => [...prev, userMsg, botMsg]);
    setAnsweredIds(prev => new Set(prev).add(msgId));
    setShowFaqMenu(false);
  };

  const handleInputClick = () => {
    // Al hacer clic en el input, abrir/cerrar el menú de preguntas
    setShowFaqMenu(prev => !prev);
  };

  // Si no hay preguntas, no mostrar el widget
  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="chatbot-widget" ref={widgetRef}>
      {/* Tooltip flotante */}
      {showTooltip && !isOpen && (
        <div className="chatbot-tooltip">
          ¿Necesitas ayuda? 💬
        </div>
      )}

      {/* Botón flotante */}
      <button
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        style={{ backgroundColor: primaryColor }}
        aria-label="Abrir chat de ayuda"
      >
        {isOpen ? <FaTimes /> : <FaRobot />}
      </button>

      {/* Panel del chat estilo conversación */}
      {isOpen && (
        <div className="chatbot-panel">
          {/* Encabezado */}
          <div className="chatbot-panel-header" style={{ backgroundColor: primaryColor }}>
            <FaRobot className="chatbot-header-icon" />
            <div>
              <h3>Asistente virtual</h3>
              <p>Responde en minutos</p>
            </div>
          </div>

          {/* Área de mensajes */}
          <div className="chatbot-messages">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-message ${msg.type === 'user' ? 'user-message' : 'bot-message'}`}
              >
                <div className="message-bubble">
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Sugerencias rápidas (debajo del chat, chips con las FAQs no respondidas) */}
          {unansweredFaqs.length > 0 && (
            <div className="chatbot-suggestions">
              {unansweredFaqs.slice(0, 4).map((faq, index) => (
                <button
                  key={faq.id || index}
                  className="suggestion-chip"
                  onClick={() => handleFaqClick(faq, index)}
                  style={{ borderColor: primaryColor }}
                >
                  {faq.question}
                </button>
              ))}
            </div>
          )}

          {/* Barra inferior con input de solo lectura y botón de enviar (opcional) */}
          <div className="chatbot-input-area">
            {showFaqMenu && (
              <div className="faq-menu-dropdown">
                <div className="faq-menu-header">
                  <span>Preguntas frecuentes</span>
                  <button
                    className="faq-menu-close-btn"
                    onClick={() => setShowFaqMenu(false)}
                  >
                    <FaChevronUp />
                  </button>
                </div>
                <div className="faq-menu-list">
                  {unansweredFaqs.length > 0 ? (
                    unansweredFaqs.map((faq, index) => (
                      <button
                        key={faq.id || index}
                        className="faq-menu-item"
                        onClick={() => handleFaqClick(faq, index)}
                      >
                        {faq.question}
                      </button>
                    ))
                  ) : (
                    <p className="faq-menu-empty">Todas las preguntas han sido respondidas.</p>
                  )}
                </div>
              </div>
            )}

            <div className="chatbot-input-row">
              <input
                ref={inputRef}
                type="text"
                className="chatbot-input"
                placeholder="Selecciona una pregunta..."
                value={searchTerm}
                readOnly
                onClick={handleInputClick}
              />
              <button
                className="chatbot-send-btn"
                onClick={handleInputClick}
                style={{ backgroundColor: primaryColor }}
                title="Ver preguntas frecuentes"
              >
                <FaPaperPlane />
              </button>
            </div>
            {whatsappNumber && (
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hola, necesito ayuda con...')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="chatbot-whatsapp-mini"
              >
                <FaWhatsapp /> Contactar por WhatsApp
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}