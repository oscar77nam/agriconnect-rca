import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BottomNav = ({ 
  user, 
  currentScreen, 
  onNavigate, 
  setShowAddProduct,
  getCartItemsCount 
}) => {
  const getNavItems = () => {
    if (user?.type === 'farmer') {
      return [
        { screen: 'home', icon: 'storefront', label: 'Produits' },
        { screen: 'add-product', icon: 'add-circle', label: 'Ajouter', special: true },
        { screen: 'orders', icon: 'receipt', label: 'Commandes' },
        { screen: 'notifications', icon: 'notifications', label: 'Alertes' },
        { screen: 'profile', icon: 'person-circle', label: 'Profil' }
      ];
    } else if (user?.type === 'buyer') {
      return [
        { screen: 'home', icon: 'search-circle', label: 'Explorer' },
        { screen: 'favorites', icon: 'heart', label: 'Favoris' },
        { screen: 'cart', icon: 'bag-handle', label: 'Panier', badge: getCartItemsCount && getCartItemsCount() },
        { screen: 'orders', icon: 'receipt', label: 'Achats' },
        { screen: 'profile', icon: 'person-circle', label: 'Profil' }
      ];
    } else if (user?.type === 'admin') {
      return [
        { screen: 'home', icon: 'analytics', label: 'Dashboard' },
        { screen: 'products', icon: 'cube', label: 'Produits' },
        { screen: 'orders', icon: 'receipt', label: 'Commandes' },
        { screen: 'notifications', icon: 'notifications', label: 'Alertes' },
        { screen: 'profile', icon: 'person-circle', label: 'Profil' }
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  return (
    <View style={styles.container}>
      <View style={styles.navContainer}>
        {navItems.map(({ screen, icon, label, special, badge }) => (
          <TouchableOpacity
            key={screen}
            onPress={() => {
              if (screen === 'add-product') {
                setShowAddProduct(true);
              } else {
                onNavigate(screen);
              }
            }}
            style={[
              styles.navItem,
              currentScreen === screen && styles.navItemActive,
              special && styles.navItemSpecial
            ]}
          >
            <View style={styles.iconContainer}>
              <Ionicons 
                name={icon} 
                size={24} 
                color={
                  special ? 'white' :
                  currentScreen === screen ? '#16a34a' : '#6b7280'
                } 
              />
              {badge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badge}</Text>
                </View>
              )}
            </View>
            <Text style={[
              styles.navLabel,
              currentScreen === screen && styles.navLabelActive,
              special && styles.navLabelSpecial
            ]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 8,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  navItem: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 60,
    flex: 1,
  },
  navItemActive: {
    backgroundColor: '#f0fdf4',
    transform: [{ scale: 1.05 }],
  },
  navItemSpecial: {
    backgroundColor: '#16a34a',
    transform: [{ scale: 1.1 }],
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#dc2626',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  navLabelActive: {
    color: '#16a34a',
    fontWeight: '600',
  },
  navLabelSpecial: {
    color: 'white',
    fontWeight: '600',
  },
});

export default BottomNav;