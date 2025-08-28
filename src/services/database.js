import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.178:3000/api'
  : 'https://votre-api-prod.com/api';

class DatabaseService {
  constructor() {
    this.token = null;
    this.baseURL = API_BASE_URL;
    this.isOnline = false;
  }

  // Initialisation silencieuse
  async init() {
    try {
      // Récupérer le token sauvegardé
      const savedToken = await AsyncStorage.getItem('authToken');
      if (savedToken) {
        this.token = savedToken;
      }
      
      // Test de connexion avec timeout très court
      const response = await Promise.race([
        fetch(`${this.baseURL}/health`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          timeout: 1500
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 1500))
      ]);
      
      if (response.ok) {
        this.isOnline = true;
        return true;
      }
      
    } catch (error) {
      this.isOnline = false;
    }
    
    return false;
  }

  // Méthode générique pour les requêtes
  async makeRequest(endpoint, method = 'GET', data = null) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    if (data && (method === 'POST' || method === 'PUT')) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await Promise.race([
        fetch(url, config),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
      ]);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error('Invalid response');
      }

      return await response.json();
      
    } catch (error) {
      this.isOnline = false;
      throw error;
    }
  }

  async saveToken(token) {
    this.token = token;
    await AsyncStorage.setItem('authToken', token);
  }

  async clearToken() {
    this.token = null;
    await AsyncStorage.removeItem('authToken');
  }

  // AUTHENTIFICATION
  async register(userData) {
    if (!this.isOnline) {
      throw new Error('Service non disponible en mode hors ligne');
    }
    
    if (!userData.name || !userData.phone || !userData.password) {
      throw new Error('Nom, téléphone et mot de passe sont requis');
    }

    if (userData.password.length < 6) {
      throw new Error('Le mot de passe doit contenir au moins 6 caractères');
    }

    const response = await this.makeRequest('/auth/register', 'POST', {
      name: userData.name.trim(),
      phone: userData.phone.trim(),
      password: userData.password,
      location: userData.location || 'Non spécifié',
      user_type: userData.user_type || 'buyer'
    });

    if (response.success && response.token) {
      await this.saveToken(response.token);
      await AsyncStorage.setItem('currentUser', JSON.stringify(response.user));
    }

    return response;
  }

  async login(credentials) {
    if (!this.isOnline) {
      throw new Error('Service non disponible en mode hors ligne');
    }
    
    if (!credentials.phone || !credentials.password) {
      throw new Error('Téléphone et mot de passe sont requis');
    }

    const response = await this.makeRequest('/auth/login', 'POST', {
      phone: credentials.phone.trim(),
      password: credentials.password
    });

    if (response.success && response.token) {
      await this.saveToken(response.token);
      await AsyncStorage.setItem('currentUser', JSON.stringify(response.user));
      return response;
    }
    
    throw new Error(response.message || 'Identifiants incorrects');
  }

  async logout() {
    await this.clearToken();
    await AsyncStorage.removeItem('currentUser');
    return { success: true };
  }

  async getCurrentUser() {
    try {
      const userJson = await AsyncStorage.getItem('currentUser');
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      return null;
    }
  }

  // PRODUITS
  async getProducts(filters = {}) {
    if (!this.isOnline) {
      throw new Error('Service non disponible en mode hors ligne');
    }

    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) queryParams.append(key, filters[key]);
    });

    const endpoint = `/products${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await this.makeRequest(endpoint, 'GET');
    return response.data || [];
  }

  async createProduct(productData) {
    if (!this.isOnline) {
      throw new Error('Service non disponible en mode hors ligne');
    }

    if (!productData.name || !productData.category || !productData.price || !productData.stock) {
      throw new Error('Nom, catégorie, prix et stock sont requis');
    }

    const response = await this.makeRequest('/products', 'POST', {
      name: productData.name.trim(),
      category: productData.category,
      price: parseFloat(productData.price),
      stock: parseInt(productData.stock),
      unit: productData.unit || 'kg',
      image_url: productData.image_url || null,
      organic: productData.organic || false,
      harvest_date: productData.harvest_date || new Date().toISOString().split('T')[0],
      description: productData.description || ''
    });

    return response;
  }

  // COMMANDES
  async getOrders() {
    if (!this.isOnline) {
      throw new Error('Service non disponible en mode hors ligne');
    }

    const response = await this.makeRequest('/orders', 'GET');
    return response.data || [];
  }

  async createOrder(orderData) {
    if (!this.isOnline) {
      throw new Error('Service non disponible en mode hors ligne');
    }

    if (!orderData.product_id || !orderData.quantity) {
      throw new Error('Produit et quantité sont requis');
    }

    const response = await this.makeRequest('/orders', 'POST', {
      product_id: orderData.product_id,
      quantity: parseInt(orderData.quantity),
      delivery_address: orderData.delivery_address || '',
      notes: orderData.notes || ''
    });

    return response;
  }

  // FAVORIS
  async getFavorites() {
    if (!this.isOnline) {
      throw new Error('Service non disponible en mode hors ligne');
    }

    const response = await this.makeRequest('/favorites', 'GET');
    return response.data || [];
  }

  async toggleFavorite(productId) {
    if (!this.isOnline) {
      throw new Error('Service non disponible en mode hors ligne');
    }

    const response = await this.makeRequest('/favorites', 'POST', {
      product_id: productId
    });
    
    return response;
  }

  // UTILITAIRES
  isServiceOnline() {
    return this.isOnline;
  }

  getServiceStatus() {
    return {
      isOnline: this.isOnline,
      baseURL: this.baseURL
    };
  }

  async syncData() {
    if (!this.isOnline) {
      throw new Error('Synchronisation impossible en mode hors ligne');
    }

    const [products, orders, favorites] = await Promise.all([
      this.getProducts().catch(() => []),
      this.getOrders().catch(() => []),
      this.getFavorites().catch(() => [])
    ]);

    return { products, orders, favorites };
  }
}

const databaseService = new DatabaseService();
export default databaseService;