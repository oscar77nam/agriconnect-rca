import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAgriConnect } from './hooks/useAgriConnect';
import WelcomeScreen from './components/screens/WelcomeScreen';
import RegisterScreen from './components/screens/RegisterScreen';
import HomeScreen from './components/screens/HomeScreen';
import OrdersScreen from './components/screens/OrdersScreen';
import NotificationsScreen from './components/screens/NotificationsScreen';
import ProfileScreen from './components/screens/ProfileScreen';
import BottomNav from './components/common/BottomNav';
import ProductForm from './components/common/ProductForm';

const AgriConnectRCA = () => {
  const {
    // States
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
    
    // Setters
    setSearchTerm,
    setSelectedCategory,
    setSelectedCity,
    setShowAddProduct,
    setEditingProduct,
    
    // Actions
    navigateToScreen,
    goBack,
    goHome,
    handleRegister,
    addProduct,
    updateProduct,
    deleteProduct,
    getUserOrders,
    addToCart,
    toggleFavorite,
    getStats
  } = useAgriConnect();

  // Props communes pour tous les écrans
  const commonScreenProps = {
    user,
    onBack: goBack,
    onHome: goHome,
    screenHistory,
    currentScreen
  };

  // Props pour les écrans avec navigation
  const navigationProps = {
    onNavigate: navigateToScreen,
    ...commonScreenProps
  };

  // ========== RENDU PRINCIPAL ==========
  if (!user) {
    return (
      <View style={styles.container}>
        {currentScreen === 'register' ? (
          <RegisterScreen 
            onRegister={handleRegister}
            {...commonScreenProps}
          />
        ) : (
          <WelcomeScreen onNavigate={navigateToScreen} />
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ========== MODALS ========== */}
      {showAddProduct && (
        <ProductForm 
          onSubmit={addProduct}
          onCancel={() => setShowAddProduct(false)}
        />
      )}
      
      {editingProduct && (
        <ProductForm 
          product={editingProduct}
          onSubmit={(data) => updateProduct(editingProduct.id, data)}
          onCancel={() => setEditingProduct(null)}
        />
      )}

      {/* ========== ÉCRANS PRINCIPAUX ========== */}
      {currentScreen === 'home' && (
        <HomeScreen 
          filteredProducts={filteredProducts}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedCity={selectedCity}
          setSelectedCity={setSelectedCity}
          categories={categories}
          cities={cities}
          favorites={favorites}
          setShowAddProduct={setShowAddProduct}
          setEditingProduct={setEditingProduct}
          deleteProduct={deleteProduct}
          getUserOrders={getUserOrders}
          addToCart={addToCart}
          toggleFavorite={toggleFavorite}
          products={products}
          orders={orders}
          getStats={getStats}
          {...commonScreenProps}
        />
      )}
      
      {currentScreen === 'orders' && (
        <OrdersScreen 
          getUserOrders={getUserOrders}
          {...commonScreenProps}
        />
      )}
      
      {currentScreen === 'notifications' && (
        <NotificationsScreen 
          notifications={notifications}
          {...commonScreenProps}
        />
      )}
      
      {currentScreen === 'profile' && (
        <ProfileScreen 
          getStats={getStats}
          {...commonScreenProps}
        />
      )}

      {/* ========== ÉCRANS SUPPLÉMENTAIRES ========== */}
      {currentScreen === 'favorites' && (
        <FavoritesScreen 
          products={products}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          addToCart={addToCart}
          {...commonScreenProps}
        />
      )}

      {currentScreen === 'cart' && (
        <CartScreen 
          {...commonScreenProps}
        />
      )}

      {/* ========== NAVIGATION DU BAS ========== */}
      <BottomNav 
        user={user}
        currentScreen={currentScreen}
        onNavigate={navigateToScreen}
        setShowAddProduct={setShowAddProduct}
      />
    </View>
  );
};

// ========== ÉCRANS SUPPLÉMENTAIRES ==========

// Écran Favoris (simple)
const FavoritesScreen = ({ products, favorites, toggleFavorite, addToCart, ...props }) => {
  const favoriteProducts = products.filter(p => favorites.includes(p.id));
  
  return (
    <HomeScreen 
      {...props}
      filteredProducts={favoriteProducts}
      favorites={favorites}
      toggleFavorite={toggleFavorite}
      addToCart={addToCart}
      products={products}
      // Props vides pour désactiver la recherche
      searchTerm=""
      setSearchTerm={() => {}}
      selectedCategory="tous"
      setSelectedCategory={() => {}}
      selectedCity="tous"
      setSelectedCity={() => {}}
      categories={[]}
      cities={[]}
    />
  );
};

// Écran Panier (simple placeholder)
const CartScreen = (props) => {
  return (
    <View style={styles.container}>
      <Header title="🛒 Mon Panier" {...props} />
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>Panier vide</Text>
        <Text style={styles.emptySubtext}>Ajoutez des produits depuis le marketplace</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default AgriConnectRCA;