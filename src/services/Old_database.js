import AsyncStorage from '@react-native-async-storage/async-storage';

// Votre adresse IP : 192.168.1.178
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.178:3000/api'
  : 'https://votre-api-prod.com/api';

class DatabaseService {
  constructor() {
    this.token = null;
    this.baseURL = API_BASE_URL;
  }

  // Initialisation du service
  async init() {
    console.log('🔍 Initialisation DatabaseService...');
    console.log('🌐 URL API:', this.baseURL);
    
    try {
      const savedToken = await AsyncStorage.getItem('authToken');
      if (savedToken) {
        this.token = savedToken;
        console.log('✅ Token trouvé');
      }
      
      // Test de connexion
      console.log('🔍 Test de connexion à l\'API...');
      const response = await this.makeRequest('/health', 'GET');
      console.log('✅ Connexion API établie:', response.message);
      return true;
    } catch (error) {
      console.error('❌ Erreur initialisation API:', error.message);
      
      // Suggestions de debugging
      console.log('🔧 Vérifications à faire :');
      console.log('1. Le backend est-il démarré ?');
      console.log('2. Testez dans le navigateur:', `${this.baseURL.replace('/api', '')}/api/health`);
      console.log('3. Vérifiez votre IP réseau');
      
      return false;
    }
  }

  // Méthode générique pour les requêtes
  async makeRequest(endpoint, method = 'GET', data = null) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Ajouter le token si disponible
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    // Ajouter les données pour POST/PUT
    if (data && (method === 'POST' || method === 'PUT')) {
      config.body = JSON.stringify(data);
    }

    console.log(`📡 ${method} ${url}`, data ? data : '');

    try {
      const response = await fetch(url, config);
      
      // Vérifier d'abord si la réponse est OK
      if (!response.ok) {
        console.error(`❌ HTTP ${response.status}: ${response.statusText}`);
        throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
      }

      // Vérifier le Content-Type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('❌ Réponse non-JSON reçue:', contentType);
        const textResponse = await response.text();
        console.error('Contenu reçu:', textResponse.substring(0, 200) + '...');
        throw new Error('Le serveur n\'a pas retourné de JSON valide');
      }

      // Essayer de parser le JSON
      const result = await response.json();
      console.log(`📨 Réponse ${response.status}:`, result);

