import { useState, useEffect } from 'react';
import { getBusinessInfo, updateBusinessInfo, uploadImage } from '../../api';
import { FaPlus, FaTrash, FaImage, FaSave, FaFont, FaEye } from 'react-icons/fa';
import './BusinessInfoManager.css';

const createEmptyBlock = (type) => {
  const id = Date.now().toString();
  switch (type) {
    case 'text':
      return {
        id,
        type: 'text',
        title: '',
        text: '',
        order: 0,
        textAlign: 'left',
        titleColor: '#1a202c',
        textColor: '#4a5568',
      };
    case 'image':
      return {
        id,
        type: 'image',
        title: '',
        image: '',
        order: 0,
        imageAlign: 'center',
      };
    case 'parallax':
      return {
        id,
        type: 'parallax',
        title: '',
        showText: false,
        parallaxImage: '',
        order: 0,
      };
    default:
      return null;
  }
};

export default function BusinessInfoManager({ showMessage: externalShowMessage }) {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [editingBlock, setEditingBlock] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showMessage = (type, msg) => {
    if (externalShowMessage) {
      externalShowMessage(type, msg);
    } else {
      setToastMessage(msg);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  useEffect(() => {
    loadBlocks();
  }, []);

  const loadBlocks = async () => {
    const data = await getBusinessInfo();
    if (data.length) {
      // Aseguramos que tengan orden
      const withOrder = data.map((b, i) =>
        b.order !== undefined ? b : { ...b, order: i + 1 }
      );
      // Ordenamos por el campo order
      withOrder.sort((a, b) => (a.order || 0) - (b.order || 0));
      // Renumeramos consecutivamente
      const renumbered = withOrder.map((b, idx) => ({ ...b, order: idx + 1 }));
      setBlocks(renumbered);
    } else {
      setBlocks([]);
    }
    setLoading(false);
  };

  // Solo asigna números consecutivos, sin ordenar (ya vienen ordenados)
  const renumberBlocks = (blockList) => {
    return blockList.map((b, idx) => ({ ...b, order: idx + 1 }));
  };

  const handleAddBlock = (type) => {
    if (expandedId) return;
    const newBlock = createEmptyBlock(type);
    newBlock.order = blocks.length + 1;
    const updated = renumberBlocks([...blocks, newBlock]);
    setBlocks(updated);
    setExpandedId(newBlock.id);
    setEditingBlock({ ...newBlock });
  };

  const handleDeleteBlock = (id) => {
    const filtered = blocks.filter(b => b.id !== id);
    setBlocks(renumberBlocks(filtered));
    if (expandedId === id) {
      setExpandedId(null);
      setEditingBlock(null);
    }
  };

  const handleOrderChange = (id, newPosition) => {
    const newOrder = parseInt(newPosition, 10);
    if (isNaN(newOrder) || newOrder < 1 || newOrder > blocks.length) return;

    // Copia del array actual
    let updated = [...blocks];
    const blockIndex = updated.findIndex(b => b.id === id);
    if (blockIndex === -1) return;

    // Extraemos el bloque y lo insertamos en la nueva posición (1-indexada)
    const block = updated[blockIndex];
    updated.splice(blockIndex, 1);
    updated.splice(newOrder - 1, 0, block);

    // Renumeramos sin ordenar, ya que la posición es la que queremos
    const newBlocks = renumberBlocks(updated);
    setBlocks(newBlocks);

    // Si el bloque movido es el que se está editando, actualizamos su orden en la copia local
    if (expandedId === id && editingBlock) {
      setEditingBlock(prev => ({ ...prev, order: newOrder }));
    }
  };

  const handleExpand = (block) => {
    if (expandedId) return;
    setExpandedId(block.id);
    setEditingBlock({ ...block });
  };

  const handleClose = () => {
    setExpandedId(null);
    setEditingBlock(null);
  };

  const handleSaveBlock = () => {
    if (!editingBlock) return;
    setBlocks(prev => {
      const updated = prev.map(b =>
        b.id === editingBlock.id ? { ...editingBlock } : b
      );
      return renumberBlocks(updated);
    });
    showMessage('success', 'Bloque guardado');
    setExpandedId(null);
    setEditingBlock(null);
  };

  const handleEditingChange = (field, value) => {
    setEditingBlock(prev => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleImageUpload = async (file, fieldName = 'image') => {
    const res = await uploadImage(file);
    if (res.url && editingBlock) {
      setEditingBlock(prev => ({ ...prev, [fieldName]: res.url }));
    }
  };

  const handleRemoveImage = (fieldName = 'image') => {
    if (editingBlock) {
      setEditingBlock(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  const handleSave = async () => {
    if (editingBlock) {
      setBlocks(prev => {
        const updated = prev.map(b =>
          b.id === editingBlock.id ? { ...editingBlock } : b
        );
        return renumberBlocks(updated);
      });
      setExpandedId(null);
      setEditingBlock(null);
    }
    setSaving(true);
    try {
      await updateBusinessInfo(blocks);
      showMessage('success', 'Cambios guardados');
    } catch (err) {
      showMessage('error', 'Error al guardar');
    }
    setSaving(false);
  };

  const getBlockPreview = (block) => {
    if (block.title) return block.title;
    if (block.type === 'image') return 'Imagen';
    if (block.type === 'parallax') return block.parallaxImage ? 'Imagen parallax' : 'Parallax sin imagen';
    return 'Sin título';
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'text': return <FaFont />;
      case 'image': return <FaImage />;
      case 'parallax': return <FaEye />;
      default: return null;
    }
  };

  const isAddDisabled = !!expandedId;

  if (loading) return <div className="business-info-loading">Cargando...</div>;

  return (
    <div className="business-info-manager">
      <div className="bim-header">
        <h2>Información del negocio</h2>
        <p className="bim-description">
          Agrega bloques y ordénalos con el menú desplegable. Haz clic en "Editar" para modificar un bloque.
        </p>
      </div>

      <div className="bim-toolbar">
        <button className="btn-secondary" onClick={() => handleAddBlock('text')} disabled={isAddDisabled}>
          <FaFont /> Texto
        </button>
        <button className="btn-secondary" onClick={() => handleAddBlock('image')} disabled={isAddDisabled}>
          <FaImage /> Imagen
        </button>
        <button className="btn-secondary" onClick={() => handleAddBlock('parallax')} disabled={isAddDisabled}>
          <FaEye /> Parallax
        </button>
      </div>

      <div className="bim-blocks">
        {blocks.map((block) => {
          const isExpanded = expandedId === block.id;
          const currentBlock = isExpanded && editingBlock ? editingBlock : block;

          return (
            <div key={block.id} className={`bim-block ${isExpanded ? 'expanded' : ''}`}>
              <div className="bim-block-header">
                <div className="bim-block-header-left">
                  <div className="bim-order-select">
                    <select
                      value={block.order}
                      onChange={(e) => handleOrderChange(block.id, e.target.value)}
                      className="order-select"
                    >
                      {blocks.map((_, index) => (
                        <option key={index + 1} value={index + 1}>
                          {index + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                  <span className="bim-block-type-icon">{getTypeIcon(block.type)}</span>
                  <span className="bim-block-summary">{getBlockPreview(block)}</span>
                </div>
                <div className="bim-block-header-right">
                  {!isExpanded ? (
                    <button className="btn-edit-block" onClick={() => handleExpand(block)} disabled={!!expandedId}>
                      Editar
                    </button>
                  ) : (
                    <button className="btn-close-block" onClick={handleClose}>
                      Cerrar
                    </button>
                  )}
                  <button className="btn-icon btn-delete-only" onClick={(e) => { e.stopPropagation(); handleDeleteBlock(block.id); }} title="Eliminar bloque">
                    <FaTrash />
                  </button>
                </div>
              </div>

              {isExpanded && currentBlock && (
                <div className="bim-block-content">
                  {currentBlock.type === 'text' && (
                    <>
                      <div className="bim-field">
                        <label>Título</label>
                        <input type="text" value={currentBlock.title} onChange={(e) => handleEditingChange('title', e.target.value)} placeholder="Título del bloque" />
                      </div>
                      <div className="bim-field">
                        <label>Descripción</label>
                        <textarea rows="5" value={currentBlock.text} onChange={(e) => handleEditingChange('text', e.target.value)} placeholder="Escribe aquí la información..." />
                      </div>
                      <div className="bim-field">
                        <label>Alineación del texto</label>
                        <select value={currentBlock.textAlign || 'left'} onChange={(e) => handleEditingChange('textAlign', e.target.value)}>
                          <option value="left">Izquierda</option>
                          <option value="center">Centro</option>
                          <option value="right">Derecha</option>
                        </select>
                      </div>
                      <div className="bim-field">
                        <label>Color del título</label>
                        <div className="bim-color-picker">
                          <input
                            type="color"
                            value={currentBlock.titleColor || '#1a202c'}
                            onChange={(e) => handleEditingChange('titleColor', e.target.value)}
                          />
                          <span className="bim-color-value">{currentBlock.titleColor || '#1a202c'}</span>
                        </div>
                      </div>
                      <div className="bim-field">
                        <label>Color del texto</label>
                        <div className="bim-color-picker">
                          <input
                            type="color"
                            value={currentBlock.textColor || '#4a5568'}
                            onChange={(e) => handleEditingChange('textColor', e.target.value)}
                          />
                          <span className="bim-color-value">{currentBlock.textColor || '#4a5568'}</span>
                        </div>
                      </div>
                    </>
                  )}

                  {currentBlock.type === 'image' && (
                    <>
                      <div className="bim-field">
                        <label>Título (opcional)</label>
                        <input type="text" value={currentBlock.title} onChange={(e) => handleEditingChange('title', e.target.value)} placeholder="Título que acompaña a la imagen" />
                      </div>
                      <div className="bim-field">
                        <label>Imagen – Tamaño recomendado: 1200×800 px</label>
                        <div className="bim-images">
                          {currentBlock.image ? (
                            <div className="bim-image-preview bim-image-preview-large">
                              <img src={currentBlock.image} alt="Imagen del bloque" />
                              <button className="remove-img-btn" onClick={() => handleRemoveImage('image')}><FaTrash /></button>
                            </div>
                          ) : (
                            <label className="bim-upload-btn">
                              <FaImage /> Subir imagen
                              <input type="file" accept="image/*" onChange={(e) => { if (e.target.files[0]) { handleImageUpload(e.target.files[0], 'image'); e.target.value = ''; } }} style={{ display: 'none' }} />
                            </label>
                          )}
                        </div>
                      </div>
                      <div className="bim-field">
                        <label>Alineación de la imagen</label>
                        <select value={currentBlock.imageAlign || 'center'} onChange={(e) => handleEditingChange('imageAlign', e.target.value)}>
                          <option value="left">Izquierda</option>
                          <option value="center">Centro</option>
                          <option value="right">Derecha</option>
                        </select>
                      </div>
                    </>
                  )}

                  {currentBlock.type === 'parallax' && (
                    <>
                      <div className="bim-field">
                        <label>Imagen parallax – Tamaño recomendado: 1920×1080 px</label>
                        <div className="bim-images">
                          {currentBlock.parallaxImage ? (
                            <div className="bim-image-preview parallax-preview">
                              <img src={currentBlock.parallaxImage} alt="Parallax" />
                              <button className="remove-img-btn" onClick={() => handleRemoveImage('parallaxImage')}><FaTrash /></button>
                            </div>
                          ) : (
                            <label className="bim-upload-btn">
                              <FaImage /> Subir imagen
                              <input type="file" accept="image/*" onChange={(e) => { if (e.target.files[0]) { handleImageUpload(e.target.files[0], 'parallaxImage'); e.target.value = ''; } }} style={{ display: 'none' }} />
                            </label>
                          )}
                        </div>
                      </div>
                      <div className="bim-field bim-checkbox">
                        <label className="bim-checkbox">
                          <input
                            type="checkbox"
                            checked={currentBlock.showText || false}
                            onChange={(e) => handleEditingChange('showText', e.target.checked)}
                          />
                          Mostrar texto sobre la imagen
                        </label>
                      </div>
                      {currentBlock.showText && (
                        <div className="bim-field">
                          <label>Texto superpuesto</label>
                          <input type="text" value={currentBlock.title} onChange={(e) => handleEditingChange('title', e.target.value)} placeholder="Texto que aparecerá sobre la imagen" />
                        </div>
                      )}
                    </>
                  )}

                  <div className="bim-block-footer">
                    <button className="btn-save-block" onClick={handleSaveBlock}>
                      <FaSave /> Guardar este bloque
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button className="bim-save-fab" onClick={handleSave} disabled={saving} title="Guardar todos los cambios en la nube">
        <FaSave />
        {saving ? 'Guardando...' : 'Guardar'}
      </button>

      {showToast && (
        <div className="toast-message success">
          {toastMessage}
        </div>
      )}
    </div>
  );
}