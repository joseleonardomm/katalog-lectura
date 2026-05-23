import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  logout,
  getConfig,
  getSocialLinks,
  getLocation,
  checkAndUpdatePlanStatus,
  isSuperAdmin,
  getPlansConfig,
} from '../../api';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import ProductsManager from './ProductsManager';
import SlidesManager from './SlidesManager';
import CategoriesManager from './CategoriesManager';
import GeneralSettings from './GeneralSettings';
import AppearanceSettings from './AppearanceSettings';
import SocialLinks from './SocialLinks';
import LocationSettings from './LocationSettings';
import FaqManager from './FaqManager';
import ContentCreator from './ContentCreator';
import OrderFormManager from './OrderFormManager';
import ShippingManager from './ShippingManager';
import InventoryManager from './InventoryManager';
import PlanModal from './PlanModal';
import {
  FaBox,
  FaImages,
  FaTags,
  FaCog,
  FaPalette,
  FaShareAlt,
  FaMapMarkerAlt,
  FaRobot,
  FaCamera,
  FaClipboardList,
  FaTruck,
  FaBoxOpen,
  FaSignOutAlt,
  FaCrown,
  FaLink,
  FaCopy,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';
import './AdminDashboard.css';

const LockedFeature = ({ feature, icon, onUpgrade }) => (
  <div className="locked-feature">
    <div className="locked-icon">🔒</div>
    <h2>
      {icon} {feature}
    </h2>
    <p>Esta herramienta no está disponible en tu plan actual.</p>
    <p>Mejora tu plan para desbloquearla y aprovecharla al máximo.</p>
    <button className="btn-upgrade" onClick={onUpgrade}>
      Ver planes disponibles
    </button>
  </div>
);

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('products');
  const [config, setConfig] = useState(null);
  const [social, setSocial] = useState(null);
  const [location, setLocation] = useState(null);
  const [storeSlug, setStoreSlug] = useState('');
  const [currentPlan, setCurrentPlan] = useState(null);
  const [planStartDate, setPlanStartDate] = useState(null);
  const [planEndDate, setPlanEndDate] = useState(null);
  const [planStatus, setPlanStatus] = useState('active');
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [isSuper, setIsSuper] = useState(false);
  const [planFeatures, setPlanFeatures] = useState({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  const loadData = async () => {
    const [cfg, soc, loc] = await Promise.all([getConfig(), getSocialLinks(), getLocation()]);
    setConfig(cfg);
    setSocial(soc);
    setLocation(loc);
  };

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const unsub = onSnapshot(
      doc(db, 'users', userId),
      async (userDoc) => {
        if (userDoc.exists()) {
          const data = userDoc.data();
          setStoreSlug(data.slug || '');
          setCurrentPlan(data.plan || 'free');
          setPlanStartDate(data.planStartDate || null);
          setPlanEndDate(data.planEndDate || null);
          setPlanStatus(data.status || 'active');
          setIsSuper(data.isSuperAdmin === true);

          const plansConfig = await getPlansConfig();
          setPlanFeatures(plansConfig[data.plan || 'free']?.features || {});
        }
      },
      (error) => {
        console.error('Error al escuchar datos del usuario:', error);
      }
    );

    loadData();

    const checkExpiration = async () => {
      const result = await checkAndUpdatePlanStatus();
      if (result?.expired) {
        alert(
          `Tu plan ${result.previousPlan} ha expirado. Has sido degradado al plan Gratis. Contacta a ventas para renovar.`
        );
      }
    };
    checkExpiration();

    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const storeLink = `${window.location.origin}/tienda/${storeSlug}`;
  const copyStoreLink = () => {
    navigator.clipboard.writeText(storeLink);
    alert('Enlace de tu tienda copiado al portapapeles');
  };

  if (!config)
    return (
      <div className="admin-dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Cargando panel de control...</p>
      </div>
    );

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const planName =
    currentPlan === 'free'
      ? 'Gratis'
      : currentPlan === 'pro'
      ? 'Pro'
      : currentPlan === 'business'
      ? 'Business'
      : 'Gratis';

  const isFeatureEnabled = (feature) => planFeatures[feature] !== false;

  const navItems = [
    { id: 'products', label: 'Productos', icon: <FaBox /> },
    { id: 'slides', label: 'Slider', icon: <FaImages /> },
    { id: 'categories', label: 'Categorías', icon: <FaTags /> },
    { id: 'appearance', label: 'Apariencia', icon: <FaPalette /> },
    { id: 'general', label: 'Configuración', icon: <FaCog /> },
    { id: 'social', label: 'Redes Sociales', icon: <FaShareAlt /> },
    { id: 'location', label: 'Ubicación', icon: <FaMapMarkerAlt /> },
    { id: 'inventory', label: 'Inventario', icon: <FaBoxOpen /> },
    { id: 'shipping', label: 'Envíos', icon: <FaTruck /> },
    { id: 'faq', label: 'Chatbot', icon: <FaRobot />, locked: !isFeatureEnabled('chatbot') },
    { id: 'studio', label: 'Estudio de contenido', icon: <FaCamera />, locked: !isFeatureEnabled('studio') },
    { id: 'orderform', label: 'Formulario de pedido', icon: <FaClipboardList /> },
  ];

  return (
    <div className="admin-dashboard-v2">
      <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            {config.logoUrl ? (
              <img src={config.logoUrl} alt="Logo" />
            ) : (
              <h2>{config.siteName || 'Katalog'}</h2>
            )}
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            {sidebarCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-nav-item ${activeTab === item.id ? 'active' : ''} ${item.locked ? 'locked' : ''}`}
              onClick={() => setActiveTab(item.id)}
              title={item.locked ? 'No disponible en tu plan' : item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              {!sidebarCollapsed && (
                <span className="nav-label">
                  {item.label}
                  {item.locked && <span className="lock-badge">🔒</span>}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          {!sidebarCollapsed && (
            <div className="sidebar-plan-info">
              <div className="plan-badge" onClick={() => setShowPlanModal(true)}>
                <FaCrown className="plan-crown" />
                <div>
                  <span className="plan-name">{planName}</span>
                  {currentPlan !== 'free' && planStatus === 'active' && (
                    <span className="plan-date">
                      Vence: {formatDate(planEndDate)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {!sidebarCollapsed && storeSlug && (
            <div className="sidebar-store-link">
              <FaLink />
              <span className="store-url">{storeLink}</span>
              <button onClick={copyStoreLink} title="Copiar enlace">
                <FaCopy />
              </button>
            </div>
          )}

          {isSuper && (
            <button
              className="sidebar-super-btn"
              onClick={() => navigate('/superadmin/dashboard')}
            >
              Super Admin
            </button>
          )}

          <button className="sidebar-logout" onClick={handleLogout}>
            <FaSignOutAlt />
            {!sidebarCollapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      <main className="admin-main-content">
        {activeTab === 'products' && <ProductsManager />}
        {activeTab === 'slides' && <SlidesManager />}
        {activeTab === 'categories' && <CategoriesManager />}
        {activeTab === 'appearance' && <AppearanceSettings config={config} onUpdate={loadData} />}
        {activeTab === 'general' && <GeneralSettings config={config} onUpdate={loadData} />}
        {activeTab === 'social' && <SocialLinks social={social} onUpdate={loadData} />}
        {activeTab === 'location' && <LocationSettings location={location} onUpdate={loadData} />}
        {activeTab === 'inventory' && <InventoryManager />}
        {activeTab === 'shipping' && <ShippingManager />}
        {activeTab === 'faq' &&
          (isFeatureEnabled('chatbot') ? (
            <FaqManager />
          ) : (
            <LockedFeature
              feature="Chatbot"
              icon={<FaRobot />}
              onUpgrade={() => setShowPlanModal(true)}
            />
          ))}
        {activeTab === 'studio' &&
          (isFeatureEnabled('studio') ? (
            <ContentCreator />
          ) : (
            <LockedFeature
              feature="Estudio de contenido"
              icon={<FaCamera />}
              onUpgrade={() => setShowPlanModal(true)}
            />
          ))}
        {activeTab === 'orderform' && <OrderFormManager />}
      </main>

      <PlanModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        currentPlan={currentPlan}
      />
    </div>
  );
}