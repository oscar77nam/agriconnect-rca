// App.js
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import useAgriConnect from './src/hooks/useAgriConnect';

// écrans
import WelcomeScreen from './src/components/screens/WelcomeScreen';
import LoginScreen from './src/components/screens/LoginScreen';
import RegisterScreen from './src/components/screens/RegisterScreen';
import HomeScreen from './src/components/screens/HomeScreen';
import ProductsScreen from './src/components/screens/ProductsScreen';
import ProfileScreen from './src/components/screens/ProfileScreen';
import CartScreen from './src/components/screens/CartScreen';
import FavoritesScreen from './src/components/screens/FavoritesScreen';
import OrdersScreen from './src/components/screens/OrdersScreen';
import NotificationsScreen from './src/components/screens/NotificationsScreen';
import SettingsScreen from './src/components/screens/SettingsScreen';

// agriculteur
import FarmerProductsScreen from './src/components/screens/FarmerProductsScreen';
import FarmerDashboardScreen from './src/components/screens/FarmerDashboardScreen';
import SalesHistoryScreen from './src/components/screens/SalesHistoryScreen';

// admin & autres
import AdminDashboardScreen from './src/components/screens/AdminDashboardScreen';
import ProductDetailsScreen from './src/components/screens/ProductDetailsScreen';
import UsersScreen from './src/components/screens/UsersScreen';

// nouveau: formulaire produit
import ProductForm from './src/components/common/ProductForm';

export default function App() {
  const {
    // état & nav
    user, loading, currentScreen, screenHistory,
    navigateToScreen, goBack, goHome, goNext, logout,

    // catalogue
    products, filteredProducts,
    searchTerm, setSearchTerm,
    selectedCategory, setSelectedCategory,
    selectedCity, setSelectedCity,
    refetchProducts,

    // actions produits
    addProduct, updateProduct, deleteProduct,

    // panier & commandes
    cart, favorites, orders, notifications,
    addToCart, updateCartQuantity, removeFromCart, clearCart,
    checkout, getUserOrders,

    // auth
    handleLogin, handleRegister,

    // farmer
    farmerProducts, onSellProduct, getFarmerStats, getRecentSales, getTopProducts,

    // admin users
    users, refreshUsers, updateUser, toggleUserActive, deleteUser, resetUserPassword,
  } = useAgriConnect();

  const [selectedProduct, setSelectedProduct] = React.useState(null);
  const [editingProduct, setEditingProduct] = React.useState(null);

  const onNavigate = (screen, params) => {
    if (screen === 'productDetails' && params?.product) setSelectedProduct(params.product);
    if (screen === 'productForm' && params?.product) setEditingProduct(params.product);
    navigateToScreen(screen);
  };

  // Props communs envoyés à chaque écran
  const commonProps = { 
    user, 
    onBack: goBack, 
    onHome: goHome, 
    onNext: goNext, 
    onLogout: logout,
    onNavigate, 
    screenHistory, 
    currentScreen 
  };

  const render = () => {
    if (loading) return <View style={{ flex: 1, backgroundColor: '#fff' }} />;

    switch (currentScreen) {
      case 'welcome': return <WelcomeScreen {...commonProps} />;
      case 'login': return <LoginScreen {...commonProps} onLogin={handleLogin} />;
      case 'register': return <RegisterScreen {...commonProps} onRegister={handleRegister} />;

      case 'home': return <HomeScreen {...commonProps} products={products} />;

      case 'products': 
        return (
          <ProductsScreen
            {...commonProps}
            products={products}
            filteredProducts={filteredProducts}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            addToCart={addToCart}
            toggleFavorite={() => {}}
            onOpenProduct={setSelectedProduct}
            cart={cart}
          />
        );

      case 'productDetails':
        return (
          <ProductDetailsScreen
            {...commonProps}
            product={selectedProduct}
            addToCart={addToCart}
            toggleFavorite={() => {}}
          />
        );

      case 'productForm':
        return (
          <ProductForm
            {...commonProps}
            product={editingProduct}
            onAddProduct={addProduct}
            onUpdateProduct={(p) => updateProduct(p.id, p)}
          />
        );

      case 'cart':
        return (
          <CartScreen
            {...commonProps}
            cart={cart}
            updateCartQuantity={updateCartQuantity}
            removeFromCart={removeFromCart}
            clearCart={clearCart}
            checkout={checkout}
          />
        );

      case 'favorites': return <FavoritesScreen {...commonProps} favorites={favorites} />;
      case 'orders': return <OrdersScreen {...commonProps} getUserOrders={getUserOrders} />;
      case 'notifications': return <NotificationsScreen {...commonProps} notifications={notifications} getUnreadNotificationsCount={() => 0} />;
      case 'settings': return <SettingsScreen {...commonProps} />;

      // AGRICULTEUR
      case 'farmerDashboard': 
        return (
          <FarmerDashboardScreen
            {...commonProps}
            stats={getFarmerStats()}
            recentSales={getRecentSales()}
            topProducts={getTopProducts()}
            products={farmerProducts}
          />
        );

      case 'farmerProducts':
        return (
          <FarmerProductsScreen
            {...commonProps}
            products={farmerProducts}
            onAddProduct={() => onNavigate('productForm')}
            onUpdateProduct={(prod) => onNavigate('productForm', { product: prod })}
            onDeleteProduct={deleteProduct}
            onSellProduct={(id, qty) => onSellProduct(id, qty)}
          />
        );

      case 'salesHistory': return <SalesHistoryScreen {...commonProps} recentSales={getRecentSales()} />;

      // ADMIN
      case 'adminDashboard':
        return (
          <AdminDashboardScreen
            {...commonProps}
            stats={{
              totalProducts: products.length,
              totalOrders: orders.length,
              totalRevenue: orders.reduce((s, x) => s + (x.total || 0), 0),
            }}
            products={products}
            orders={orders}
            users={users}
          />
        );

      case 'users': 
        return (
          <UsersScreen
            {...commonProps}
            users={users}
            onUpdateUser={updateUser}
            onResetPassword={resetUserPassword}
            onToggleActive={toggleUserActive}
            onDeleteUser={async (id) => { await deleteUser(id); await refreshUsers(); }}
          />
        );

      default: return <HomeScreen {...commonProps} products={products} />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      {render()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
});
