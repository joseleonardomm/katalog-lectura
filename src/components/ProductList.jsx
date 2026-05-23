import { useState, useEffect } from 'react';
import { getProducts, deleteProduct } from '../api';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    const data = await getProducts();
    setProducts(data);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar producto?')) {
      await deleteProduct(id);
      load();
    }
  };

  return (
    <div>
      <h2>Lista de Productos</h2>
      {products.map(p => (
        <div key={p.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px', borderRadius: '16px' }}>
          <strong>{p.name}</strong> - {p.priceUSD} USD
          <div>
            <button onClick={() => setEditing(p)}>Editar</button>
            <button onClick={() => handleDelete(p.id)}>Eliminar</button>
          </div>
          {editing?.id === p.id && (
            <ProductForm initialProduct={editing} onSuccess={() => { setEditing(null); load(); }} />
          )}
        </div>
      ))}
    </div>
  );
}