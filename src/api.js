import { 
  collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { db, storage, auth } from './firebase';

// ========== UTILIDADES ==========
const getUserId = () => localStorage.getItem('userId');

function removeUndefined(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => removeUndefined(item));
  }
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = removeUndefined(value);
    }
  }
  return cleaned;
}

// ========== SLUG ==========
const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

const makeSlugUnique = async (baseSlug) => {
  let slug = baseSlug;
  let counter = 1;
  const slugDoc = await getDoc(doc(db, 'slugs', slug));
  while (slugDoc.exists()) {
    slug = `${baseSlug}-${counter}`;
    counter++;
    const exists = await getDoc(doc(db, 'slugs', slug));
    if (!exists.exists()) break;
  }
  return slug;
};

// ========== PRODUCTOS ==========
export const getProducts = async () => {
  const userId = getUserId();
  if (!userId) return [];
  const snapshot = await getDocs(collection(db, `users/${userId}/products`));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createProduct = async (product) => {
  const userId = getUserId();
  if (!userId) throw new Error('No userId');
  const id = Date.now().toString();
  const cleanProduct = removeUndefined(product);
  const newProduct = { id, ...cleanProduct };
  await setDoc(doc(db, `users/${userId}/products`, id), newProduct);
  return newProduct;
};

export const updateProduct = async (id, product) => {
  const userId = getUserId();
  if (!userId) throw new Error('No userId');
  const cleanProduct = removeUndefined(product);
  await updateDoc(doc(db, `users/${userId}/products`, id), cleanProduct);
  return { id, ...cleanProduct };
};

export const deleteProduct = async (id) => {
  const userId = getUserId();
  if (!userId) throw new Error('No userId');
  await deleteDoc(doc(db, `users/${userId}/products`, id));
  return { success: true };
};

// ========== CONFIGURACIÓN ==========
export const getConfig = async () => {
  const userId = getUserId();
  if (!userId) return null;
  const docRef = doc(db, `users/${userId}/config`, 'settings');
  const snap = await getDoc(docRef);
  if (!snap.exists()) {
    const defaultConfig = {
      siteName: 'Mi Tienda',
      primaryColor: '#ff8c42',
      secondaryColor: '#e06e1a',
      logoUrl: '',
      whatsappNumber: '',
      whatsappMessage: 'Hola! Me interesa este producto',
      footerText: '© 2025 - Mi Tienda',
      heroSlides: [],
      socialLinks: {},
      location: {},
      baseCurrency: 'USD',
      showBs: false,
      backupExchangeRate: 7.2,
      backupEurRate: 7.8,
      headerTextColor: '#1e1e2a',
      headerBgColor: '#ffffff',
      footerTextColor: '#dddddd',
      footerBgColor: '#1e1e2a',
      sectionTitleColor: '#1e1e2a',
      productTextColor: '#2d3748',
      priceColor: '#ff8c42',
      buttonPrimaryBg: '#ff8c42',
      buttonPrimaryText: '#ffffff',
      buttonSecondaryBg: '#edf2f7',
      buttonSecondaryText: '#4a5568'
    };
    await setDoc(docRef, defaultConfig);
    return defaultConfig;
  }
  return snap.data();
};

export const updateConfig = async (config) => {
  const userId = getUserId();
  if (!userId) throw new Error('No userId');
  await setDoc(doc(db, `users/${userId}/config`, 'settings'), config, { merge: true });
  return config;
};

// ========== SLIDES ==========
export const getSlides = async () => {
  const config = await getConfig();
  return config?.heroSlides || [];
};

export const createSlide = async (slide) => {
  const config = await getConfig();
  const newSlide = { id: Date.now(), ...slide };
  const slides = [...(config.heroSlides || []), newSlide];
  await updateConfig({ ...config, heroSlides: slides });
  return newSlide;
};

export const updateSlide = async (id, slide) => {
  const config = await getConfig();
  const slides = (config.heroSlides || []).map(s => s.id == id ? { ...s, ...slide } : s);
  await updateConfig({ ...config, heroSlides: slides });
  return { id, ...slide };
};

export const deleteSlide = async (id) => {
  const config = await getConfig();
  const slides = (config.heroSlides || []).filter(s => s.id != id);
  await updateConfig({ ...config, heroSlides: slides });
  return { success: true };
};

// ========== REDES SOCIALES Y UBICACIÓN ==========
export const getSocialLinks = async () => {
  const config = await getConfig();
  return config.socialLinks || {};
};

export const updateSocialLinks = async (links) => {
  const config = await getConfig();
  config.socialLinks = links;
  await updateConfig(config);
  return links;
};

export const getLocation = async () => {
  const config = await getConfig();
  return config.location || {};
};

export const updateLocation = async (location) => {
  const config = await getConfig();
  config.location = location;
  await updateConfig(config);
  return location;
};

// ========== SUBIR IMAGEN ==========
export const uploadImage = async (file) => {
  const userId = getUserId();
  if (!userId) throw new Error('No userId');
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const storageRef = ref(storage, `users/${userId}/images/${fileName}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return { url };
};

// ========== AUTENTICACIÓN ==========
export const register = async (email, password, storeName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    let baseSlug = generateSlug(storeName || email.split('@')[0]);
    const slug = await makeSlugUnique(baseSlug);
    await setDoc(doc(db, 'users', uid), {
      email,
      storeName: storeName || email.split('@')[0],
      slug,
      createdAt: new Date().toISOString(),
      plan: 'free',
      status: 'active',
      planStartDate: new Date().toISOString(),
      planEndDate: null
    });
    await setDoc(doc(db, 'slugs', slug), { uid });
    const now = Date.now();
    const defaultConfig = {
      siteName: storeName || 'Mi Tienda',
      primaryColor: '#ff8c42',
      secondaryColor: '#e06e1a',
      logoUrl: '',
      whatsappNumber: '',
      whatsappMessage: 'Hola! Me interesa este producto',
      footerText: `© 2025 - ${storeName || 'Mi Tienda'}`,
      heroSlides: [
        {
          id: now,
          title: "Bienvenidos a nuestra tienda",
          subtitle: "Productos de calidad al mejor precio",
          imageDesktop: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1920&h=600&fit=crop",
          imageMobile: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=600&fit=crop",
          textPosition: "center-left"
        },
        {
          id: now + 1,
          title: "Nuevos productos",
          subtitle: "Descubre las últimas tendencias",
          imageDesktop: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&h=600&fit=crop",
          imageMobile: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=600&fit=crop",
          textPosition: "center"
        },
        {
          id: now + 2,
          title: "Envíos a todo el país",
          subtitle: "Recibe tu pedido en la puerta de tu casa",
          imageDesktop: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&h=600&fit=crop",
          imageMobile: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop",
          textPosition: "bottom-right"
        },
        {
          id: now + 3,
          title: "Ofertas especiales",
          subtitle: "Hasta 50% de descuento en productos seleccionados",
          imageDesktop: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1920&h=600&fit=crop",
          imageMobile: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800&h=600&fit=crop",
          textPosition: "top-right"
        },
        {
          id: now + 4,
          title: "Contáctanos",
          subtitle: "Estamos aquí para ayudarte. Escríbenos por WhatsApp",
          imageDesktop: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920&h=600&fit=crop",
          imageMobile: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop",
          textPosition: "bottom-left"
        }
      ],
      socialLinks: { instagram: '', facebook: '', twitter: '', youtube: '' },
      location: { address: '', mapEmbed: '', schedule: '', phone: '', email: email },
      baseCurrency: 'USD',
      showBs: false,
      backupExchangeRate: 7.2,
      backupEurRate: 7.8
    };
    await setDoc(doc(db, `users/${uid}/config`, 'settings'), defaultConfig);
    localStorage.setItem('userId', uid);
    return { success: true, uid, slug };
  } catch (error) {
    console.error('Error en registro:', error);
    throw error;
  }
};

export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    localStorage.setItem('userId', uid);
    await checkAndUpdatePlanStatus(uid);
    return { success: true, uid };
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};

export const logout = async () => {
  await signOut(auth);
  localStorage.removeItem('userId');
};

export const verifyAdmin = () => {
  const userId = localStorage.getItem('userId');
  return { isAdmin: !!userId };
};

// ========== PLANES Y EXPIRACIÓN ==========
export const checkAndUpdatePlanStatus = async (uid = null) => {
  const userId = uid || getUserId();
  if (!userId) return null;
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) return null;
  const userData = userDoc.data();
  const plan = userData.plan || 'free';
  const status = userData.status || 'active';
  const planEndDate = userData.planEndDate ? new Date(userData.planEndDate) : null;
  
  if (plan !== 'free' && status === 'active' && planEndDate && planEndDate < new Date()) {
    await updateDoc(doc(db, 'users', userId), {
      plan: 'free',
      status: 'expired',
      planEndDate: null
    });
    return { expired: true, previousPlan: plan };
  }
  return { expired: false };
};

// ========== TIENDA PÚBLICA ==========
export const getUserIdBySlug = async (slug) => {
  const slugDoc = await getDoc(doc(db, 'slugs', slug));
  if (!slugDoc.exists()) return null;
  return slugDoc.data().uid;
};

export const getPublicStoreData = async (slug) => {
  const uid = await getUserIdBySlug(slug);
  if (!uid) return null;
  const [productsSnap, configSnap] = await Promise.all([
    getDocs(collection(db, `users/${uid}/products`)),
    getDoc(doc(db, `users/${uid}/config`, 'settings'))
  ]);
  const products = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const config = configSnap.exists() ? configSnap.data() : null;
  return { products, config, uid };
};

export const getPlanByUid = async (uid) => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (!userDoc.exists()) return 'free';
  return userDoc.data().plan || 'free';
};

// ========== CATEGORÍAS ==========
export const getCategories = async () => {
  const userId = getUserId();
  if (!userId) return [];
  const snapshot = await getDocs(collection(db, `users/${userId}/categories`));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createCategory = async (category) => {
  const userId = getUserId();
  if (!userId) throw new Error('No userId');
  const id = Date.now().toString();
  const newCategory = { id, ...category, createdAt: new Date().toISOString() };
  await setDoc(doc(db, `users/${userId}/categories`, id), newCategory);
  return newCategory;
};

export const updateCategory = async (id, category) => {
  const userId = getUserId();
  if (!userId) throw new Error('No userId');
  await updateDoc(doc(db, `users/${userId}/categories`, id), category);
  return { id, ...category };
};

export const deleteCategory = async (id) => {
  const userId = getUserId();
  if (!userId) throw new Error('No userId');
  await deleteDoc(doc(db, `users/${userId}/categories`, id));
  return { success: true };
};

// ========== FAQ (CHATBOT) ==========
export const getFaqs = async () => {
  const userId = getUserId();
  if (!userId) return [];
  const config = await getConfig();
  return config?.faq || [];
};

export const updateFaqs = async (faqs) => {
  const userId = getUserId();
  if (!userId) throw new Error('No userId');
  const configRef = doc(db, `users/${userId}/config`, 'settings');
  const configSnap = await getDoc(configRef);
  if (configSnap.exists()) {
    await updateDoc(configRef, { faq: faqs });
  } else {
    await setDoc(configRef, { faq: faqs });
  }
  return faqs;
};

// ========== CONFIGURACIÓN DE PLANES (SUPER ADMIN) ==========
export const getPlansConfig = async () => {
  const docRef = doc(db, 'config', 'plans');
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return snap.data();
  } else {
    const defaultPlans = {
      free: {
        productLimit: 15,
        features: { chatbot: true, studio: false, fullCatalog: true },
      },
      pro: {
        productLimit: 150,
        features: { chatbot: true, studio: true, fullCatalog: true },
      },
      business: {
        productLimit: null,
        features: { chatbot: true, studio: true, fullCatalog: true },
      },
    };
    await setDoc(docRef, defaultPlans);
    return defaultPlans;
  }
};

export const updatePlansConfig = async (plansConfig) => {
  await setDoc(doc(db, 'config', 'plans'), plansConfig, { merge: true });
  return plansConfig;
};

// ========== FORMULARIO DE PEDIDO ==========
export const getOrderFormConfig = async () => {
  const userId = getUserId();
  if (!userId) return { enabled: false, fields: [] };
  const config = await getConfig();
  return config?.orderForm || { enabled: false, fields: [] };
};

export const updateOrderFormConfig = async (orderForm) => {
  const userId = getUserId();
  if (!userId) throw new Error('No userId');
  const configRef = doc(db, `users/${userId}/config`, 'settings');
  const configSnap = await getDoc(configRef);
  if (configSnap.exists()) {
    await updateDoc(configRef, { orderForm });
  } else {
    await setDoc(configRef, { orderForm });
  }
  return orderForm;
};

// ========== INVENTARIO: VENTAS ==========
export const getSales = async () => {
  const userId = getUserId();
  if (!userId) return [];
  const snap = await getDocs(collection(db, `users/${userId}/sales`));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const createSale = async (sale) => {
  const userId = getUserId();
  if (!userId) throw new Error('No userId');
  const id = Date.now().toString();
  const newSale = { id, ...sale, date: sale.date || new Date().toISOString() };
  await setDoc(doc(db, `users/${userId}/sales`, id), newSale);
  // Descontar stock
  for (const item of sale.items) {
    const prodRef = doc(db, `users/${userId}/products`, item.productId);
    const prodSnap = await getDoc(prodRef);
    if (prodSnap.exists()) {
      const prod = prodSnap.data();
      const colors = [...prod.colors];
      if (colors[item.colorIndex]) {
        colors[item.colorIndex].stock = Math.max(0, (colors[item.colorIndex].stock || 0) - item.quantity);
        await updateDoc(prodRef, { colors });
      }
    }
  }
  // Crear movimiento de caja
  await createTransaction({ type: 'venta', amount: sale.total, description: `Venta #${id}`, relatedSaleId: id });
  return newSale;
};

// ========== INVENTARIO: COMPRAS ==========
export const getPurchases = async () => {
  const userId = getUserId();
  if (!userId) return [];
  const snap = await getDocs(collection(db, `users/${userId}/purchases`));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const createPurchase = async (purchase) => {
  const userId = getUserId();
  if (!userId) throw new Error('No userId');
  const id = Date.now().toString();
  const newPurchase = { id, ...purchase, date: purchase.date || new Date().toISOString() };
  await setDoc(doc(db, `users/${userId}/purchases`, id), newPurchase);
  // Incrementar stock
  for (const item of purchase.items) {
    const prodRef = doc(db, `users/${userId}/products`, item.productId);
    const prodSnap = await getDoc(prodRef);
    if (prodSnap.exists()) {
      const prod = prodSnap.data();
      const colors = [...prod.colors];
      if (colors[item.colorIndex]) {
        colors[item.colorIndex].stock = (colors[item.colorIndex].stock || 0) + item.quantity;
        await updateDoc(prodRef, { colors });
      }
    }
  }
  // Crear movimiento de caja
  await createTransaction({ type: 'compra_proveedor', amount: purchase.total, description: `Compra #${id}`, relatedPurchaseId: id });
  return newPurchase;
};

// ========== INVENTARIO: MOVIMIENTOS DE CAJA ==========
export const getTransactions = async () => {
  const userId = getUserId();
  if (!userId) return [];
  const snap = await getDocs(collection(db, `users/${userId}/transactions`));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const createTransaction = async (trans) => {
  const userId = getUserId();
  if (!userId) return;
  const id = Date.now().toString();
  await setDoc(doc(db, `users/${userId}/transactions`, id), { id, ...trans, date: trans.date || new Date().toISOString() });
};

// ========== INVENTARIO: PROVEEDORES ==========
export const getProviders = async () => {
  const userId = getUserId();
  if (!userId) return [];
  const snap = await getDocs(collection(db, `users/${userId}/providers`));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const createProvider = async (provider) => {
  const userId = getUserId();
  const id = Date.now().toString();
  await setDoc(doc(db, `users/${userId}/providers`, id), { id, ...provider });
  return { id, ...provider };
};

export const updateProvider = async (id, provider) => {
  const userId = getUserId();
  await updateDoc(doc(db, `users/${userId}/providers`, id), provider);
  return { id, ...provider };
};

export const deleteProvider = async (id) => {
  const userId = getUserId();
  await deleteDoc(doc(db, `users/${userId}/providers`, id));
};

// ========== PLANES Y USUARIOS (SUPER ADMIN) ==========
export const getAllUsers = async () => {
  const snapshot = await getDocs(collection(db, 'users'));
  return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
};

export const updateUserPlan = async (uid, planData) => {
  await updateDoc(doc(db, 'users', uid), planData);
  return { success: true };
};

export const getCurrentUserPlan = async () => {
  const userId = getUserId();
  if (!userId) return 'free';
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) return 'free';
  const plan = userDoc.data().plan || 'free';
  const status = userDoc.data().status || 'active';
  if (status !== 'active') return 'free';
  return plan;
};

export const getUserProductsCount = async () => {
  const userId = getUserId();
  if (!userId) return 0;
  const snapshot = await getDocs(collection(db, `users/${userId}/products`));
  return snapshot.size;
};

export const isSuperAdmin = async () => {
  const userId = getUserId();
  if (!userId) return false;
  const userDoc = await getDoc(doc(db, 'users', userId));
  return userDoc.exists() && userDoc.data().isSuperAdmin === true;
};

export const renewUserPlan = async (uid, months = 1) => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  const currentPlan = userDoc.data().plan;
  if (currentPlan === 'free') throw new Error('No se puede renovar plan gratuito');
  
  const now = new Date();
  let newEndDate = new Date();
  newEndDate.setMonth(now.getMonth() + months);
  
  await updateDoc(doc(db, 'users', uid), {
    status: 'active',
    planStartDate: now.toISOString(),
    planEndDate: newEndDate.toISOString()
  });
  return { success: true };
};

export const cancelUserPlan = async (uid) => {
  await updateDoc(doc(db, 'users', uid), {
    status: 'cancelled',
    planEndDate: null,
    plan: 'free'
  });
  return { success: true };
};

// ========== GASTOS FIJOS ==========
export const getFixedExpenses = async () => {
  const userId = getUserId();
  if (!userId) return [];
  const snap = await getDocs(collection(db, `users/${userId}/fixedExpenses`));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const createFixedExpense = async (expense) => {
  const userId = getUserId();
  const id = Date.now().toString();
  await setDoc(doc(db, `users/${userId}/fixedExpenses`, id), { id, ...expense });
  return { id, ...expense };
};

export const updateFixedExpense = async (id, expense) => {
  const userId = getUserId();
  await updateDoc(doc(db, `users/${userId}/fixedExpenses`, id), expense);
  return { id, ...expense };
};

export const deleteFixedExpense = async (id) => {
  const userId = getUserId();
  await deleteDoc(doc(db, `users/${userId}/fixedExpenses`, id));
};

// ========== SUPER ADMIN – DATOS DE CUALQUIER TIENDA ==========
export const getUserProducts = async (uid) => {
  const snap = await getDocs(collection(db, `users/${uid}/products`));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getUserSales = async (uid) => {
  const snap = await getDocs(collection(db, `users/${uid}/sales`));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getUserTransactions = async (uid) => {
  const snap = await getDocs(collection(db, `users/${uid}/transactions`));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getUserShipping = async (uid) => {
  const configSnap = await getDoc(doc(db, `users/${uid}/config`, 'settings'));
  if (!configSnap.exists()) return null;
  return configSnap.data()?.shipping || null;
};

export const getUserPlanInfo = async (uid) => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (!userDoc.exists()) return null;
  const data = userDoc.data();
  return {
    plan: data.plan || 'free',
    status: data.status || 'active',
    planStartDate: data.planStartDate || null,
    planEndDate: data.planEndDate || null,
    storeName: data.storeName || '',
    email: data.email || '',
    slug: data.slug || '',
  };
};

export const getGlobalStats = async () => {
  const usersSnap = await getDocs(collection(db, 'users'));
  const users = usersSnap.docs.map(d => ({ uid: d.id, ...d.data() }));
  
  let totalProducts = 0;
  let totalSales = 0;
  let totalRevenue = 0;
  
  for (const user of users) {
    try {
      const prodsSnap = await getDocs(collection(db, `users/${user.uid}/products`));
      totalProducts += prodsSnap.size;
      
      const salesSnap = await getDocs(collection(db, `users/${user.uid}/sales`));
      const sales = salesSnap.docs.map(d => d.data());
      totalSales += sales.length;
      totalRevenue += sales.reduce((sum, s) => sum + (s.total || 0), 0);
    } catch (e) {
      // ignorar tiendas sin colecciones
    }
  }
  
  const freeUsers = users.filter(u => (u.plan || 'free') === 'free').length;
  const proUsers = users.filter(u => u.plan === 'pro').length;
  const businessUsers = users.filter(u => u.plan === 'business').length;
  const expiredUsers = users.filter(u => u.status === 'expired' || u.status === 'cancelled').length;
  
  return {
    totalStores: users.length,
    freeUsers,
    proUsers,
    businessUsers,
    expiredUsers,
    totalProducts,
    totalSales,
    totalRevenue,
  };
};