      return result;
    } catch (error) {
      console.error(`❌ Erreur requête ${method} ${endpoint}:`, error);
      
      // Si c'est une erreur de réseau, proposer des solutions
      if (error.message.includes('Network request failed')) {
        throw new Error('Impossible de contacter le serveur. Vérifiez que le backend fonctionne sur http://192.168.1.178:3000');
      }
      
      throw error;
    }
  }

  // Sauvegarde du token
  async saveToken(token) {
    this.token = token;
    await AsyncStorage.setItem('authToken', token);
    console.log('💾 Token sauvegardé');
  }

  // Suppression du token
  async clearToken() {
    this.token = null;
    await AsyncStorage.removeItem('authToken');
    console.log('🗑️ Token supprimé');
  }

  // ============================================
  // AUTHENTIFICATION
  // ============================================

  // Inscription
  async register(userData) {
    console.log('📝 Inscription utilisateur:', userData);
    
    try {
      // Validation côté client
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
        console.log('✅ Inscription réussie');
      }

      return response;
    } catch (error) {
      console.error('❌ Erreur inscription:', error);
      throw error;
    }
  }

  // Connexion
  async login(credentials) {
    console.log('🔐 Connexion utilisateur:', { phone: credentials.phone });
    
    try {
      // Validation côté client
      if (!credentials.phone || !credentials.password) {
        throw new Error('Téléphone et mot de passe sont requis');
      }

      console.log('📡 Envoi requête de connexion...');

      const response = await this.makeRequest('/auth/login', 'POST', {
        phone: credentials.phone.trim(),
        password: credentials.password
      });

      console.log('📨 Réponse de connexion complète:', response);

      if (response.success && response.token) {
        await this.saveToken(response.token);
        await AsyncStorage.setItem('currentUser', JSON.stringify(response.user));
        console.log('✅ Connexion réussie, token sauvegardé');
        return response;
      } else {
        console.log('❌ Connexion échouée:', response);
        throw new Error(response.message || 'Identifiants incorrects');
      }

    } catch (error) {
      console.error('❌ Erreur connexion complète:', error);
      
      // Si l'erreur est HTTP 401, essayer le mode démo
      if (error.message.includes('401')) {
        console.log('🎭 Tentative de connexion en mode démo...');
        
        const demoUsers = [
          { id: 1, name: 'Jean Bokassa', phone: '+23670123456', type: 'farmer', location: 'PK5, Bangui' },
          { id: 2, name: 'Marie Yakoma', phone: '+23670987654', type: 'buyer', location: 'Bégoua' },
          { id: 3, name: 'Admin User', phone: '+23670111111', type: 'admin', location: 'Bangui' }
        ];
        
        const demoUser = demoUsers.find(u => u.phone === credentials.phone);
        if (demoUser && credentials.password === 'demo123') {
          console.log('✅ Connexion démo réussie pour:', demoUser.name);
          await AsyncStorage.setItem('currentUser', JSON.stringify(demoUser));
          return { 
            success: true, 
            user: demoUser,
            token: 'demo-token-' + demoUser.id 
          };
        }
      }
      
      throw error;
    }
  }

  // Déconnexion
  async logout() {
    console.log('👋 Déconnexion...');
    try {
      await this.clearToken();
      await AsyncStorage.removeItem('currentUser');
      console.log('✅ Déconnexion réussie');
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
      throw error;
    }
  }

  // Récupérer l'utilisateur actuel
  async getCurrentUser() {
    try {
      const userJson = await AsyncStorage.getItem('currentUser');
      if (userJson) {
        const user = JSON.parse(userJson);
        console.log('👤 Utilisateur actuel:', user.name);
        return user;
      }
      return null;
    } catch (error) {
      console.error('❌ Erreur récupération utilisateur:', error);
      return null;
    }
  }

  // ============================================
  // PRODUITS
  // ============================================

  // Récupérer tous les produits
  async getProducts(filters = {}) {
    console.log('📦 Récupération produits avec filtres:', filters);
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.city) queryParams.append('city', filters.city);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.farmer_id) queryParams.append('farmer_id', filters.farmer_id);

      const endpoint = `/products${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await this.makeRequest(endpoint, 'GET');
      
      console.log(`✅ ${response.data?.length || 0} produits récupérés`);
      return response.data || [];
    } catch (error) {
      console.error('❌ Erreur récupération produits:', error);
      throw error;
    }
  }

  // Créer un produit
  async createProduct(productData) {
    console.log('➕ Création produit:', productData);
    try {
      // Validation côté client
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

      console.log('✅ Produit créé');
      return response;
    } catch (error) {
      console.error('❌ Erreur création produit:', error);
      throw error;
    }
  }

  // ============================================
  // COMMANDES
  // ============================================

  // Récupérer les commandes
  async getOrders() {
    console.log('📋 Récupération commandes...');
    try {
      const response = await this.makeRequest('/orders', 'GET');
      console.log(`✅ ${response.data?.length || 0} commandes récupérées`);
      return response.data || [];
    } catch (error) {
      console.error('❌ Erreur récupération commandes:', error);
      throw error;
    }
  }

  // Créer une commande
  async createOrder(orderData) {
    console.log('🛒 Création commande:', orderData);
    try {
      // Validation côté client
      if (!orderData.product_id || !orderData.quantity) {
        throw new Error('Produit et quantité sont requis');
      }

      const response = await this.makeRequest('/orders', 'POST', {
        product_id: orderData.product_id,
        quantity: parseInt(orderData.quantity),
        delivery_address: orderData.delivery_address || '',
        notes: orderData.notes || ''
      });

      console.log('✅ Commande créée');
      return response;
    } catch (error) {
      console.error('❌ Erreur création commande:', error);
      throw error;
    }
  }

  // ============================================
  // FAVORIS
  // ============================================

  // Récupérer les favoris
  async getFavorites() {
    console.log('❤️ Récupération favoris...');
    try {
      const response = await this.makeRequest('/favorites', 'GET');
      console.log(`✅ ${response.data?.length || 0} favoris récupérés`);
      return response.data || [];
    } catch (error) {
      console.error('❌ Erreur récupération favoris:', error);
      throw error;
    }
  }

  // Ajouter/Supprimer un favori
  async toggleFavorite(productId) {
    console.log('❤️ Toggle favori pour produit:', productId);
    try {
      const response = await this.makeRequest('/favorites', 'POST', {
        product_id: productId
      });
      
      console.log('✅ Favori mis à jour');
      return response;
    } catch (error) {
      console.error('❌ Erreur toggle favori:', error);
      throw error;
    }
  }

  // ============================================
  // NOTIFICATIONS (pour plus tard)
  // ============================================

  // Récupérer les notifications
  async getNotifications() {
    console.log('🔔 Récupération notifications...');
    try {
      // Pour l'instant, retourner un tableau vide
      // Cette route sera implémentée plus tard
      return [];
    } catch (error) {
      console.error('❌ Erreur récupération notifications:', error);
      return [];
    }
  }

  // ============================================
  // UTILITAIRES
  // ============================================

  // Vérifier la connexion API
  async checkConnection() {
    try {
      const response = await this.makeRequest('/health', 'GET');
      return response.success;
    } catch (error) {
      console.error('❌ API non accessible:', error);
      return false;
    }
  }

  // Synchroniser les données
  async syncData() {
    console.log('🔄 Synchronisation des données...');
    try {
      const [products, orders, favorites] = await Promise.all([
        this.getProducts().catch(e => []),
        this.getOrders().catch(e => []),
        this.getFavorites().catch(e => [])
      ]);

      console.log('✅ Synchronisation terminée');
      return { products, orders, favorites };
    } catch (error) {
      console.error('❌ Erreur synchronisation:', error);
      throw error;
    }
  }
}

// Créer une instance unique
const databaseService = new DatabaseService();

export default databaseService;