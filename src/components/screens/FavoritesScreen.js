import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../common/Header';

const FavoritesScreen = ({ 
  user,
  products,
  favorites,
  toggleFavorite,
  addToCart,
  showOrderModalForProduct,
  onBack,
  onHome,
  screenHistory,
  currentScreen
}) => {
  const favoriteProducts = products.filter(product => favorites.includes(product.id));

  return (
    <View style={styles.container}>
      <Header 
        title="❤️ Mes Favoris"
        onBack={onBack}
        onHome={onHome}
        screenHistory={screenHistory}
        currentScreen={currentScreen}
        user={user}
      />
      
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {favoriteProducts.length} produit{favoriteProducts.length > 1 ? 's' : ''} favori{favoriteProducts.length > 1 ? 's' : ''}
        </Text>
      </View>
      
      {favoriteProducts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={80} color="#d1d5db" />
          <Text style={styles.emptyTitle}>Aucun favori</Text>
          <Text style={styles.emptySubtext}>
            Ajoutez des produits à vos favoris en cliquant sur ❤️
          </Text>
          <TouchableOpacity 
            onPress={onHome}
            style={styles.exploreButton}
          >
            <Text style={styles.exploreButtonText}>🔍 Explorer les produits</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {favoriteProducts.map(product => (
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
                        name="heart" 
                        size={24} 
                        color="#dc2626" 
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
                  </View>
                  
                  <View style={styles.productFooter}>
                    <View>
                      <Text style={styles.productPrice}>
                        {product.price.toLocaleString()}
                        <Text style={styles.productUnit}> FCFA/{product.unit}</Text>
                      </Text>
                      <Text style={styles.stockText}>
                        Stock: {product.stock} {product.unit}
                      </Text>
                      {product.metadata.organic && (
                        <View style={styles.organicBadge}>
                          <Text style={styles.organicText}>🌿 Bio</Text>
                        </View>
                      )}
                    </View>
                    
                    <TouchableOpacity 
                      onPress={() => showOrderModalForProduct(product)}
                      style={[
                        styles.addToCartButton,
                        product.stock === 0 && styles.addToCartButtonDisabled
                      ]}
                      disabled={product.stock === 0}
                    >
                      <Ionicons 
                        name="bag-add" 
                        size={20} 
                        color={product.stock === 0 ? '#9ca3af' : 'white'} 
                      />
                      <Text style={[
                        styles.addToCartText,
                        product.stock === 0 && styles.addToCartTextDisabled
                      ]}>
                        {product.stock === 0 ? 'Épuisé' : 'Commander'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#dc2626',
    padding: 24,
  },
  headerText: {
    color: 'white',
    fontSize: 16,
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  exploreButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 18,
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
    marginBottom: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  favoriteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#fef2f2',
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
    color: '#374151',
    marginRight: 8,
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
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 4,
  },
  productUnit: {
    fontSize: 14,
    color: '#6b7280',
  },
  stockText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  organicBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  organicText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '600',
  },
  addToCartButton: {
    backgroundColor: '#dc2626',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  addToCartButtonDisabled: {
    backgroundColor: '#f3f4f6',
  },
  addToCartText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  addToCartTextDisabled: {
    color: '#9ca3af',
  },
});

export default FavoritesScreen;