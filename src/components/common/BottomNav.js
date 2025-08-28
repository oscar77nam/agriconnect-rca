import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const BottomNav = ({ 
  user, 
  currentScreen, 
  onNavigate, 
  setShowAddProduct,
  getCartItemsCount,
  getPendingOrdersCount,
  showOrderSummaryModal
}) => {
  const cartItemsCount = getCartItemsCount ? getCartItemsCount() : 0;
  const pendingOrdersCount = getPendingOrdersCount ? getPendingOrdersCount() : 0;

  const handleAddProductPress = () => {
    if (setShowAddProduct) {
      setShowAddProduct(true);
    }
  };

  const handleOrdersPress = () => {
    if (pendingOrdersCount > 0 && showOrderSummaryModal) {
      // S'il y a des commandes en attente, afficher le récapitulatif
      showOrderSummaryModal();
    } else {
      // Sinon, aller à l'écran des commandes validées
      onNavigate('orders');
    }
  };

  const NavButton = ({ screen, icon, label, onPress, badge, badgeColor }) => {
    const isActive = currentScreen === screen;
    
    return (
      <TouchableOpacity 
        style={styles.navButton} 
        onPress={onPress || (() => onNavigate(screen))}
      >
        <View style={styles.iconContainer}>
          <Text style={[styles.navIcon, isActive && styles.navIconActive]}>
            {icon}
          </Text>
          {badge > 0 && (
            <View style={[styles.badge, { backgroundColor: badgeColor || '#ef4444' }]}>
              <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <NavButton 
        screen="home" 
        icon="🏠" 
        label="Explorer" 
      />

      {user?.type === 'buyer' && (
        <NavButton 
          screen="favorites" 
          icon="❤️" 
          label="Favoris" 
        />
      )}

      {user?.type === 'farmer' && (
        <TouchableOpacity style={styles.addButton} onPress={handleAddProductPress}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      )}

      {user?.type === 'buyer' && (
        <NavButton 
          screen="cart" 
          icon="🛒" 
          label="Panier" 
          badge={cartItemsCount}
          badgeColor="#f59e0b"
        />
      )}

      <NavButton 
        screen="orders" 
        icon="📦" 
        label={pendingOrdersCount > 0 ? "Commandes" : "Achats"} 
        onPress={handleOrdersPress}
        badge={pendingOrdersCount}
        badgeColor="#16a34a"
      />

      <NavButton 
        screen="profile" 
        icon="👤" 
        label="Profil" 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  navIcon: {
    fontSize: 24,
    opacity: 0.6,
  },
  navIconActive: {
    opacity: 1,
  },
  navLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  navLabelActive: {
    color: '#16a34a',
    fontWeight: '600',
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    marginTop: -8,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default BottomNav;