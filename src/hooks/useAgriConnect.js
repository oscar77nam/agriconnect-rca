// src/hooks/useAgriConnect.js
import { useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API, { getUser as apiGetUser } from '../AgriConnectRCA';

const NAV_KEY  = 'agriconnect_last_screen';
const CART_KEY = 'agriconnect_cart';
const FAV_KEY  = 'agriconnect_favs';

function useAgriConnect() {
  // ------- état global -------
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [screenHistory, setScreenHistory] = useState([]);

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // ------- boot -------
  useEffect(() => {
    (async () => {
      try {
        const cachedUser = await apiGetUser();
        if (cachedUser) {
          setUser(cachedUser);
          setCurrentScreen('products'); // acheteur: arrive sur la liste produits
          await refetchProducts();
        } else {
          const last = await AsyncStorage.getItem(NAV_KEY);
          if (last) setCurrentScreen(last);
        }

        const rawCart = await AsyncStorage.getItem(CART_KEY);
        if (rawCart) setCart(JSON.parse(rawCart));

        const rawFavs = await AsyncStorage.getItem(FAV_KEY);
        if (rawFavs) setFavorites(JSON.parse(rawFavs));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

    // recherche locale (client side)
  const filteredProducts = useMemo(() => {
    const q = (searchTerm || '').trim().toLowerCase();
    if (!q) return products || [];
    return (products || []).filter((p) => {
      const fields = [
        p?.name, p?.title,
        p?.category_name, p?.category,
        p?.farmer_name, p?.farmer,
        p?.farmer_location, p?.location,
      ].filter(Boolean).map(String).map((s) => s.toLowerCase());
      return fields.some((f) => f.includes(q));
    });
  }, [products, searchTerm]);

  // ------- panier -------
  const persistCart = (next) => AsyncStorage.setItem(CART_KEY, JSON.stringify(next)).catch(() => {});

  const addToCart = (product, qty = 1) => {
    setCart((c) => {
      const i = c.findIndex((x) => x.product?.id === product.id);
      const next = [...c];
      if (i === -1) next.push({ product, quantity: qty });
      else next[i] = { ...next[i], quantity: next[i].quantity + qty };
      persistCart(next);
      return next;
    });
    setNotifications((n) => [{ id: String(Date.now()), text: `Ajouté: ${product?.name || 'Produit'}`, read: false }, ...n]);
  };

  const updateCartQuantity = (productId, q) => {
    setCart((c) => {
      const next = c.map((it) =>
        it.product?.id === productId ? { ...it, quantity: Math.max(1, Number(q) || 1) } : it
      );
      persistCart(next);
      return next;
    });
  };

  const removeFromCart = (productId) => {
    setCart((c) => {
      const next = c.filter((it) => it.product?.id !== productId);
      persistCart(next);
      return next;
    });
  };

  const clearCart = () => { setCart([]); persistCart([]); };

  const checkout = async () => {
    // Version AVANT CheckoutScreen: on simule la commande et on vide le panier
    clearCart();
    setNotifications((n) => [{ id: String(Date.now()), text: 'Commande passée avec succès', read: false }, ...n]);
  };

  const getUserOrders = async () => {
    try {
      const r = await API.getOrders();
      const arr = Array.isArray(r) ? r : (r?.data || []);
      setOrders(arr);
      return arr;
    } catch (e) {
      console.log('❌ getUserOrders:', e?.message);
      return [];
    }
  };

  // ------- auth -------
  const handleLogin = async ({ phone, password }) => {
    const res = await API.login({ phone, password });
    setUser(res?.user || null);
    setCurrentScreen('products');
    await refetchProducts();
    return res;
  };
  const handleRegister = async ({ name, phone, password, location, type }) => {
    const res = await API.register({ name, phone, password, location, type });
    setUser(res?.user || null);
    setCurrentScreen('products');
    await refetchProducts();
    return res;
  };
  const logout = async () => {
    await API.logout();
    setUser(null);
    setProducts([]);
    setCart([]);
    setFavorites([]);
    setOrders([]);
    setNotifications([]);
    setCurrentScreen('welcome');
    setScreenHistory([]);
    await AsyncStorage.removeItem(NAV_KEY);
  };

    // ----- navigation -----
  const navigateToScreen = (name) => {
    setScreenHistory((h) => [...h, currentScreen]);
    setCurrentScreen(name);
    AsyncStorage.setItem(NAV_KEY, name).catch(() => {});
  };

  const goBack = () => {
    setScreenHistory((h) => {
      if (!h.length) { setCurrentScreen('home'); return []; }
      const last = h[h.length - 1];
      setCurrentScreen(last);
      AsyncStorage.setItem(NAV_KEY, last).catch(() => {});
      return h.slice(0, -1);
    });
  };

  const goHome = () => navigateToScreen('home');

  // ✅ AJOUT NOUVEAU : bouton "Suivant"
  const goNext = () => {
    const screens = [
      'welcome', 'login', 'register', 'home',
      'products', 'productDetails', 'cart',
      'favorites', 'orders', 'notifications', 'settings',
      'farmerDashboard', 'farmerProducts', 'salesHistory',
      'adminDashboard', 'users'
    ];
    const idx = screens.indexOf(currentScreen);
    if (idx >= 0 && idx < screens.length - 1) {
      navigateToScreen(screens[idx + 1]);
    }
  };


  // ------- expose -------
   return {
  // état & nav
  user, loading, currentScreen, screenHistory,
  navigateToScreen, goBack, goHome, goNext,

  // catalogue
  products, filteredProducts,
  searchTerm, setSearchTerm,
  selectedCategory, setSelectedCategory,   // 👈 doivent être là
  selectedCity, setSelectedCity,           // 👈 doivent être là
  refetchProducts,
  
  // actions produits
  addProduct: async (p) => { const r = await API.addProduct(p); await refetchProducts(); return r; },
  updateProduct: async (id, p) => { const r = await API.updateProduct(id, p); await refetchProducts(); return r; },
  deleteProduct: async (id) => { const r = await API.deleteProduct(id); await refetchProducts(); return r; },

  // panier & commandes
  cart, favorites, orders, notifications,
  addToCart, updateCartQuantity, removeFromCart, clearCart,
  checkout, getUserOrders,

  // auth
  handleLogin, handleRegister, logout,

  // farmer
  farmerProducts,
  onSellProduct: farmerFeatures.sellProduct,
  getFarmerStats, getRecentSales, getTopProducts,

  // admin
  users, refreshUsers, updateUser, toggleUserActive, deleteUser, resetUserPassword,
};


}

export default useAgriConnect;
