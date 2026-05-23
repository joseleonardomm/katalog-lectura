import { useState, useEffect } from 'react';
import { getFaqs, updateFaqs } from '../../api';
import { FaPlus, FaTrash, FaSave } from 'react-icons/fa';
import './FaqManager.css';

export default function FaqManager() {
  const [faqs, setFaqs] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadFaqs();
  }, []);

  const loadFaqs = async () => {
    const data = await getFaqs();
    setFaqs(data || []);
  };

  const handleAdd = () => {
    const newFaq = { id: Date.now(), question: '', answer: '' };
    setFaqs([...faqs, newFaq]);
  };

  const handleChange = (id, field, value) => {
    setFaqs(prev =>
      prev.map(faq => (faq.id === id ? { ...faq, [field]: value } : faq))
    );
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Eliminar esta pregunta?')) {
      setFaqs(prev => prev.filter(faq => faq.id !== id));
    }
  };

  const handleSave = async () => {
    // Solo guardar preguntas con ambos campos completos
    const validFaqs = faqs.filter(f => f.question.trim() && f.answer.trim());

    setSaving(true);
    try {
      await updateFaqs(validFaqs); // Guarda el array filtrado (puede ser vacío)
      setFaqs(validFaqs);           // Refleja el estado real guardado
      showMessage('Preguntas frecuentes guardadas');
    } catch (error) {
      console.error(error);
      alert('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="faq-manager">
      <div className="faq-header">
        <h2>💬 Preguntas frecuentes del chatbot</h2>
        <button className="btn-save" onClick={handleSave} disabled={saving}>
          <FaSave /> {saving ? 'Guardando...' : 'Guardar todo'}
        </button>
      </div>
      <p className="faq-intro">
        Estas preguntas aparecerán en el chatbot flotante de tu tienda pública. Si no hay ninguna, el chatbot se ocultará.
      </p>

      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div key={faq.id} className="faq-item">
            <div className="faq-item-header">
              <span className="faq-number">#{index + 1}</span>
              <button className="btn-delete-faq" onClick={() => handleDelete(faq.id)}>
                <FaTrash />
              </button>
            </div>
            <input
              type="text"
              className="faq-input"
              placeholder="Ej: ¿Cuál es el horario de atención?"
              value={faq.question}
              onChange={(e) => handleChange(faq.id, 'question', e.target.value)}
            />
            <textarea
              className="faq-textarea"
              rows="2"
              placeholder="Respuesta..."
              value={faq.answer}
              onChange={(e) => handleChange(faq.id, 'answer', e.target.value)}
            />
          </div>
        ))}
      </div>

      <button className="btn-add-faq" onClick={handleAdd}>
        <FaPlus /> Agregar pregunta
      </button>

      {showToast && <div className="toast">{toastMessage}</div>}
    </div>
  );
}