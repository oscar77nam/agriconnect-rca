import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import Header from '../common/Header';

const ProductsScreen = ({ 
  user,
  products,
  filteredProducts,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedCity,
  setSelectedCity,
  categories,
  cities,
  onBack,
  onHome,
  screenHistory,
  currentScreen
}) => {
  return (
    <View style={styles.container}>
      <Header 
        title="📦 Gestion Produits"
        onBack={onBack}
        onHome={onHome}
        screenHistory={screenHistory}
        currentScreen={currentScreen}
        user={user}
      />
      
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} au total
        </Text>
      </View>
      
      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={styles.searchInput}
          />
        </View>

        <View style={styles.filterRow}>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Catégorie</Text>
            <View style={styles.pickerContainer}>
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
          </View>
          
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Ville</Text>
            <View style={styles.pickerContainer}>
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
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={80} color="#d1d5db" />
            <Text style={styles.emptyTitle}>Aucun produit trouvé</Text>
            <Text style={styles.emptySubtext}>
              Essayez de modifier vos filtres de recherche
            </Text>
          </View>
        ) : (
          <View style={styles.productsGrid}>
            {filteredProducts.map(product => (
              <View key={product.id} style={styles.productCard}>
                <View style={styles.productHeader}>
                  <Text style={styles.productEmoji}>{product.image}</Text>
                  <View style={styles.statusContainer}>
                    <View style={[
                      styles.statusBadge,
                      product.stock > 0 ? styles.statusAvailable : styles.statusOutOfStock
                    ]}>
                      <Text style={styles.statusText}>
                        {product.stock > 0 ? 'Disponible' : 'Épuisé'}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productCategory}>{product.category}</Text>
                  
                  <View style={styles.farmerInfo}>
                    <Ionicons name="person" size={14} color="#6b7280" />
                    <Text style={styles.farmerName}>{product.farmer}</Text>
                  </View>
                  
                  <View style={styles.locationInfo}>
                    <Ionicons name="location" size={14} color="#6b7280" />
                    <Text style={styles.locationText}>{product.location}</Text>
                  </View>
                  
                  <View style={styles.priceContainer}>
                    <Text style={styles.price}>
                      {product.price.toLocaleString()}
                      <Text style={styles.unit}> FCFA/{product.unit}</Text>
                    </Text>
                  </View>
                  
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Stock</Text>
                      <Text style={styles.statValue}>{product.stock} {product.unit}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Vendu</Text>
                      <Text style={styles.statValue}>{product.totalSold} {product.unit}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={16} color="#fbbf24" />
                    <Text style={styles.rating}>{product.rating}</Text>
                    <Text style={styles.reviews}>({product.reviews} avis)</Text>
                    {product.metadata.organic && (
                      <View style={styles.organicBadge}>
                        <Text style={styles.organicText}>🌿</Text>
                      </View>
                    )}
                  </View>
                  
                  <Text style={styles.harvestDate}>
                    Récolté le: {new Date(product.metadata.harvestDate).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#7c3aed',
    padding: 20,
  },
  headerText: {
    color: 'white',
    fontSize: 16,
    opacity: 0.9,
  },
  filtersContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  filterItem: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  filterPicker: {
    height: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  productsGrid: {
    gap: 16,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productEmoji: {
    fontSize: 40,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusAvailable: {
    backgroundColor: '#dcfce7',
  },
  statusOutOfStock: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  productInfo: {
    gap: 6,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  productCategory: {
    fontSize: 14,
    color: '#7c3aed',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  farmerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  farmerName: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    color: '#6b7280',
  },
  priceContainer: {
    marginVertical: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  unit: {
    fontSize: 14,
    color: '#6b7280',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  organicBadge: {
    marginLeft: 'auto',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  organicText: {
    fontSize: 16,
  },
  harvestDate: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
});

export default ProductsScreen;