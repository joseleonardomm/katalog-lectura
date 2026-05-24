import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  logout, getConfig, getSocialLinks, getLocation,
  checkAndUpdatePlanStatus, isSuperAdmin, getPlansConfig,
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
import BusinessInfoManager from './BusinessInfoManager';
import QuotesManager from './Quotes/QuotesManager';
import PaymentMethodsManager from './PaymentMethods/PaymentMethodsManager';
import {
  FaBox, FaImages, FaTags, FaCog, FaPalette, FaShareAlt,
  FaMapMarkerAlt, FaRobot, FaCamera, FaClipboardList, FaTruck,
  FaBoxOpen, FaSignOutAlt, FaCrown, FaLink, FaCopy,
  FaChevronLeft, FaChevronRight, FaInfoCircle, FaFileInvoiceDollar,
  FaMoneyBillWave, FaBars
} from 'react-icons/fa';
import './AdminDashboard.css';

const LockedFeature = ({ feature, icon, onUpgrade }) => (
  <div className="locked-feature">
    <div className="locked-icon">{icon}</div>
    <h2>{icon} {feature}</h2>
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Toast interno
  const [toast, setToast] = useState(null);
  const showMessage = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async () => {
    const [cfg, soc, loc] = await Promise.all([getConfig(), getSocialLinks(), getLocation()]);
    setConfig(cfg);
    setSocial(soc);
    setLocation(loc);
  };

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const unsub = onSnapshot(doc(db, 'users', userId), async (userDoc) => {
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
    }, (error) => {
      console.error('Error al escuchar datos del usuario:', error);
    });

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

  if (!config) return (
    <div className="admin-dashboard-loading">
      <div className="loading-spinner"></div>
      Cargando panel de control...
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
    currentPlan === 'free' ? 'Gratis' :
    currentPlan === 'pro' ? 'Pro' :
    currentPlan === 'business' ? 'Business' :
    'Gratis';

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
    { id: 'info', label: 'Información', icon: <FaInfoCircle /> },
    { id: 'quotes', label: 'Cotizaciones', icon: <FaFileInvoiceDollar /> },
    { id: 'payments', label: 'Pagos', icon: <FaMoneyBillWave /> },
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="admin-dashboard-v2">
      {mobileMenuOpen && <div className="sidebar-overlay" onClick={closeMobileMenu}></div>}

      <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-sidebar-open' : ''}`}>
        <div className="sidebar-header">
          {config.logoUrl ? (
            <div className="sidebar-logo">
              <img src={config.logoUrl} alt="Logo" />
            </div>
          ) : (
            <div className="sidebar-logo">
              <h2>{config.siteName || 'Katalog'}</h2>
            </div>
          )}
          <button
            className="sidebar-toggle desktop-only"
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
              onClick={() => { setActiveTab(item.id); closeMobileMenu(); }}
              title={item.locked ? 'No disponible en tu plan' : item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              {(!sidebarCollapsed || mobileMenuOpen) && (
                <span className="nav-label">
                  {item.label}
                  {item.locked && <span className="lock-badge">🔒</span>}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          {(!sidebarCollapsed || mobileMenuOpen) && (
            <>
              <div className="sidebar-plan-info">
                <div className="plan-badge" onClick={() => { setShowPlanModal(true); closeMobileMenu(); }}>
                  <FaCrown className="plan-crown" />
                  <div>
                    <span className="plan-name">{planName}</span>
                    {currentPlan !== 'free' && planStatus === 'active' && (
                      <span className="plan-date"> Vence: {formatDate(planEndDate)}</span>
                    )}
                  </div>
                </div>
              </div>

              {storeSlug && (
                <div className="sidebar-store-link">
                  <FaLink />
                  <span className="store-url">{storeLink}</span>
                  <button onClick={copyStoreLink} title="Copiar enlace"><FaCopy /></button>
                </div>
              )}

              {isSuper && (
                <button className="sidebar-super-btn" onClick={() => { navigate('/superadmin/dashboard'); closeMobileMenu(); }}>
                  Super Admin
                </button>
              )}

              <button className="sidebar-logout" onClick={handleLogout}>
                <FaSignOutAlt /> Cerrar sesión
              </button>
            </>
          )}
        </div>
      </aside>

      <main className="admin-main-content">
        <header className="admin-topbar">
          <button className="sidebar-toggle mobile-hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <FaBars />
          </button>
        </header>

        <div className="admin-content">
          {activeTab === 'products' && <ProductsManager showMessage={showMessage} />}
          {activeTab === 'slides' && <SlidesManager showMessage={showMessage} />}
          {activeTab === 'categories' && <CategoriesManager showMessage={showMessage} />}
          {activeTab === 'appearance' && <AppearanceSettings showMessage={showMessage} />}
          {activeTab === 'general' && <GeneralSettings showMessage={showMessage} />}
          {activeTab === 'social' && <SocialLinks showMessage={showMessage} />}
          {activeTab === 'location' && <LocationSettings showMessage={showMessage} />}
          {activeTab === 'inventory' && <InventoryManager showMessage={showMessage} />}
          {activeTab === 'shipping' && <ShippingManager showMessage={showMessage} />}
          {activeTab === 'faq' && (
            isFeatureEnabled('chatbot') ? (
              <FaqManager showMessage={showMessage} />
            ) : (
              <LockedFeature feature="Chatbot" icon={<FaRobot />} onUpgrade={() => setShowPlanModal(true)} />
            )
          )}
          {activeTab === 'studio' && (
            isFeatureEnabled('studio') ? (
              <ContentCreator showMessage={showMessage} />
            ) : (
              <LockedFeature feature="Estudio de contenido" icon={<FaCamera />} onUpgrade={() => setShowPlanModal(true)} />
            )
          )}
          {activeTab === 'orderform' && <OrderFormManager showMessage={showMessage} />}
          {activeTab === 'info' && <BusinessInfoManager showMessage={showMessage} />}
          {activeTab === 'quotes' && <QuotesManager showMessage={showMessage} />}
          {activeTab === 'payments' && <PaymentMethodsManager showMessage={showMessage} />}
        </div>
      </main>

      {showPlanModal && (
        <PlanModal onClose={() => setShowPlanModal(false)} currentPlan={currentPlan} />
      )}

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}