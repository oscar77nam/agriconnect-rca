import { useState, useEffect } from 'react';
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

  // Initialisation des données
  useEffect(() => {
    setProducts(initialProducts);
    setOrders(initialOrders);
    setFilteredProducts(initialProducts);
    
    setNotifications([
      { id: 1, message: '🌾 Nouveau manioc bio disponible chez Jean Bokassa', time: '09:30' },
      { id: 2, message: '📦 Votre commande de manioc est prête pour livraison', time: '08:45' },
      { id: 3, message: '💰 Prix réduit sur poudre de manioc: -15% aujourd\'hui!', time: '07:20' }
    ]);
  }, []);

  // Filtrage des produits
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

  // ========== NAVIGATION ==========
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
    }
  };

  const goHome = () => {
    if (user) {
      setScreenHistory([]);
      setCurrentScreen('home');
    } else {
      setScreenHistory([]);
      setCurrentScreen('welcome');
    }
  };

  // ========== NOTIFICATIONS ==========
  const addNotification = (message) => {
    setNotifications(prev => [...prev, {
      id: Date.now(),
      message,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  // ========== AUTHENTIFICATION ==========
  const handleRegister = (userData) => {
    const newUser = {
      ...userData,
      id: Date.now(),
    };
    setUser(newUser);
    setCurrentScreen('home');
    addNotification(`🎉 Bienvenue ${userData.name} sur AgriConnect RCA!`);
  };

  const logout = () => {
    setUser(null);
    setScreenHistory([]);
    setCurrentScreen('welcome');
    addNotification('👋 À bientôt sur AgriConnect RCA!');
  };

  // ========== GESTION DES PRODUITS ==========
  const addProduct = (productData) => {
    const newProduct = {
      ...productData,
      id: Date.now(),
      farmer_id: user.id,
      farmer: user.name,
      phone: user.phone,
      location: user.location,
      city: user.location.toLowerCase().includes('bangui') ? 'bangui' : 'bimbo',
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
    addNotification(`✅ ${productData.name} ajouté avec succès!`);
    setShowAddProduct(false);
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
    // En React Native, on utilise Alert au lieu de window.confirm
    const product = products.find(p => p.id === productId);
    if (product) {
      setProducts(prev => prev.filter(product => product.id !== productId));
      addNotification(`✅ ${product.name} supprimé`);
    }
  };

  // ========== GESTION DES COMMANDES ==========
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

  const createOrder = (product, quantity) => {
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
      created_at: new Date().toISOString().split('T')[0]
    };

    setOrders(prev => [...prev, newOrder]);
    addNotification(`✅ Commande de ${product.name} créée!`);
  };

  // ========== PANIER ET FAVORIS ==========
  const addToCart = (product) => {
    // Pour l'instant, on simule un ajout direct
    createOrder(product, 1);
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

  // ========== STATISTIQUES ==========
  const getStats = () => {
    if (!user) return {};

    if (user.type === 'farmer') {
      const myProducts = products.filter(p => p.farmer_id === user.id);
      const myOrders = orders.filter(o => o.farmer_id === user.id);
      const totalRevenue = myOrders.reduce((sum, order) => sum + order.total, 0);
      const totalSold = myProducts.reduce((sum, p) => sum + p.totalSold, 0);

      return {
        productsCount: myProducts.length,
        ordersCount: myOrders.length,
        totalRevenue,
        totalSold
      };
    } else if (user.type === 'admin') {
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
      const totalProducts = products.length;
      const totalOrders = orders.length;
      const totalFarmers = [...new Set(products.map(p => p.farmer_id))].length;

      return {
        totalProducts,
        totalOrders,
        totalRevenue,
        totalFarmers
      };
    }

    return {};
  };

  return {
    // ========== STATES ==========
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
    
    // ========== SETTERS ==========
    setCurrentScreen,
    setSearchTerm,
    setSelectedCategory,
    setSelectedCity,
    setShowAddProduct,
    setEditingProduct,
    
    // ========== ACTIONS ==========
    // Navigation
    navigateToScreen,
    goBack,
    goHome,
    
    // Auth
    handleRegister,
    logout,
    
    // Notifications
    addNotification,
    
    // Produits
    addProduct,
    updateProduct,
    deleteProduct,
    
    // Commandes
    getUserOrders,
    createOrder,
    
    // Panier & Favoris
    addToCart,
    toggleFavorite,
    
    // Stats
    getStats
  };
};