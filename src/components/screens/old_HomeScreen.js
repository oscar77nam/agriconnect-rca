import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
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
  onBack,
  onHome,
  screenHistory,
  currentScreen,
  setShowAddProduct,
  setEditingProduct,
  deleteProduct,
  getUserOrders,
  addToCart,
  showOrderModalForProduct,
  toggleFavorite,
  products,
  orders,
  getStats
}) => {
  // Vue Agriculteur
  if (user?.type === 'farmer') {
    const stats = getStats();
    
    return (
      <View style={styles.container}>
        <Header 
          title="👨‍🌾 Mes Produits" 
          showBackButton={false}
          onBack={onBack}
          onHome={onHome}
          screenHistory={screenHistory}
          currentScreen={currentScreen}
          user={user}
        />
        
        <View style={styles.headerSection}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Catalogue Produits</Text>
              <Text style={styles.headerSubtitle}>Gérez votre catalogue</Text>
            </View>
            <View style={styles.statsContainer}>
              <Text style={styles.statsLabel}>Produits actifs</Text>
              <Text style={styles.statsNumber}>{filteredProducts.length}</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setShowAddProduct(true)}
            style={styles.addButton}
          >
            <Ionicons name="add" size={24} color="white" />
            <Text style={styles.addButtonText}>Ajouter un nouveau produit</Text>
          </TouchableOpacity>

          {/* Stats rapides */}
          <View style={styles.quickStats}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.ordersCount || 0}</Text>
              <Text style={styles.statLabel}>Commandes</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{(stats.totalRevenue || 0).toLocaleString()}</Text>
              <Text style={styles.statLabel}>FCFA revenus</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalSold || 0}</Text>
              <Text style={styles.statLabel}>Kg vendus</Text>
            </View>
          </View>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {filteredProducts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📦</Text>
              <Text style={styles.emptyTitle}>Aucun produit</Text>
              <Text style={styles.emptySubtitle}>Ajoutez votre premier produit</Text>
              <TouchableOpacity 
                onPress={() => setShowAddProduct(true)}
                style={styles.emptyButton}
              >
                <Text style={styles.emptyButtonText}>➕ Ajouter un produit</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              {filteredProducts.map(product => (
                <View key={product.id} style={styles.productCard}>
                  <View style={styles.productContent}>
                    <Text style={styles.productEmoji}>{product.image}</Text>
                    <View style={styles.productInfo}>
                      <View style={styles.productHeader}>
                        <Text style={styles.productName}>{product.name}</Text>
                        <View style={styles.productActions}>
                          <TouchableOpacity 
                            onPress={() => setEditingProduct(product)}
                            style={styles.editButton}
                          >
                            <Ionicons name="pencil" size={18} color="#2563eb" />
                          </TouchableOpacity>
                          <TouchableOpacity 
                            onPress={() => deleteProduct(product.id)}
                            style={styles.deleteButton}
                          >
                            <Ionicons name="trash" size={18} color="#dc2626" />
                          </TouchableOpacity>
                        </View>
                      </View>
                      
                      <View style={styles.productDetails}>
                        <View>
                          <Text style={styles.productPrice}>
                            {product.price.toLocaleString()}
                            <Text style={styles.productUnit}> FCFA/{product.unit}</Text>
                          </Text>
                        </View>
                        <View style={styles.stockInfo}>
                          <Text style={styles.stockLabel}>Stock</Text>
                          <Text style={[styles.stockValue, product.stock === 0 && styles.stockEmpty]}>
                            {product.stock} {product.unit}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.productMeta}>
                        <Text style={styles.metaText}>📅 Récolté le: {product.metadata.harvestDate}</Text>
                        <Text style={styles.metaText}>📊 Total vendu: {product.totalSold} {product.unit}</Text>
                        {product.metadata.organic && (
                          <Text style={styles.organicBadge}>🌿 Produit biologique</Text>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    );
  } 
  
  // Vue Acheteur
  else if (user?.type === 'buyer') {
    return (
      <View style={styles.container}>
        <Header 
          title="🛒 Marketplace" 
          showBackButton={false}
          onBack={onBack}
          onHome={onHome}
          screenHistory={screenHistory}
          currentScreen={currentScreen}
          user={user}
        />
        
        <View style={styles.marketplaceHeader}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
            <TextInput
              placeholder="Rechercher..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              style={styles.searchInput}
            />
          </View>

          <View style={styles.filtersContainer}>
            <View style={styles.filterItem}>
              <Picker
                selectedValue={selectedCategory}
                onValueChange={setSelectedCategory}
                style={styles.filterPicker}
              >
                {categories.map(category => (
                  <Picker.Item key={category.id} label={category.name} value={category.id} />
                ))}
              </Picker>
            </View>
            
            <View style={styles.filterItem}>
              <Picker
                selectedValue={selectedCity}
                onValueChange={setSelectedCity}
                style={styles.filterPicker}
              >
                {cities.map(city => (
                  <Picker.Item key={city.id} label={city.name} value={city.id} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {filteredProducts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyTitle}>Aucun produit trouvé</Text>
              <Text style={styles.emptySubtitle}>
                Essayez de modifier vos critères de recherche
              </Text>
            </View>
          ) : (
            filteredProducts.map(product => (
              <View key={product.id} style={styles.productCard}>
                <View style={styles.productContent}>
                  <Text style={styles.productEmoji}>{product.image}</Text>
                  <View style={styles.productInfo}>
                    <View style={styles.productHeader}>
                      <Text style={styles.productName}>{product.name}</Text>
                      <TouchableOpacity 
                        onPress={() => toggleFavorite(product.id)}
                        style={styles.favoriteButton}
                      >
                        <Ionicons 
                          name={favorites.includes(product.id) ? "heart" : "heart-outline"} 
                          size={24} 
                          color={favorites.includes(product.id) ? "#dc2626" : "#9ca3af"} 
                        />
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.farmerInfo}>
                      <Ionicons name="person" size={16} color="#9ca3af" />
                      <Text style={styles.farmerName}>{product.farmer}</Text>
                      <Ionicons name="location" size={16} color="#9ca3af" />
                      <Text style={styles.farmerLocation}>{product.location}</Text>
                    </View>

                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={16} color="#fbbf24" />
                      <Text style={styles.rating}>{product.rating}</Text>
                      <Text style={styles.reviews}>({product.reviews} avis)</Text>
                      {product.metadata.organic && (
                        <View style={styles.organicBadge}>
                          <Text style={styles.organicText}>🌿 Bio</Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.productFooter}>
                      <View>
                        <Text style={styles.productPriceBuyer}>
                          {product.price.toLocaleString()}
                          <Text style={styles.productUnit}> FCFA/{product.unit}</Text>
                        </Text>
                        <Text style={styles.stockText}>
                          Stock: {product.stock} {product.unit}
                        </Text>
                      </View>
                      
                      <TouchableOpacity 
                        onPress={() => showOrderModalForProduct(product)}
                        style={[
                          styles.orderButton,
                          product.stock === 0 && styles.orderButtonDisabled
                        ]}
                        disabled={product.stock === 0}
                      >
                        <Text style={[
                          styles.orderButtonText,
                          product.stock === 0 && styles.orderButtonTextDisabled
                        ]}>
                          {product.stock === 0 ? 'Épuisé' : 'Commander'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    );
  } 
  
  // Vue Administrateur
  else if (user?.type === 'admin') {
    const stats = getStats();
    
    return (
      <View style={styles.container}>
        <Header 
          title="👑 Administration" 
          showBackButton={false}
          onBack={onBack}
          onHome={onHome}
          screenHistory={screenHistory}
          currentScreen={currentScreen}
          user={user}
        />
        
        <View style={styles.adminHeader}>
          <Text style={styles.adminSubtitle}>Vue d'ensemble de la plateforme</Text>
          
          <View style={styles.adminStats}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalProducts || 0}</Text>
              <Text style={styles.statLabel}>Produits</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalOrders || 0}</Text>
              <Text style={styles.statLabel}>Commandes</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalFarmers || 0}</Text>
              <Text style={styles.statLabel}>Agriculteurs</Text>
            </View>
          </View>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={styles.adminCard}>
            <View style={styles.adminCardHeader}>
              <Text style={styles.adminCardTitle}>Revenus totaux</Text>
              <Text style={styles.revenueAmount}>
                {(stats.totalRevenue || 0).toLocaleString()} FCFA
              </Text>
            </View>
          </View>

          <View style={styles.adminCard}>
            <Text style={styles.adminCardTitle}>Produits récents</Text>
            <View>
              {products.slice(0, 5).map(product => (
                <View key={product.id} style={styles.adminProductItem}>
                  <View style={styles.adminProductInfo}>
                    <Text style={styles.adminProductEmoji}>{product.image}</Text>
                    <View>
                      <Text style={styles.adminProductName}>{product.name}</Text>
                      <Text style={styles.adminProductFarmer}>{product.farmer}</Text>
                    </View>
                  </View>
                  <View style={styles.adminProductDetails}>
                    <Text style={styles.adminProductPrice}>
                      {product.price.toLocaleString()} FCFA
                    </Text>
                    <Text style={styles.adminProductStock}>
                      Stock: {product.stock} {product.unit}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.adminCard}>
            <Text style={styles.adminCardTitle}>Commandes en attente</Text>
            <Text style={styles.pendingOrders}>
              {stats.pendingOrders || 0} commande{(stats.pendingOrders || 0) > 1 ? 's' : ''} en attente
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  headerSection: {
    backgroundColor: '#16a34a',
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  marketplaceHeader: {
    backgroundColor: '#2563eb',
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  adminHeader: {
    backgroundColor: '#7c3aed',
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  adminSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    marginBottom: 20,
  },
  statsContainer: {
    alignItems: 'flex-end',
  },
  statsLabel: {
    fontSize: 12,
    color: 'white',
    opacity: 0.9,
  },
  statsNumber: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  adminStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1f2937',
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  filterItem: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  filterPicker: {
    height: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 100, // Space for bottom navigation
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  productContent: {
    flexDirection: 'row',
  },
  productEmoji: {
    fontSize: 50,
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    color: '#1f2937',
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#dbeafe',
    padding: 10,
    borderRadius: 12,
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
    padding: 10,
    borderRadius: 12,
  },
  favoriteButton: {
    padding: 8,
    borderRadius: 20,
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  productPriceBuyer: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  productUnit: {
    fontSize: 14,
    color: '#6b7280',
  },
  stockInfo: {
    alignItems: 'flex-end',
  },
  stockLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  stockValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  stockEmpty: {
    color: '#dc2626',
  },
  stockText: {
    fontSize: 14,
    color: '#6b7280',
  },
  productMeta: {
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#6b7280',
  },
  organicBadge: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '600',
  },
  farmerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  farmerName: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 12,
  },
  farmerLocation: {
    fontSize: 14,
    color: '#6b7280',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  reviews: {
    fontSize: 14,
    color: '#6b7280',
  },
  organicText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '600',
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  orderButtonDisabled: {
    backgroundColor: '#f3f4f6',
  },
  orderButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  orderButtonTextDisabled: {
    color: '#9ca3af',
  },
  adminCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  adminCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adminCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1f2937',
  },
  revenueAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  pendingOrders: {
    fontSize: 16,
    color: '#f59e0b',
    fontWeight: '600',
  },
  adminProductItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    marginBottom: 12,
  },
  adminProductInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  adminProductEmoji: {
    fontSize: 24,
  },
  adminProductName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  adminProductFarmer: {
    fontSize: 14,
    color: '#6b7280',
  },
  adminProductDetails: {
    alignItems: 'flex-end',
  },
  adminProductPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  adminProductStock: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default HomeScreen;