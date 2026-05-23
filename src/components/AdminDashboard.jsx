import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getConfig, getSocialLinks, getLocation, getCurrentUserPlan, checkAndUpdatePlanStatus, isSuperAdmin } from '../../api';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import ProductsManager from './ProductsManager';
import SlidesManager from './SlidesManager';
import CategoriesManager from './CategoriesManager';
import GeneralSettings from './GeneralSettings';
import SocialLinks from './SocialLinks';
import LocationSettings from './LocationSettings';
import PlanModal from './PlanModal';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('products');
  const [config, setConfig] = useState(null);
  const [social, setSocial] = useState(null);
  const [location, setLocation] = useState(null);
  const [storeSlug, setStoreSlug] = useState('');
  const [currentPlan, setCurrentPlan] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [isSuper, setIsSuper] = useState(false);
  const navigate = useNavigate();

  const loadData = async () => {
    const [cfg, soc, loc] = await Promise.all([getConfig(), getSocialLinks(), getLocation()]);
    setConfig(cfg);
    setSocial(soc);
    setLocation(loc);
  };

  useEffect(() => {
    const checkPlanAndLoad = async () => {
      const result = await checkAndUpdatePlanStatus();
      if (result?.expired) {
        alert(`Tu plan ${result.previousPlan} ha expirado. Has sido degradado al plan Gratis. Contacta a ventas para renovar.`);
      }
      const plan = await getCurrentUserPlan();
      setCurrentPlan(plan);
      const superAdmin = await isSuperAdmin();
      setIsSuper(superAdmin);
    };
    loadData();
    const fetchUserData = async () => {
      const userId = localStorage.getItem('userId');
      if (userId) {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) setStoreSlug(userDoc.data().slug);
      }
    };
    fetchUserData();
    checkPlanAndLoad();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const storeLink = `${window.location.origin}/tienda/${storeSlug}`;
  const copyStoreLink = () => {
    navigator.clipboard.writeText(storeLink);
    alert('Enlace de tu tienda copiado al portapapeles');
  };

  if (!config) return <div className="admin-dashboard" style={{ textAlign: 'center', padding: '40px' }}>Cargando panel...</div>;

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Panel de Control</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="plan-info" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span>Plan actual: <strong>{currentPlan === 'free' ? 'Gratis' : currentPlan === 'pro' ? 'Pro' : 'Business'}</strong></span>
            <button className="btn-view-plans" onClick={() => setShowPlanModal(true)} style={{ background: '#4caf50', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '20px', cursor: 'pointer' }}>Ver planes</button>
          </div>
          {storeSlug && (
            <>
              <span style={{ fontSize: '0.85rem', color: '#555' }}>🔗 {storeLink}</span>
              <button onClick={copyStoreLink} style={{ background: '#4caf50' }}>📋 Copiar enlace</button>
            </>
          )}
          {isSuper && (
            <button onClick={() => navigate('/superadmin/dashboard')} style={{ background: '#6c5ce7', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '20px', cursor: 'pointer' }}>Super Admin</button>
          )}
          <button onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </header>
      <div className="admin-tabs">
        <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>📦 Productos</button>
        <button className={activeTab === 'slides' ? 'active' : ''} onClick={() => setActiveTab('slides')}>🎠 Slider</button>
        <button className={activeTab === 'categories' ? 'active' : ''} onClick={() => setActiveTab('categories')}>📂 Categorías</button>
        <button className={activeTab === 'general' ? 'active' : ''} onClick={() => setActiveTab('general')}>⚙️ General</button>
        <button className={activeTab === 'social' ? 'active' : ''} onClick={() => setActiveTab('social')}>📱 Redes Sociales</button>
        <button className={activeTab === 'location' ? 'active' : ''} onClick={() => setActiveTab('location')}>📍 Ubicación</button>
      </div>
      <div className="admin-content">
        {activeTab === 'products' && <ProductsManager />}
        {activeTab === 'slides' && <SlidesManager />}
        {activeTab === 'categories' && <CategoriesManager />}
        {activeTab === 'general' && <GeneralSettings config={config} onUpdate={loadData} />}
        {activeTab === 'social' && <SocialLinks social={social} onUpdate={loadData} />}
        {activeTab === 'location' && <LocationSettings location={location} onUpdate={loadData} />}
      </div>
      <PlanModal isOpen={showPlanModal} onClose={() => setShowPlanModal(false)} currentPlan={currentPlan} />
    </div>
  );
}