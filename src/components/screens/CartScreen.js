import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../common/Header';

const CartScreen = ({ 
  user,
  cart,
  onBack,
  onHome,
  screenHistory,
  currentScreen,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  checkout,
  getCartTotal
}) => {
  const handleCheckout = () => {
    if (cart.length === 0) {
      Alert.alert('Panier vide', 'Ajoutez des produits avant de passer commande.');
      return;
    }

    Alert.alert(
      'Confirmer la commande',
      `Total: ${getCartTotal().toLocaleString()} FCFA\n\nVoulez-vous passer cette commande ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Commander', 
          style: 'default',
          onPress: () => checkout()
        }
      ]
    );
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;

    Alert.alert(
      'Vider le panier',
      'Êtes-vous sûr de vouloir vider votre panier ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Vider', 
          style: 'destructive',
          onPress: () => clearCart()
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header 
        title="🛒 Mon Panier"
        onBack={onBack}
        onHome={onHome}
        screenHistory={screenHistory}
        currentScreen={currentScreen}
        user={user}
      />
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerText}>
            {cart.length} article{cart.length > 1 ? 's' : ''} dans votre panier
          </Text>
          {cart.length > 0 && (
            <TouchableOpacity onPress={handleClearCart} style={styles.clearButton}>
              <Ionicons name="trash-outline" size={20} color="#dc2626" />
              <Text style={styles.clearButtonText}>Vider</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {cart.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="bag-outline" size={80} color="#d1d5db" />
          <Text style={styles.emptyTitle}>Votre panier est vide</Text>
          <Text style={styles.emptySubtext}>
            Explorez le marketplace pour trouver des produits frais
          </Text>
          <TouchableOpacity 
            onPress={onHome}
            style={styles.shopButton}
          >
            <Text style={styles.shopButtonText}>🛒 Faire mes courses</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
            {cart.map(({ product, quantity }) => (
              <View key={product.id} style={styles.cartItem}>
                <View style={styles.itemContent}>
                  <Text style={styles.productEmoji}>{product.image}</Text>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.farmerName}>Par {product.farmer}</Text>
                    <Text style={styles.productPrice}>
                      {product.price.toLocaleString()} FCFA/{product.unit}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    onPress={() => updateCartQuantity(product.id, quantity - 1)}
                    style={styles.quantityButton}
                  >
                    <Ionicons name="remove" size={20} color="#374151" />
                  </TouchableOpacity>
                  
                  <View style={styles.quantityDisplay}>
                    <Text style={styles.quantityText}>{quantity}</Text>
                  </View>
                  
                  <TouchableOpacity
                    onPress={() => updateCartQuantity(product.id, quantity + 1)}
                    style={styles.quantityButton}
                    disabled={quantity >= product.stock}
                  >
                    <Ionicons 
                      name="add" 
                      size={20} 
                      color={quantity >= product.stock ? '#d1d5db' : '#374151'} 
                    />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.itemFooter}>
                  <Text style={styles.itemTotal}>
                    {(product.price * quantity).toLocaleString()} FCFA
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeFromCart(product.id)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="trash" size={18} color="#dc2626" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
          
          <View style={styles.footer}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total à payer</Text>
              <Text style={styles.totalAmount}>
                {getCartTotal().toLocaleString()} FCFA
              </Text>
            </View>
            
            <TouchableOpacity
              onPress={handleCheckout}
              style={styles.checkoutButton}
            >
              <Ionicons name="card" size={24} color="white" />
              <Text style={styles.checkoutButtonText}>
                Passer commande ({cart.length})
              </Text>
            </TouchableOpacity>
          </View>
        </>
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
    backgroundColor: '#2563eb',
    padding: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 16,
    opacity: 0.9,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  clearButtonText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 180,
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
  shopButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  shopButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cartItem: {
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
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  productEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  farmerName: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 16,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityDisplay: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },
  itemTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  removeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#fee2e2',
  },
  footer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  checkoutButton: {
    backgroundColor: '#16a34a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CartScreen;