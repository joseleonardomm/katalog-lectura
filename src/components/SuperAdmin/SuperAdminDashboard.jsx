import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAllUsers, updateUserPlan, cancelUserPlan, logout,
  getGlobalStats, getUserProducts, getUserSales, getUserPlanInfo, getUserShipping,
} from '../../api';
import PlanManager from './PlanManager';  // ← CORREGIDO: misma carpeta
import {
  FaUsers, FaBox, FaShoppingCart, FaMoneyBillWave, FaTruck,
  FaSearch, FaCalendarAlt, FaTrash, FaCheckCircle, FaTimesCircle,
  FaSignOutAlt, FaChartBar, FaCog, FaChevronLeft, FaChevronRight,
  FaStore, FaClipboardList, FaCopy,
} from 'react-icons/fa';
import './SuperAdminDashboard.css';

export default function SuperAdminDashboard() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [customDate, setCustomDate] = useState('');
  const [message, setMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  // Detalle de tienda
  const [selectedStore, setSelectedStore] = useState(null);
  const [storeProducts, setStoreProducts] = useState([]);
  const [storeSales, setStoreSales] = useState([]);
  const [storeShipping, setStoreShipping] = useState(null);
  const [storeLoading, setStoreLoading] = useState(false);

  const loadData = async () => {
    try {
      const [usersData, statsData] = await Promise.all([
        getAllUsers(),
        getGlobalStats(),
      ]);
      setUsers(usersData || []);
      setStats(statsData);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      showMessage('error', 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handlePlanChange = async (uid, newPlan) => {
    const user = users.find(u => u.uid === uid);
    if (!user) return;
    const currentPlanName = user.plan === 'free' ? 'Gratis' : user.plan === 'pro' ? 'Pro' : 'Business';
    const newPlanName = newPlan === 'free' ? 'Gratis' : newPlan === 'pro' ? 'Pro' : 'Business';
    if (!window.confirm(`¿Cambiar plan de ${user.email} de ${currentPlanName} a ${newPlanName}?`)) return;

    try {
      const now = new Date().toISOString();
      await updateUserPlan(uid, {
        plan: newPlan,
        planStartDate: now,
        planEndDate: newPlan === 'free' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
      });
      await loadData();
      showMessage('success', `Plan de ${user.email} actualizado a ${newPlanName}`);
    } catch (err) {
      showMessage('error', 'No se pudo actualizar el plan.');
    }
  };

  const handleSetCustomEndDate = async (uid) => {
    if (!customDate) return showMessage('error', 'Selecciona una fecha');
    const endDate = new Date(customDate + 'T23:59:59');
    if (endDate <= new Date()) return showMessage('error', 'La fecha debe ser futura');
    try {
      await updateUserPlan(uid, { planEndDate: endDate.toISOString(), status: 'active' });
      setEditingUser(null); setCustomDate('');
      await loadData();
      showMessage('success', 'Fecha de vencimiento actualizada');
    } catch (err) {
      showMessage('error', 'No se pudo actualizar la fecha.');
    }
  };

  const handleRenew = async (uid, months) => {
    const user = users.find(u => u.uid === uid);
    if (!user) return;
    if (!window.confirm(`¿Renovar plan de ${user.email} por ${months} mes(es)?`)) return;
    try {
      const now = new Date();
      const currentEnd = user.planEndDate ? new Date(user.planEndDate) : now;
      const newEnd = new Date(currentEnd);
      newEnd.setMonth(newEnd.getMonth() + months);
      if (newEnd <= now) newEnd.setMonth(now.getMonth() + months);
      await updateUserPlan(uid, {
        planEndDate: newEnd.toISOString(),
        status: 'active',
        planStartDate: user.planStartDate || now.toISOString(),
      });
      await loadData();
      showMessage('success', `Plan renovado por ${months} mes(es)`);
    } catch (err) {
      showMessage('error', 'No se pudo renovar el plan.');
    }
  };

  const handleCancel = async (uid) => {
    const user = users.find(u => u.uid === uid);
    if (!user) return;
    if (!window.confirm(`¿Cancelar el plan de ${user.email} y degradar a Gratis?`)) return;
    try {
      await cancelUserPlan(uid);
      await loadData();
      showMessage('success', `Plan de ${user.email} cancelado.`);
    } catch (err) {
      showMessage('error', 'No se pudo cancelar el plan.');
    }
  };

  const copyStoreLink = (slug) => {
    const url = `https://katal.site/tienda/${slug}`;
    navigator.clipboard.writeText(url);
    showMessage('success', 'Enlace copiado');
  };

  const handleViewStore = async (user) => {
    setSelectedStore(user);
    setStoreLoading(true);
    try {
      const [prods, sales, shipping] = await Promise.all([
        getUserProducts(user.uid),
        getUserSales(user.uid),
        getUserShipping(user.uid),
      ]);
      setStoreProducts(prods);
      setStoreSales(sales);
      setStoreShipping(shipping);
    } catch (err) {
      console.error(err);
    } finally {
      setStoreLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const filteredUsers = users.filter(u =>
    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.storeName || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.slug || '').toLowerCase().includes(search.toLowerCase())
  );

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaChartBar /> },
    { id: 'users', label: 'Usuarios', icon: <FaUsers /> },
    { id: 'plans', label: 'Configurar planes', icon: <FaCog /> },
  ];

  if (loading) return (
    <div className="superadmin-loading">
      <div className="loading-spinner"></div>
      <p>Cargando panel...</p>
    </div>
  );

  return (
    <div className="superadmin-dashboard-v2">
      {message && (
        <div className={`toast-message ${message.type}`}>
          {message.type === 'success' ? <FaCheckCircle /> : <FaTimesCircle />}
          {message.text}
        </div>
      )}

      {/* Sidebar */}
      <aside className={`superadmin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h2>Super Admin</h2>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`sidebar-nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={handleLogout}>
            <FaSignOutAlt /> {!sidebarCollapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="superadmin-main-content">
        {activeTab === 'dashboard' && stats && (
          <div className="dashboard-kpis">
            <h2>Resumen global</h2>
            <div className="kpi-grid">
              <div className="kpi-card"><FaStore /><div><strong>{stats.totalStores}</strong><p>Tiendas</p></div></div>
              <div className="kpi-card"><FaBox /><div><strong>{stats.totalProducts}</strong><p>Productos</p></div></div>
              <div className="kpi-card"><FaShoppingCart /><div><strong>{stats.totalSales}</strong><p>Ventas</p></div></div>
              <div className="kpi-card"><FaMoneyBillWave /><div><strong>${stats.totalRevenue.toFixed(2)}</strong><p>Ingresos</p></div></div>
              <div className="kpi-card free"><FaUsers /><div><strong>{stats.freeUsers}</strong><p>Gratis</p></div></div>
              <div className="kpi-card pro"><FaUsers /><div><strong>{stats.proUsers}</strong><p>Pro</p></div></div>
              <div className="kpi-card business"><FaUsers /><div><strong>{stats.businessUsers}</strong><p>Business</p></div></div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <>
            <div className="superadmin-controls">
              <div className="search-box">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Buscar por email, tienda o slug..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="stats">Total: {filteredUsers.length} tienda(s)</div>
            </div>

            <div className="table-container">
              <table className="users-table">
                <thead>
                  <tr><th>Email</th><th>Tienda</th><th>Slug</th><th>Plan</th><th>Estado</th><th>Inicio</th><th>Fin</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.uid}>
                      <td>{user.email}</td>
                      <td>{user.storeName || '-'}</td>
                      <td>
                        <div className="slug-cell">
                          <span>{user.slug || '-'}</span>
                          {user.slug && <button className="btn-icon" onClick={() => copyStoreLink(user.slug)}><FaCopy /></button>}
                        </div>
                      </td>
                      <td>
                        <select value={user.plan || 'free'} onChange={e => handlePlanChange(user.uid, e.target.value)} className="plan-select">
                          <option value="free">Gratis</option>
                          <option value="pro">Pro</option>
                          <option value="business">Business</option>
                        </select>
                      </td>
                      <td>
                        <span className={`status-badge ${user.status || 'active'}`}>
                          {user.status === 'cancelled' ? 'Cancelado' : user.status === 'expired' ? 'Expirado' : 'Activo'}
                        </span>
                      </td>
                      <td>{user.planStartDate ? new Date(user.planStartDate).toLocaleDateString() : '-'}</td>
                      <td>{user.planEndDate ? new Date(user.planEndDate).toLocaleDateString() : '-'}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-action" onClick={() => handleViewStore(user)}><FaStore /> Ver</button>
                          {user.plan !== 'free' && (
                            <>
                              <button className="btn-action renew" onClick={() => handleRenew(user.uid, 1)}>+1m</button>
                              <button className="btn-action renew" onClick={() => handleRenew(user.uid, 3)}>+3m</button>
                              <button className="btn-action custom-date" onClick={() => { setEditingUser(user.uid); setCustomDate(''); }}><FaCalendarAlt /> Fecha</button>
                              <button className="btn-action cancel" onClick={() => handleCancel(user.uid)}><FaTrash /> Cancelar</button>
                            </>
                          )}
                        </div>
                        {editingUser === user.uid && (
                          <div className="custom-date-picker">
                            <input type="date" value={customDate} onChange={e => setCustomDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                            <button className="btn-apply" onClick={() => handleSetCustomEndDate(user.uid)}>Aplicar</button>
                            <button className="btn-close" onClick={() => setEditingUser(null)}>Cancelar</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'plans' && <PlanManager />}

        {/* Modal de detalle de tienda */}
        {selectedStore && (
          <div className="modal-backdrop" onClick={() => setSelectedStore(null)}>
            <div className="modal-content store-modal" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setSelectedStore(null)}>×</button>
              <h2>{selectedStore.storeName || selectedStore.email}</h2>
              <p>Plan: {selectedStore.plan === 'free' ? 'Gratis' : selectedStore.plan === 'pro' ? 'Pro' : 'Business'}</p>
              {storeLoading ? (
                <p>Cargando datos...</p>
              ) : (
                <>
                  <h3>Productos ({storeProducts.length})</h3>
                  <div className="store-products-grid">
                    {storeProducts.slice(0, 10).map(p => (
                      <div key={p.id} className="store-product-card">
                        <strong>{p.name}</strong>
                        <span>Stock: {p.colors?.reduce((s, c) => s + (c.stock || 0), 0) || 0}</span>
                      </div>
                    ))}
                  </div>
                  <h3>Ventas ({storeSales.length})</h3>
                  <p>Total: ${storeSales.reduce((s, sale) => s + (sale.total || 0), 0).toFixed(2)}</p>
                  {storeShipping && (
                    <>
                      <h3>Envíos</h3>
                      <p>{storeShipping.enabled ? 'Activo' : 'Inactivo'}</p>
                      {storeShipping.enabled && <p>Envío gratis desde: ${storeShipping.freeFrom}</p>}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}