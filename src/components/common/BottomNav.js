import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BottomNav = ({ 
  user, 
  currentScreen, 
  onNavigate, 
  setShowAddProduct 
}) => {
  const getNavItems = () => {
    if (user?.type === 'farmer') {
      return [
        { screen: 'home', icon: 'package', label: 'Mes Produits' },
        { screen: 'add-product', icon: 'add', label: 'Ajouter', special: true },
        { screen: 'orders', icon: 'bag-handle', label: 'Commandes' },
        { screen: 'notifications', icon: 'notifications', label: 'Alertes' },
        { screen: 'profile', icon: 'person', label: 'Profil' }
      ];
    } else if (user?.type === 'buyer') {
      return [
        { screen: 'home', icon: 'search', label: 'Marketplace' },
        { screen: 'favorites', icon: 'heart', label: 'Favoris' },
        { screen: 'cart', icon: 'bag-handle', label: 'Panier' },
        { screen: 'orders', icon: 'package', label: 'Achats' },
        { screen: 'profile', icon: 'person', label: 'Profil' }
      ];
    } else if (user?.type === 'admin') {
      return [
        { screen: 'home', icon: 'eye', label: 'Admin' },
        { screen: 'products', icon: 'package', label: 'Produits' },
        { screen: 'orders', icon: 'bag-handle', label: 'Commandes' },
        { screen: 'notifications', icon: 'notifications', label: 'Alertes' },
        { screen: 'profile', icon: 'person', label: 'Profil' }
      ];
    }
    return [];
  };

  return (
    <View style={styles.container}>
      <View style={styles.navContainer}>
        {getNavItems().map(({ screen, icon, label, special }) => (
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
            <Ionicons 
              name={icon} 
              size={20} 
              color={
                special ? 'white' :
                currentScreen === screen ? '#16a34a' : '#6b7280'
              } 
            />
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
  },
  navItemActive: {
    backgroundColor: '#f0fdf4',
    transform: [{ scale: 1.1 }],
  },
  navItemSpecial: {
    backgroundColor: '#16a34a',
    transform: [{ scale: 1.1 }],
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  navLabelActive: {
    color: '#16a34a',
  },
  navLabelSpecial: {
    color: 'white',
  },
});

export default BottomNav;