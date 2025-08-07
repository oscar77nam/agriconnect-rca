import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image
} from 'react-native';
import Header from '../common/Header';

const HomeScreen = ({ 
  user, 
  filteredProducts, 
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedCity,
  setSelectedCity,
  categories,
  cities,
  favorites,
  setShowAddProduct,
  setEditingProduct,
  deleteProduct,
  getUserOrders,
  addToCart,
  showOrderModalForProduct,
  toggleFavorite,
  products,
  orders,
  getStats,
  onBack,
  onHome,
  screenHistory,
  currentScreen
}) => {

  // Fonction sécurisée pour afficher les données produit
  const getProductValue = (product, path, defaultValue = 'Non spécifié') => {
    try {
      const paths = path.split('.');
      let current = product;
      
      for (const p of paths) {
        if (current && current[p] !== undefined) {
          current = current[p];
        } else {
          return defaultValue;
        }
      }
      
      return current || defaultValue;
    } catch (error) {
      console.warn('Erreur accès propriété produit:', error);
      return defaultValue;
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifié';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR');
    } catch (error) {
      return 'Date invalide';
    }
  };

  // Rendu d'un produit sécurisé
  const renderProduct = (product) => {
    if (!product) return null;

    // Valeurs sécurisées avec fallbacks
    const name = getProductValue(product, 'name', 'Produit sans nom');
    const price = getProductValue(product, 'price', 0);
    const farmer = getProductValue(product, 'farmer', getProductValue(product, 'farmer_name', 'Agriculteur inconnu'));
    const location = getProductValue(product, 'location', getProductValue(product, 'farmer_location', 'Localisation inconnue'));
    const stock = getProductValue(product, 'stock', 0);
    const unit = getProductValue(product, 'unit', 'kg');
    const category = getProductValue(product, 'category', getProductValue(product, 'category_name', 'Sans catégorie'));
    
    // Date de récolte - plusieurs chemins possibles
    const harvestDate = getProductValue(product, 'harvest_date') || 
                       getProductValue(product, 'metadata.harvestDate') ||
                       getProductValue(product, 'harvestDate');
    
    // Bio - plusieurs chemins possibles
    const isOrganic = getProductValue(product, 'organic', false) || 
                     getProductValue(product, 'metadata.organic', false);
    
    const imageUrl = getProductValue(product, 'image_url') || 
                    getProductValue(product, 'imageUrl');

    const isFavorite = favorites && favorites.includes(product.id);

    return (
      <View key={product.id || Math.random()} style={styles.productCard}>
        {/* Image du produit */}
        <View style={styles.productImageContainer}>
          {imageUrl ? (
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.productImage}
              onError={() => console.warn('Erreur chargement image:', imageUrl)}
            />
          ) : (
            <View style={styles.productImagePlaceholder}>
              <Text style={styles.productImageEmoji}>🌾</Text>
            </View>
          )}
          
          {/* Badge bio */}
          {isOrganic && (
            <View style={styles.organicBadge}>
              <Text style={styles.organicBadgeText}>🌱 BIO</Text>
            </View>
          )}
        </View>

        {/* Informations du produit */}
        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <Text style={styles.productName}>{name}</Text>
            <TouchableOpacity 
              onPress={() => toggleFavorite && toggleFavorite(product.id)}
              style={styles.favoriteButton}
            >
              <Text style={styles.favoriteIcon}>
                {isFavorite ? '❤️' : '🤍'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.productCategory}>{category}</Text>
          
          <View style={styles.productDetails}>
            <Text style={styles.productPrice}>
              {price ? `${price.toLocaleString()} FCFA` : 'Prix non spécifié'} / {unit}
            </Text>
            <Text style={styles.productStock}>
              Stock: {stock} {unit}
            </Text>
          </View>

          <View style={styles.farmerInfo}>
            <Text style={styles.farmerName}>👨‍🌾 {farmer}</Text>
            <Text style={styles.farmerLocation}>📍 {location}</Text>
            {harvestDate !== 'Non spécifié' && (
              <Text style={styles.harvestDate}>
                🗓️ Récolté le: {formatDate(harvestDate)}
              </Text>
            )}
          </View>

          {/* Actions */}
          <View style={styles.productActions}>
            {user && user.type === 'buyer' && (
              <>
                <TouchableOpacity 
                  style={styles.cartButton}
                  onPress={() => addToCart && addToCart(product, 1)}
                >
                  <Text style={styles.cartButtonText}>🛒 Ajouter</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.orderButton}
                  onPress={() => showOrderModalForProduct && showOrderModalForProduct(product)}
                >
                  <Text style={styles.orderButtonText}>📦 Commander</Text>
                </TouchableOpacity>
              </>
            )}

            {user && user.type === 'farmer' && user.id === product.farmer_id && (
              <>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => setEditingProduct && setEditingProduct(product)}
                >
                  <Text style={styles.editButtonText}>✏️ Modifier</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => deleteProduct && deleteProduct(product.id)}
                >
                  <Text style={styles.deleteButtonText}>🗑️ Supprimer</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    );
  };

  // Statistiques sécurisées
  const stats = getStats ? getStats() : {};
  const safeProducts = Array.isArray(filteredProducts) ? filteredProducts : [];

  return (
    <View style={styles.container}>
      <Header 
        user={user}
        onBack={onBack}
        onHome={onHome}
        currentScreen={currentScreen}
        showBackButton={screenHistory && screenHistory.length > 0}
      />

      <ScrollView style={styles.content}>
        {/* En-tête de bienvenue */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            Bonjour {user?.name || 'Utilisateur'} ! 🌾
          </Text>
          <Text style={styles.welcomeSubtext}>
            {user?.type === 'farmer' ? 'Gérez vos produits' : 'Découvrez nos produits frais'}
          </Text>
        </View>

        {/* Statistiques rapides */}
        {Object.keys(stats).length > 0 && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>📊 Résumé</Text>
            <View style={styles.statsGrid}>
              {user?.type === 'farmer' && (
                <>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>{stats.productsCount || 0}</Text>
                    <Text style={styles.statLabel}>Produits</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>{stats.ordersCount || 0}</Text>
                    <Text style={styles.statLabel}>Commandes</Text>
                  </View>
                </>
              )}
              {user?.type === 'buyer' && (
                <>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>{stats.ordersCount || 0}</Text>
                    <Text style={styles.statLabel}>Commandes</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>{stats.favoritesCount || 0}</Text>
                    <Text style={styles.statLabel}>Favoris</Text>
                  </View>
                </>
              )}
            </View>
          </View>
        )}

        {/* Barre de recherche */}
        <View style={styles.searchSection}>
          <TextInput
            style={styles.searchInput}
            value={searchTerm || ''}
            onChangeText={setSearchTerm}
            placeholder="🔍 Rechercher des produits..."
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Filtres de catégories */}
        {categories && Array.isArray(categories) && categories.length > 0 && (
          <View style={styles.filterSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                key="category-tous"
                style={[
                  styles.categoryFilter,
                  selectedCategory === 'tous' && styles.categoryFilterActive
                ]}
                onPress={() => setSelectedCategory && setSelectedCategory('tous')}
              >
                <Text style={[
                  styles.categoryFilterText,
                  selectedCategory === 'tous' && styles.categoryFilterTextActive
                ]}>
                  Tous
                </Text>
              </TouchableOpacity>
              
              {categories.map((category, index) => {
                // Gérer les catégories qui sont des objets ou des strings
                let categoryName, categoryKey;
                
                if (typeof category === 'string') {
                  categoryName = category;
                  categoryKey = category;
                } else if (category && typeof category === 'object') {
                  categoryName = category.name || category.label || `Catégorie ${index}`;
                  categoryKey = category.id || category.name || `category-${index}`;
                } else {
                  categoryName = `Catégorie ${index}`;
                  categoryKey = `category-${index}`;
                }
                
                return (
                  <TouchableOpacity
                    key={`filter-${categoryKey}-${index}`}
                    style={[
                      styles.categoryFilter,
                      selectedCategory === categoryName && styles.categoryFilterActive
                    ]}
                    onPress={() => setSelectedCategory && setSelectedCategory(categoryName)}
                  >
                    <Text style={[
                      styles.categoryFilterText,
                      selectedCategory === categoryName && styles.categoryFilterTextActive
                    ]}>
                      {categoryName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Bouton d'ajout pour les agriculteurs */}
        {user && user.type === 'farmer' && (
          <View style={styles.addProductSection}>
            <TouchableOpacity 
              style={styles.addProductButton}
              onPress={() => setShowAddProduct && setShowAddProduct(true)}
            >
              <Text style={styles.addProductButtonText}>➕ Ajouter un produit</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Liste des produits */}
        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>
            🌾 Produits disponibles ({safeProducts.length})
          </Text>
          
          {safeProducts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>📭</Text>
              <Text style={styles.emptyStateText}>Aucun produit disponible</Text>
              <Text style={styles.emptyStateSubtext}>
                {user?.type === 'farmer' 
                  ? 'Ajoutez votre premier produit !' 
                  : 'Revenez plus tard pour découvrir nos produits'
                }
              </Text>
            </View>
          ) : (
            safeProducts.map(renderProduct)
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
  },
  welcomeSection: {
    padding: 20,
    backgroundColor: '#16a34a',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  statsSection: {
    padding: 20,
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: -10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#16a34a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  searchSection: {
    padding: 20,
    paddingTop: 16,
  },
  searchInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  categoryFilter: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryFilterActive: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  categoryFilterText: {
    fontSize: 14,
    color: '#6b7280',
  },
  categoryFilterTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  addProductSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  addProductButton: {
    backgroundColor: '#16a34a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  addProductButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  productsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  productImageContainer: {
    height: 200,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImageEmoji: {
    fontSize: 60,
  },
  organicBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#16a34a',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  organicBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  productInfo: {
    padding: 16,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    flex: 1,
  },
  favoriteButton: {
    padding: 4,
  },
  favoriteIcon: {
    fontSize: 20,
  },
  productCategory: {
    fontSize: 14,
    color: '#16a34a',
    fontWeight: '600',
    marginBottom: 8,
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  productStock: {
    fontSize: 14,
    color: '#6b7280',
  },
  farmerInfo: {
    marginBottom: 16,
  },
  farmerName: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  farmerLocation: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  harvestDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cartButton: {
    flex: 1,
    backgroundColor: '#f59e0b',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  cartButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  orderButton: {
    flex: 1,
    backgroundColor: '#16a34a',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  orderButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  editButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default HomeScreen;