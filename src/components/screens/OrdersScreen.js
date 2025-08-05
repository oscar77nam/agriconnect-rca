import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../common/Header';

const OrdersScreen = ({ 
  user,
  getUserOrders,
  onBack,
  onHome,
  screenHistory,
  currentScreen
}) => {
  const userOrders = getUserOrders();
  
  return (
    <View style={styles.container}>
      <Header 
        title="📦 Commandes"
        onBack={onBack}
        onHome={onHome}
        screenHistory={screenHistory}
        currentScreen={currentScreen}
        user={user}
      />
      <View style={styles.header}>
        <Text style={styles.headerText}>{userOrders.length} commandes</Text>
      </View>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {userOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="package" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>Aucune commande</Text>
          </View>
        ) : (
          <View>
            {userOrders.map(order => (
              <View key={order.id} style={styles.orderCard}>
                <Text style={styles.orderTitle}>{order.product_name}</Text>
                <Text style={styles.orderSubtitle}>
                  {user?.type === 'farmer' 
                    ? `Commandé par ${order.buyer_name}`
                    : `Vendu par ${order.farmer_name}`
                  }
                </Text>
                <View style={styles.orderFooter}>
                  <Text style={styles.orderQuantity}>Quantité: {order.quantity} kg</Text>
                  <Text style={styles.orderTotal}>{order.total.toLocaleString()} FCFA</Text>
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
    backgroundColor: '#f97316',
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
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  orderCard: {
   backgroundColor: 'white',
   borderRadius: 16,
   padding: 24,
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
 orderTitle: {
   fontSize: 18,
   fontWeight: '600',
   marginBottom: 4,
 },
 orderSubtitle: {
   fontSize: 14,
   color: '#6b7280',
   marginBottom: 12,
 },
 orderFooter: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   alignItems: 'center',
 },
 orderQuantity: {
   fontSize: 14,
   color: '#6b7280',
 },
 orderTotal: {
   fontSize: 18,
   fontWeight: 'bold',
   color: '#16a34a',
 },
});

export default OrdersScreen;