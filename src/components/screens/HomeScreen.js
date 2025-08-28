import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../common/Header';

const { width } = Dimensions.get('window');

const HomeScreen = ({
  user,
  products,
  onNavigate,
  onBack,
  onHome,
  screenHistory,
  currentScreen,
  getStats
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const stats = getStats ? getStats() : {};

  // Redirection auto pour les agriculteurs
  useEffect(() => {
    if (user?.type === 'farmer') {
      onNavigate('farmerDashboard');
    }
  }, [user?.type]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.name || 'Utilisateur';
    if (hour < 12) return `🌅 Bonjour ${name}`;
    if (hour < 18) return `☀️ Bonjour ${name}`;
    return `🌙 Bonsoir ${name}`;
  };

  const getUserTypeEmoji = () => {
    switch (user?.type) {
      case 'farmer': return '👨‍🌾';
      case 'buyer': return '🛒';
      case 'admin': return '👑';
      default: return '👤';
    }
  };

  const filteredProducts = products?.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.title?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <View style={styles.container}>
      <Header 
        title="🏠 Accueil"
        onBack={onBack}
        onHome={onHome}
        onNext={() => navigateToScreen('products')}   // exemple: avancer vers Produits
        onLogout={logout}
        user={user}
      />


      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Carte de bienvenue */}
        <View style={styles.welcomeCard}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.welcomeSubtext}>
            {user?.type === 'farmer'
              ? 'Gérez votre production agricole efficacement'
              : user?.type === 'buyer'
                ? 'Découvrez les meilleurs produits locaux'
                : user?.type === 'admin'
                  ? 'Supervisez la plateforme AgriConnect'
                  : 'Bienvenue sur AgriConnect RCA'}
          </Text>
        </View>

        {/* Barre de recherche */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            placeholder="Rechercher des produits..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={styles.searchInput}
          />
        </View>

        {/* Produits en vedette */}
        <View style={styles.featuredSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🌟 Produits en vedette</Text>
            <TouchableOpacity onPress={() => onNavigate('products')}>
              <Text style={styles.seeAllLink}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredProductsContainer}
          >
            {filteredProducts.slice(0, 5).map(product => (
              <TouchableOpacity
                key={product.id}
                style={styles.featuredProductCard}
                onPress={() => onNavigate('productDetails', { product })}
              >
                <Text style={styles.productEmoji}>{product.image || product.emoji || '🥕'}</Text>
                <Text style={styles.productName} numberOfLines={1}>
                  {product.name || product.title}
                </Text>
                <Text style={styles.productPrice}>
                  {(product.price || 0).toLocaleString()} FCFA
                </Text>
                <Text style={styles.productLocation}>{product.location}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { flex: 1 },
  contentContainer: { padding: 20, paddingBottom: 100 },
  welcomeCard: {
    backgroundColor: '#16a34a',
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
  },
  greeting: { fontSize: 20, fontWeight: 'bold', color: 'white', marginBottom: 8 },
  welcomeSubtext: { fontSize: 14, color: 'rgba(255, 255, 255, 0.9)', lineHeight: 20 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  searchInput: { flex: 1, paddingVertical: 12, paddingLeft: 12, fontSize: 16 },
  featuredSection: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  seeAllLink: { fontSize: 14, color: '#2563eb', fontWeight: '600' },
  featuredProductsContainer: { paddingRight: 20 },
  featuredProductCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    width: 140,
    alignItems: 'center',
  },
  productEmoji: { fontSize: 40, marginBottom: 8 },
  productName: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 4, textAlign: 'center' },
  productPrice: { fontSize: 12, fontWeight: 'bold', color: '#16a34a', marginBottom: 2 },
  productLocation: { fontSize: 11, color: '#6b7280' },
});

export default HomeScreen;
