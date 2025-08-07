import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatabaseService from '../services/database';
import { initialProducts, initialOrders, categories, cities } from '../data/constants';

export const useAgriConnect = () => {
  console.log('🔍 Hook useAgriConnect initialisé');
  
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('tous');
  const [selectedCity, setSelectedCity] = useState('tous');
  const [notifications, setNotifications] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [screenHistory, setScreenHistory] = useState([]);
  const [cart, setCart] = useState([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderingProduct, setOrderingProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Fonction utilitaire pour ajouter des notifications
  const addNotification = (message) => {
    const newNotification = {
      id: Date.now(),
      message,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  // Fonction pour charger les données utilisateur
  const loadUserData = async () => {
    if (!user || !isOnline) return;
    
    try {
      // Charger les produits
      const productsData = await DatabaseService.getProducts();
      setProducts(productsData);
      
      // Charger les commandes
      const ordersData = await DatabaseService.getOrders();
      setOrders(ordersData);
      
      // Charger les favoris
      const favoritesData = await DatabaseService.getFavorites();
      setFavorites(favoritesData.map(fav => fav.product_id));
      
      // Charger les notifications
      const notificationsData = await DatabaseService.getNotifications();
      setNotifications(notificationsData);
      
    } catch (error) {
      console.error('Erreur chargement données:', error);
      addNotification('⚠️ Erreur de synchronisation - Mode hors ligne activé');
      setIsOnline(false);
    }
  };

  // FONCTION D'INSCRIPTION CORRIGÉE
  const handleRegister = async (userData) => {
    console.log('🔄 handleRegister appelé dans hook avec:', userData);
    setLoading(true);
    
    try {
      // Validation des données
      if (!userData.name || !userData.phone || !userData.password) {
        throw new Error('Nom, téléphone et mot de passe sont requis');
      }

      console.log('📡 Appel DatabaseService.register...');
      
      // Tentative d'inscription via API
      const response = await DatabaseService.register({
        name: userData.name.trim(),
        phone: userData.phone.trim(),
        password: userData.password,
        location: userData.location || 'Non spécifié',
        user_type: userData.type || 'buyer'
      });

      console.log('📨 Réponse DatabaseService:', response);

      if (response.success) {
        setUser(response.user);
        setCurrentScreen('home');
        setScreenHistory([]);
        await loadUserData();
        addNotification(`🎉 Bienvenue ${response.user.name} sur AgriConnect RCA !`);
        setIsOnline(true);
        return response;
      } else {
        throw new Error(response.message || 'Erreur lors de l\'inscription');
      }

    } catch (error) {
      console.error('❌ Erreur inscription dans hook:', error);
      
      // Mode fallback (optionnel, pour démo hors ligne)
      if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
        console.log('📱 Mode hors ligne activé');
        const newUser = {
          id: Date.now(),
          name: userData.name,
          phone: userData.phone,
          location: userData.location || 'Non spécifié',
          type: userData.type || 'buyer'
        };
        setUser(newUser);
        setCurrentScreen('home');
        setScreenHistory([]);
        addNotification(`🎉 Bienvenue ${userData.name} (Mode hors ligne) !`);
        setIsOnline(false);
        return { success: true, user: newUser };
      }
      
      // Relancer l'erreur pour que le composant puisse la gérer
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // FONCTION DE CONNEXION
  const handleLogin = async (credentials) => {
    console.log('🔐 handleLogin appelé dans hook avec:', { phone: credentials.phone });
    setLoading(true);
    try {
      const response = await DatabaseService.login(credentials);
      
      if (response.success) {
        setUser(response.user);
        setCurrentScreen('home');
        setScreenHistory([]);
        await loadUserData();
        addNotification(`🎉 Bienvenue ${response.user.name} !`);
        setIsOnline(true);
        return response;
      } else {
        throw new Error(response.message || 'Erreur de connexion');
      }
    } catch (error) {
      console.error('Erreur login:', error);
      
      // Tentative de connexion locale pour démo
      const demoUsers = [
        { id: 1, name: 'Jean Bokassa', phone: '+23670123456', type: 'farmer', location: 'PK5, Bangui' },
        { id: 2, name: 'Marie Yakoma', phone: '+23670987654', type: 'buyer', location: 'Bégoua' },
        { id: 3, name: 'Admin User', phone: '+23670111111', type: 'admin', location: 'Bangui' }
      ];
      
      const demoUser = demoUsers.find(u => u.phone === credentials.phone);
      if (demoUser && credentials.password === 'demo123') {
        setUser(demoUser);
        setCurrentScreen('home');
        setScreenHistory([]);
        addNotification(`🎉 Bienvenue ${demoUser.name} (Mode démo) !`);
        setIsOnline(false);
        return { success: true };
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Initialisation de l'app
  const initializeApp = async () => {
    setLoading(true);
    try {
      await DatabaseService.init();
      const savedUser = await DatabaseService.getCurrentUser();
      
      if (savedUser) {
        setUser(savedUser);
        setCurrentScreen('home');
        await loadUserData();
      } else {
        // Mode hors ligne avec données locales
        setProducts(initialProducts);
        setOrders(initialOrders);
        setFilteredProducts(initialProducts);
      }
      
      setNotifications([
        { id: 1, message: '🌾 Nouveau manioc bio disponible chez Jean Bokassa', time: '09:30' },
        { id: 2, message: '📦 Votre commande de manioc est prête pour livraison', time: '08:45' },
        { id: 3, message: '💰 Prix réduit sur poudre de manioc: -15% aujourd\'hui!', time: '07:20' }
      ]);
      
    } catch (error) {
      console.error('Erreur initialisation:', error);
      // Fallback en mode hors ligne
      setProducts(initialProducts);
      setOrders(initialOrders);
      setFilteredProducts(initialProducts);
      setIsOnline(false);
    } finally {
      setLoading(false);
    }
  };

  // useEffect pour l'initialisation
  useEffect(() => {
    initializeApp();
  }, []);

  // useEffect pour le filtrage des produits
  useEffect(() => {
    let filtered = products;
    
    if (user && user.type === 'farmer') {
      filtered = filtered.filter(product => product.farmer_id === user.id);
    }
    
    if (selectedCategory !== 'tous') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    if (selectedCity !== 'tous') {
      filtered = filtered.filter(product => product.city === selectedCity);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.farmer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, selectedCity, products, user]);

  // Fonctions de navigation
  const navigateToScreen = (screen) => {
    if (currentScreen !== screen) {
      setScreenHistory(prev => [...prev, currentScreen]);
      setCurrentScreen(screen);
    }
  };

  const goBack = () => {
    if (screenHistory.length > 0) {
      const previousScreen = screenHistory[screenHistory.length - 1];
      setScreenHistory(prev => prev.slice(0, -1));
      setCurrentScreen(previousScreen);
    } else {
      if (user) {
        setCurrentScreen('home');
      } else {
        setCurrentScreen('welcome');
      }
    }
  };

  const goHome = () => {
    if (user) {
      setScreenHistory([]);
      setCurrentScreen('home');
      setSearchTerm('');
      setSelectedCategory('tous');
      setSelectedCity('tous');
    } else {
      setScreenHistory([]);
      setCurrentScreen('welcome');
    }
  };

  // Autres fonctions...
  const clearAllNotifications = () => {
    setNotifications([]);
    addNotification('🗑️ Toutes les notifications ont été effacées');
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (isOnline) {
        await DatabaseService.logout();
      }
      
      // Nettoyer l'état local
      setUser(null);
      setScreenHistory([]);
      setCurrentScreen('welcome');
      setCart([]);
      setFavorites([]);
      setSearchTerm('');
      setSelectedCategory('tous');
      setSelectedCity('tous');
      setShowAddProduct(false);
      setEditingProduct(null);
      setShowOrderModal(false);
      setOrderingProduct(null);
      setOrders([]);
      setProducts(initialProducts);
      setFilteredProducts(initialProducts);
      
      addNotification('👋 À bientôt sur AgriConnect RCA!');
      setIsOnline(true);
      
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      // Déconnexion forcée même en cas d'erreur
      setUser(null);
      setCurrentScreen('welcome');
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData) => {
    setLoading(true);
    try {
      if (isOnline) {
        const response = await DatabaseService.createProduct(productData);
        if (response.success) {
          await loadUserData();
          addNotification(`✅ ${productData.name} ajouté avec succès!`);
          setShowAddProduct(false);
          return response;
        }
      }
      
      // Fallback mode hors ligne
      const newProduct = {
        ...productData,
        id: Date.now(),
        farmer_id: user.id,
        farmer: user.name,
        phone: user.phone,
        location: user.location,
        city: user.location.toLowerCase().includes('bangui') ? 'bangui' : 
              user.location.toLowerCase().includes('bimbo') ? 'bimbo' :
              user.location.toLowerCase().includes('begoua') ? 'begoua' :
              user.location.toLowerCase().includes('bambari') ? 'bambari' :
              user.location.toLowerCase().includes('bouar') ? 'bouar' : 'bangui',
        rating: 0,
        stock: parseInt(productData.stock) || parseInt(productData.quantity) || 0,
        reviews: 0,
        totalSold: 0,
        price: parseInt(productData.price) || 0,
        metadata: {
          organic: productData.organic || false,
          harvestDate: productData.harvestDate || productData.harvest_date || new Date().toISOString().split('T')[0],
          description: productData.description || ''
        }
      };

      setProducts(prev => [...prev, newProduct]);
      addNotification(`✅ ${productData.name} ajouté avec succès! (Mode hors ligne)`);
      setShowAddProduct(false);
      
    } catch (error) {
      console.error('Erreur ajout produit:', error);
      addNotification('❌ Erreur lors de l\'ajout du produit');
    } finally {
      setLoading(false);
    }
  };

  // Fonctions restantes (updateProduct, deleteProduct, etc.)
  const updateProduct = (productId, updatedData) => {
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { 
            ...product, 
            ...updatedData, 
            stock: parseInt(updatedData.quantity || updatedData.stock),
            price: parseInt(updatedData.price)
          }
        : product
    ));
    addNotification(`✅ Produit modifié avec succès!`);
    setEditingProduct(null);
  };

  const deleteProduct = (productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      Alert.alert(
        "Confirmer la suppression",
        `Êtes-vous sûr de vouloir supprimer "${product.name}" ?`,
        [
          { text: "Annuler", style: "cancel" },
          { 
            text: "Supprimer", 
            style: "destructive",
            onPress: () => {
              setProducts(prev => prev.filter(p => p.id !== productId));
              addNotification(`✅ ${product.name} supprimé`);
            }
          }
        ]
      );
    }
  };

  const getUserOrders = () => {
    if (!user) return [];
    
    if (user.type === 'farmer') {
      return orders.filter(order => order.farmer_id === user.id);
    } else if (user.type === 'buyer') {
      return orders.filter(order => order.buyer_id === user.id);
    } else if (user.type === 'admin') {
      return orders;
    }
    return [];
  };

  const createOrder = (product, quantity = 1, deliveryAddress = '') => {
    const newOrder = {
      id: Date.now(),
      buyer_id: user.id,
      product_id: product.id,
      farmer_id: product.farmer_id,
      buyer_name: user.name,
      farmer_name: product.farmer,
      product_name: product.name,
      quantity: quantity,
      unit_price: product.price,
      total: product.price * quantity,
      status: 'pending',
      delivery_address: deliveryAddress,
      created_at: new Date().toISOString().split('T')[0]
    };

    setOrders(prev => [...prev, newOrder]);
    addNotification(`✅ Commande de ${product.name} créée! Total: ${(product.price * quantity).toLocaleString()} FCFA`);
    
    setProducts(prev => prev.map(p => 
      p.id === product.id 
        ? { ...p, stock: Math.max(0, p.stock - quantity), totalSold: (p.totalSold || 0) + quantity }
        : p
    ));
  };

  const showOrderModalForProduct = (product) => {
    setOrderingProduct(product);
    setShowOrderModal(true);
  };

  const hideOrderModal = () => {
    setShowOrderModal(false);
    setOrderingProduct(null);
  };

  const handleOrderConfirm = (product, quantity, deliveryAddress) => {
    createOrder(product, quantity, deliveryAddress);
    hideOrderModal();
  };

  const addToCart = (product, quantity = 1) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      setCart(prev => prev.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
      addNotification(`➕ ${product.name} ajouté au panier (${existingItem.quantity + quantity})`);
    } else {
      setCart(prev => [...prev, { product, quantity }]);
      addNotification(`🛒 ${product.name} ajouté au panier`);
    }
  };

  const removeFromCart = (productId) => {
    const item = cart.find(item => item.product.id === productId);
    if (item) {
      setCart(prev => prev.filter(item => item.product.id !== productId));
      addNotification(`❌ ${item.product.name} retiré du panier`);
    }
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prev => prev.map(item => 
      item.product.id === productId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const clearCart = () => {
    setCart([]);
    addNotification('🗑️ Panier vidé');
  };

  const checkout = () => {
    if (cart.length === 0) return;
    
    cart.forEach(({ product, quantity }) => {
      createOrder(product, quantity);
    });
    
    clearCart();
    navigateToScreen('orders');
    addNotification('🎉 Commandes passées avec succès!');
  };

  const toggleFavorite = (productId) => {
    setFavorites(prev => {
      const isFavorite = prev.includes(productId);
      const product = products.find(p => p.id === productId);
      
      if (isFavorite) {
        addNotification(`💔 ${product?.name} retiré des favoris`);
        return prev.filter(id => id !== productId);
      } else {
        addNotification(`❤️ ${product?.name} ajouté aux favoris`);
        return [...prev, productId];
      }
    });
  };

  const getStats = () => {
    if (!user) return {};

    if (user.type === 'farmer') {
      const myProducts = products.filter(p => p.farmer_id === user.id);
      const myOrders = orders.filter(o => o.farmer_id === user.id);
      const totalRevenue = myOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const totalSold = myProducts.reduce((sum, p) => sum + (p.totalSold || 0), 0);
      const pendingOrders = myOrders.filter(o => o.status === 'pending').length;

      return {
        productsCount: myProducts.length,
        ordersCount: myOrders.length,
        totalRevenue,
        totalSold,
        pendingOrders
      };
    } else if (user.type === 'buyer') {
      const myOrders = orders.filter(o => o.buyer_id === user.id);
      const totalSpent = myOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      
      return {
        ordersCount: myOrders.length,
        totalSpent,
        favoritesCount: favorites.length,
        cartItemsCount: cart.length
      };
    } else if (user.type === 'admin') {
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const totalProducts = products.length;
      const totalOrders = orders.length;
      const totalFarmers = [...new Set(products.map(p => p.farmer_id))].length;
      const pendingOrders = orders.filter(o => o.status === 'pending').length;

      return {
        totalProducts,
        totalOrders,
        totalRevenue,
        totalFarmers,
        pendingOrders
      };
    }

    return {};
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Debug des fonctions avant le return
  console.log('🔍 Fonctions définies avant return:', {
    handleRegister: typeof handleRegister,
    handleLogin: typeof handleLogin
  });

  return {
    // États
    currentScreen,
    user,
    products,
    filteredProducts,
    orders,
    searchTerm,
    selectedCategory,
    selectedCity,
    notifications,
    favorites,
    showAddProduct,
    editingProduct,
    screenHistory,
    categories,
    cities,
    cart,
    showOrderModal,
    orderingProduct,
    loading,
    isOnline,
    
    // Setters
    setCurrentScreen,
    setSearchTerm,
    setSelectedCategory,
    setSelectedCity,
    setShowAddProduct,
    setEditingProduct,
    
    // Actions de navigation
    navigateToScreen,
    goBack,
    goHome,
    
    // Authentification
    handleRegister,
    handleLogin,
    logout,
    
    // Notifications
    addNotification,
    clearAllNotifications,
    
    // Produits
    addProduct,
    updateProduct,
    deleteProduct,
    
    // Commandes
    getUserOrders,
    createOrder,
    showOrderModalForProduct,
    hideOrderModal,
    handleOrderConfirm,
    
    // Panier
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    checkout,
    
    // Favoris
    toggleFavorite,
    
    // Stats
    getStats,
    getCartTotal,
    getCartItemsCount
  };
};
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatabaseService from '../services/database';
import { initialProducts, initialOrders, categories, cities } from '../data/constants';

export const useAgriConnect = () => {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('tous');
  const [selectedCity, setSelectedCity] = useState('tous');
  const [notifications, setNotifications] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [screenHistory, setScreenHistory] = useState([]);
  const [cart, setCart] = useState([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderingProduct, setOrderingProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    setLoading(true);
    try {
      await DatabaseService.init();
      const savedUser = await DatabaseService.getCurrentUser();
      
      if (savedUser) {
        setUser(savedUser);
        setCurrentScreen('home');
        await loadUserData();
      } else {
        // Mode hors ligne avec données locales
        setProducts(initialProducts);
        setOrders(initialOrders);
        setFilteredProducts(initialProducts);
      }
      
      setNotifications([
        { id: 1, message: '🌾 Nouveau manioc bio disponible chez Jean Bokassa', time: '09:30' },
        { id: 2, message: '📦 Votre commande de manioc est prête pour livraison', time: '08:45' },
        { id: 3, message: '💰 Prix réduit sur poudre de manioc: -15% aujourd\'hui!', time: '07:20' }
      ]);
      
    } catch (error) {
      console.error('Erreur initialisation:', error);
      // Fallback en mode hors ligne
      setProducts(initialProducts);
      setOrders(initialOrders);
      setFilteredProducts(initialProducts);
      setIsOnline(false);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    if (!user || !isOnline) return;
    
    try {
      // Charger les produits
      const productsData = await DatabaseService.getProducts();
      setProducts(productsData);
      
      // Charger les commandes
      const ordersData = await DatabaseService.getOrders();
      setOrders(ordersData);
      
      // Charger les favoris
      const favoritesData = await DatabaseService.getFavorites();
      setFavorites(favoritesData.map(fav => fav.product_id));
      
      // Charger les notifications
      const notificationsData = await DatabaseService.getNotifications();
      setNotifications(notificationsData);
      
    } catch (error) {
      console.error('Erreur chargement données:', error);
      addNotification('⚠️ Erreur de synchronisation - Mode hors ligne activé');
      setIsOnline(false);
    }
  };

  const handleLogin = async (credentials) => {
    setLoading(true);
    try {
      const response = await DatabaseService.login(credentials);
      
      if (response.success) {
        setUser(response.user);
        setCurrentScreen('home');
        setScreenHistory([]);
        await loadUserData();
        addNotification(`🎉 Bienvenue ${response.user.name} !`);
        setIsOnline(true);
        return response;
      } else {
        throw new Error(response.message || 'Erreur de connexion');
      }
    } catch (error) {
      console.error('Erreur login:', error);
      
      // Tentative de connexion locale pour démo
      const demoUsers = [
        { id: 1, name: 'Jean Bokassa', phone: '+23670123456', type: 'farmer', location: 'PK5, Bangui' },
        { id: 2, name: 'Marie Yakoma', phone: '+23670987654', type: 'buyer', location: 'Bégoua' },
        { id: 3, name: 'Admin User', phone: '+23670111111', type: 'admin', location: 'Bangui' }
      ];
      
      const demoUser = demoUsers.find(u => u.phone === credentials.phone);
      if (demoUser && credentials.password === 'demo123') {
        setUser(demoUser);
        setCurrentScreen('home');
        setScreenHistory([]);
        addNotification(`🎉 Bienvenue ${demoUser.name} (Mode démo) !`);
        setIsOnline(false);
        return { success: true };
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = products;
    
    if (user && user.type === 'farmer') {
      filtered = filtered.filter(product => product.farmer_id === user.id);
    }
    
    if (selectedCategory !== 'tous') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    if (selectedCity !== 'tous') {
      filtered = filtered.filter(product => product.city === selectedCity);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.farmer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, selectedCity, products, user]);

  const navigateToScreen = (screen) => {
    if (currentScreen !== screen) {
      setScreenHistory(prev => [...prev, currentScreen]);
      setCurrentScreen(screen);
    }
  };

  const goBack = () => {
    if (screenHistory.length > 0) {
      const previousScreen = screenHistory[screenHistory.length - 1];
      setScreenHistory(prev => prev.slice(0, -1));
      setCurrentScreen(previousScreen);
    } else {
      if (user) {
        setCurrentScreen('home');
      } else {
        setCurrentScreen('welcome');
      }
    }
  };

  const goHome = () => {
    if (user) {
      setScreenHistory([]);
      setCurrentScreen('home');
      setSearchTerm('');
      setSelectedCategory('tous');
      setSelectedCity('tous');
    } else {
      setScreenHistory([]);
      setCurrentScreen('welcome');
    }
  };

  const addNotification = (message) => {
    const newNotification = {
      id: Date.now(),
      message,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    addNotification('🗑️ Toutes les notifications ont été effacées');
  };

  const handleRegister = async (userData) => {
    console.log('🔄 handleRegister appelé dans hook avec:', userData);
    setLoading(true);
    
    try {
      // Validation des données
      if (!userData.name || !userData.phone || !userData.password) {
        throw new Error('Nom, téléphone et mot de passe sont requis');
      }

      console.log('📡 Appel DatabaseService.register...');
      
      // Tentative d'inscription via API
      const response = await DatabaseService.register({
        name: userData.name.trim(),
        phone: userData.phone.trim(),
        password: userData.password,
        location: userData.location || 'Non spécifié',
        user_type: userData.type || 'buyer'
      });

      console.log('📨 Réponse DatabaseService:', response);

      if (response.success) {
        setUser(response.user);
        setCurrentScreen('home');
        setScreenHistory([]);
        await loadUserData();
        addNotification(`🎉 Bienvenue ${response.user.name} sur AgriConnect RCA !`);
        setIsOnline(true);
        return response;
      } else {
        throw new Error(response.message || 'Erreur lors de l\'inscription');
      }

    } catch (error) {
      console.error('❌ Erreur inscription dans hook:', error);
      
      // Mode fallback (optionnel, pour démo hors ligne)
      if (error.message.includes('Network request failed')) {
        console.log('📱 Mode hors ligne activé');
        const newUser = {
          ...userData,
          id: Date.now(),
          type: userData.type || 'buyer'
        };
        setUser(newUser);
        setCurrentScreen('home');
        setScreenHistory([]);
        addNotification(`🎉 Bienvenue ${userData.name} (Mode hors ligne) !`);
        setIsOnline(false);
        return { success: true, user: newUser };
      }
      
      // Relancer l'erreur pour que le composant puisse la gérer
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (isOnline) {
        await DatabaseService.logout();
      }
      
      // Nettoyer l'état local
      setUser(null);
      setScreenHistory([]);
      setCurrentScreen('welcome');
      setCart([]);
      setFavorites([]);
      setSearchTerm('');
      setSelectedCategory('tous');
      setSelectedCity('tous');
      setShowAddProduct(false);
      setEditingProduct(null);
      setShowOrderModal(false);
      setOrderingProduct(null);
      setOrders([]);
      setProducts(initialProducts);
      setFilteredProducts(initialProducts);
      
      addNotification('👋 À bientôt sur AgriConnect RCA!');
      setIsOnline(true);
      
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      // Déconnexion forcée même en cas d'erreur
      setUser(null);
      setCurrentScreen('welcome');
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData) => {
    setLoading(true);
    try {
      if (isOnline) {
        const response = await DatabaseService.createProduct(productData);
        if (response.success) {
          await loadUserData(); // Recharger les données
          addNotification(`✅ ${productData.name} ajouté avec succès!`);
          setShowAddProduct(false);
          return;
        }
      }
      
      // Fallback mode hors ligne
      const newProduct = {
        ...productData,
        id: Date.now(),
        farmer_id: user.id,
        farmer: user.name,
        phone: user.phone,
        location: user.location,
        city: user.location.toLowerCase().includes('bangui') ? 'bangui' : 
              user.location.toLowerCase().includes('bimbo') ? 'bimbo' :
              user.location.toLowerCase().includes('begoua') ? 'begoua' :
              user.location.toLowerCase().includes('bambari') ? 'bambari' :
              user.location.toLowerCase().includes('bouar') ? 'bouar' : 'bangui',
        rating: 0,
        stock: parseInt(productData.quantity),
        reviews: 0,
        totalSold: 0,
        price: parseInt(productData.price),
        metadata: {
          organic: productData.organic || false,
          harvestDate: productData.harvestDate || new Date().toISOString().split('T')[0],
          description: productData.description || ''
        }
      };

      setProducts(prev => [...prev, newProduct]);
      addNotification(`✅ ${productData.name} ajouté avec succès! (Mode hors ligne)`);
      setShowAddProduct(false);
      
    } catch (error) {
      console.error('Erreur ajout produit:', error);
      addNotification('❌ Erreur lors de l\'ajout du produit');
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = (productId, updatedData) => {
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { 
            ...product, 
            ...updatedData, 
            stock: parseInt(updatedData.quantity),
            price: parseInt(updatedData.price)
          }
        : product
    ));
    addNotification(`✅ Produit modifié avec succès!`);
    setEditingProduct(null);
  };

  const deleteProduct = (productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      Alert.alert(
        "Confirmer la suppression",
        `Êtes-vous sûr de vouloir supprimer "${product.name}" ?`,
        [
          { text: "Annuler", style: "cancel" },
          { 
            text: "Supprimer", 
            style: "destructive",
            onPress: () => {
              setProducts(prev => prev.filter(p => p.id !== productId));
              addNotification(`✅ ${product.name} supprimé`);
            }
          }
        ]
      );
    }
  };

  const getUserOrders = () => {
    if (!user) return [];
    
    if (user.type === 'farmer') {
      return orders.filter(order => order.farmer_id === user.id);
    } else if (user.type === 'buyer') {
      return orders.filter(order => order.buyer_id === user.id);
    } else if (user.type === 'admin') {
      return orders;
    }
    return [];
  };

  const createOrder = (product, quantity = 1, deliveryAddress = '') => {
    const newOrder = {
      id: Date.now(),
      buyer_id: user.id,
      product_id: product.id,
      farmer_id: product.farmer_id,
      buyer_name: user.name,
      farmer_name: product.farmer,
      product_name: product.name,
      quantity: quantity,
      unit_price: product.price,
      total: product.price * quantity,
      status: 'pending',
      delivery_address: deliveryAddress,
      created_at: new Date().toISOString().split('T')[0]
    };

    setOrders(prev => [...prev, newOrder]);
    addNotification(`✅ Commande de ${product.name} créée! Total: ${(product.price * quantity).toLocaleString()} FCFA`);
    
    setProducts(prev => prev.map(p => 
      p.id === product.id 
        ? { ...p, stock: Math.max(0, p.stock - quantity), totalSold: p.totalSold + quantity }
        : p
    ));
  };

  const showOrderModalForProduct = (product) => {
    setOrderingProduct(product);
    setShowOrderModal(true);
  };

  const hideOrderModal = () => {
    setShowOrderModal(false);
    setOrderingProduct(null);
  };

  const handleOrderConfirm = (product, quantity, deliveryAddress) => {
    createOrder(product, quantity, deliveryAddress);
    hideOrderModal();
  };

  const addToCart = (product, quantity = 1) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      setCart(prev => prev.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
      addNotification(`➕ ${product.name} ajouté au panier (${existingItem.quantity + quantity})`);
    } else {
      setCart(prev => [...prev, { product, quantity }]);
      addNotification(`🛒 ${product.name} ajouté au panier`);
    }
  };

  const removeFromCart = (productId) => {
    const item = cart.find(item => item.product.id === productId);
    if (item) {
      setCart(prev => prev.filter(item => item.product.id !== productId));
      addNotification(`❌ ${item.product.name} retiré du panier`);
    }
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prev => prev.map(item => 
      item.product.id === productId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const clearCart = () => {
    setCart([]);
    addNotification('🗑️ Panier vidé');
  };

  const checkout = () => {
    if (cart.length === 0) return;
    
    cart.forEach(({ product, quantity }) => {
      createOrder(product, quantity);
    });
    
    clearCart();
    navigateToScreen('orders');
    addNotification('🎉 Commandes passées avec succès!');
  };

  const toggleFavorite = (productId) => {
    setFavorites(prev => {
      const isFavorite = prev.includes(productId);
      const product = products.find(p => p.id === productId);
      
      if (isFavorite) {
        addNotification(`💔 ${product?.name} retiré des favoris`);
        return prev.filter(id => id !== productId);
      } else {
        addNotification(`❤️ ${product?.name} ajouté aux favoris`);
        return [...prev, productId];
      }
    });
  };

  const getStats = () => {
    if (!user) return {};

    if (user.type === 'farmer') {
      const myProducts = products.filter(p => p.farmer_id === user.id);
      const myOrders = orders.filter(o => o.farmer_id === user.id);
      const totalRevenue = myOrders.reduce((sum, order) => sum + order.total, 0);
      const totalSold = myProducts.reduce((sum, p) => sum + p.totalSold, 0);
      const pendingOrders = myOrders.filter(o => o.status === 'pending').length;

      return {
        productsCount: myProducts.length,
        ordersCount: myOrders.length,
        totalRevenue,
        totalSold,
        pendingOrders
      };
    } else if (user.type === 'buyer') {
      const myOrders = orders.filter(o => o.buyer_id === user.id);
      const totalSpent = myOrders.reduce((sum, order) => sum + order.total, 0);
      
      return {
        ordersCount: myOrders.length,
        totalSpent,
        favoritesCount: favorites.length,
        cartItemsCount: cart.length
      };
    } else if (user.type === 'admin') {
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
      const totalProducts = products.length;
      const totalOrders = orders.length;
      const totalFarmers = [...new Set(products.map(p => p.farmer_id))].length;
      const pendingOrders = orders.filter(o => o.status === 'pending').length;

      return {
        totalProducts,
        totalOrders,
        totalRevenue,
        totalFarmers,
        pendingOrders
      };
    }

    return {};
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return {
    // États
    currentScreen,
    user,
    products,
    filteredProducts,
    orders,
    searchTerm,
    selectedCategory,
    selectedCity,
    notifications,
    favorites,
    showAddProduct,
    editingProduct,
    screenHistory,
    categories,
    cities,
    cart,
    showOrderModal,
    orderingProduct,
    loading,
    isOnline,
    
    // Setters
    setCurrentScreen,
    setSearchTerm,
    setSelectedCategory,
    setSelectedCity,
    setShowAddProduct,
    setEditingProduct,
    
    // Actions
    navigateToScreen,
    goBack,
    goHome,
    
    // Authentification - AJOUTEZ CES LIGNES
    handleRegister,          // ← Important !
    handleLogin,            // ← Important !
    logout,
    
    addNotification,
    clearAllNotifications,
    
    addProduct,
    updateProduct,
    deleteProduct,
    
    getUserOrders,
    createOrder,
    showOrderModalForProduct,
    hideOrderModal,
    handleOrderConfirm,
    
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    checkout,
    toggleFavorite,
    
    getStats,
    getCartTotal,
    getCartItemsCount
  };
};