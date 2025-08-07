import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAgriConnect } from './hooks/useAgriConnect';
import WelcomeScreen from './components/screens/WelcomeScreen';
import LoginScreen from './components/screens/LoginScreen';
import RegisterScreen from './components/screens/RegisterScreen';
import HomeScreen from './components/screens/HomeScreen';
import OrdersScreen from './components/screens/OrdersScreen';
import NotificationsScreen from './components/screens/NotificationsScreen';
import ProfileScreen from './components/screens/ProfileScreen';
import CartScreen from './components/screens/CartScreen';
import FavoritesScreen from './components/screens/FavoritesScreen';
import ProductsScreen from './components/screens/ProductsScreen';
import SettingsScreen from './components/screens/SettingsScreen';
import BottomNav from './components/common/BottomNav';
import ProductForm from './components/common/ProductForm';
import ConnectionStatus from './components/common/ConnectionStatus';
// Temporairement commenté pour debug
// import OrderModal from './components/common/OrderModal';

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
    cart,
    showOrderModal,
    orderingProduct,
    loading,
    isOnline,
    
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
    handleLogin,
    logout,
    addProduct,
    updateProduct,
    deleteProduct,
    getUserOrders,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    checkout,
    toggleFavorite,
    getStats,
    getCartTotal,
    getCartItemsCount,
    showOrderModalForProduct,
    hideOrderModal,
    handleOrderConfirm,
    clearAllNotifications,
    addNotification
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
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingEmoji}>🌾</Text>
        <Text style={styles.loadingText}>AgriConnect RCA</Text>
        <Text style={styles.loadingSubtext}>Chargement en cours...</Text>
        {!isOnline && (
          <Text style={styles.offlineText}>Mode hors ligne</Text>
        )}
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        {currentScreen === 'register' ? (
          <RegisterScreen 
            onRegister={handleRegister}
            onNavigate={navigateToScreen}
            loading={loading}
            {...commonScreenProps}
          />
        ) : currentScreen === 'login' ? (
          <LoginScreen 
            onLogin={handleLogin}
            onNavigate={navigateToScreen}
            loading={loading}
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
      {/* Indicateur de statut de connexion */}
      <ConnectionStatus isOnline={isOnline} loading={loading} />
      
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

      {/* MODAL DE COMMANDE - Temporairement désactivé pour debug
      {showOrderModal && (
        <OrderModal 
          visible={showOrderModal}
          product={orderingProduct}
          user={user}
          onClose={hideOrderModal}
          onConfirm={handleOrderConfirm}
        />
      )}
      */}

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
          showOrderModalForProduct={showOrderModalForProduct}
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
          clearAllNotifications={clearAllNotifications}
          {...commonScreenProps}
        />
      )}
      
      {currentScreen === 'profile' && (
        <ProfileScreen 
          getStats={getStats}
          logout={logout}
          onNavigate={navigateToScreen}
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
          showOrderModalForProduct={showOrderModalForProduct}
          {...commonScreenProps}
        />
      )}

      {currentScreen === 'cart' && (
        <CartScreen 
          cart={cart}
          updateCartQuantity={updateCartQuantity}
          removeFromCart={removeFromCart}
          clearCart={clearCart}
          checkout={checkout}
          getCartTotal={getCartTotal}
          {...commonScreenProps}
        />
      )}

      {currentScreen === 'products' && (
        <ProductsScreen 
          products={products}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedCity={selectedCity}
          setSelectedCity={setSelectedCity}
          categories={categories}
          cities={cities}
          filteredProducts={filteredProducts}
          {...commonScreenProps}
        />
      )}

      {currentScreen === 'settings' && (
        <SettingsScreen 
          {...commonScreenProps}
        />
      )}

      {/* ========== NAVIGATION DU BAS ========== */}
      <BottomNav 
        user={user}
        currentScreen={currentScreen}
        onNavigate={navigateToScreen}
        setShowAddProduct={setShowAddProduct}
        getCartItemsCount={getCartItemsCount}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#16a34a',
  },
  loadingEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    marginBottom: 16,
  },
  offlineText: {
    fontSize: 14,
    color: '#fbbf24',
    fontWeight: '600',
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
});

export default AgriConnectRCA;