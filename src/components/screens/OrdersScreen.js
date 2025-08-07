import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
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
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#2563eb';
      case 'delivered': return '#16a34a';
      case 'cancelled': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return 'time';
      case 'confirmed': return 'checkmark-circle';
      case 'delivered': return 'checkmark-done-circle';
      case 'cancelled': return 'close-circle';
      default: return 'help-circle';
    }
  };

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
      
      <View style={[styles.header, { backgroundColor: user?.type === 'farmer' ? '#16a34a' : '#2563eb' }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerText}>
            {userOrders.length} commande{userOrders.length > 1 ? 's' : ''}
          </Text>
          <Text style={styles.headerSubtext}>
            {user?.type === 'farmer' ? 'Commandes reçues' : 'Mes achats'}
          </Text>
        </View>
      </View>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {userOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={80} color="#d1d5db" />
            <Text style={styles.emptyTitle}>Aucune commande</Text>
            <Text style={styles.emptySubtext}>
              {user?.type === 'farmer' 
                ? 'Vos commandes apparaîtront ici quand des clients achèteront vos produits'
                : 'Commencez vos achats sur le marketplace'
              }
            </Text>
            {user?.type !== 'farmer' && (
              <TouchableOpacity 
                onPress={onHome}
                style={styles.shopButton}
              >
                <Text style={styles.shopButtonText}>🛒 Explorer les produits</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View>
            {userOrders.map(order => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderTitle}>{order.product_name}</Text>
                    <Text style={styles.orderSubtitle}>
                      {user?.type === 'farmer' 
                        ? `Commandé par ${order.buyer_name}`
                        : `Vendu par ${order.farmer_name}`
                      }
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                    <Ionicons 
                      name={getStatusIcon(order.status)} 
                      size={16} 
                      color={getStatusColor(order.status)} 
                    />
                    <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                      {getStatusText(order.status)}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.orderDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons name="cube" size={16} color="#6b7280" />
                    <Text style={styles.detailText}>
                      Quantité: {order.quantity} kg
                    </Text>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <Ionicons name="cash" size={16} color="#6b7280" />
                    <Text style={styles.detailText}>
                      Prix unitaire: {order.unit_price.toLocaleString()} FCFA/kg
                    </Text>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <Ionicons name="calendar" size={16} color="#6b7280" />
                    <Text style={styles.detailText}>
                      Date: {new Date(order.created_at).toLocaleDateString('fr-FR')}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.orderFooter}>
                  <Text style={styles.orderTotal}>
                    Total: {order.total.toLocaleString()} FCFA
                  </Text>
                  
                  {user?.type === 'farmer' && order.status === 'pending' && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity style={styles.confirmButton}>
                        <Text style={styles.confirmButtonText}>Confirmer</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.rejectButton}>
                        <Text style={styles.rejectButtonText}>Refuser</Text>
                      </TouchableOpacity>
                    </View>
                  )}
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
    padding: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtext: {
    color: 'white',
    fontSize: 14,
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
    paddingVertical: 60,
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
    paddingHorizontal: 20,
    lineHeight: 24,
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
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderInfo: {
    flex: 1,
    marginRight: 12,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  orderSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },
  orderTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  confirmButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  rejectButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default OrdersScreen;