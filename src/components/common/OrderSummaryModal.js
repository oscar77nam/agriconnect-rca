import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';

const OrderSummaryModal = ({
  visible,
  pendingOrders,
  onClose,
  onValidateAll,
  onRemoveOrder,
  loading
}) => {
  const totalAmount = pendingOrders.reduce((sum, order) => sum + order.totalPrice, 0);
  const totalItems = pendingOrders.length;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-CF', {
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleValidateAll = () => {
    Alert.alert(
      'Confirmer les commandes',
      `Voulez-vous valider ${totalItems} commande(s) pour un total de ${formatPrice(totalAmount)} FCFA ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Valider', 
          style: 'default',
          onPress: onValidateAll
        }
      ]
    );
  };

  const handleRemoveOrder = (order) => {
    Alert.alert(
      'Supprimer la commande',
      `Supprimer la commande de ${order.product.name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => onRemoveOrder(order.id)
        }
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🛒 Récapitulatif des commandes</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Summary info */}
        <View style={styles.summaryInfo}>
          <Text style={styles.summaryText}>
            {totalItems} commande(s) • Total: {formatPrice(totalAmount)} FCFA
          </Text>
        </View>

        {/* Orders list */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {pendingOrders.map((order, index) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View style={styles.orderNumber}>
                  <Text style={styles.orderNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.orderInfo}>
                  <Text style={styles.productName}>{order.product.name}</Text>
                  <Text style={styles.farmerName}>👨‍🌾 {order.product.farmer || order.product.farmer_name}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => handleRemoveOrder(order)}
                >
                  <Text style={styles.removeButtonText}>🗑️</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.orderDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Quantité:</Text>
                  <Text style={styles.detailValue}>
                    {order.quantity} {order.product.unit || 'kg'}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Prix unitaire:</Text>
                  <Text style={styles.detailValue}>
                    {formatPrice(order.unitPrice)} FCFA / {order.product.unit || 'kg'}
                  </Text>
                </View>

                <View style={[styles.detailRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Sous-total:</Text>
                  <Text style={styles.totalValue}>
                    {formatPrice(order.totalPrice)} FCFA
                  </Text>
                </View>

                {order.deliveryAddress && (
                  <View style={styles.addressSection}>
                    <Text style={styles.addressLabel}>📍 Adresse de livraison:</Text>
                    <Text style={styles.addressValue}>{order.deliveryAddress}</Text>
                  </View>
                )}

                {order.notes && (
                  <View style={styles.notesSection}>
                    <Text style={styles.notesLabel}>📝 Notes:</Text>
                    <Text style={styles.notesValue}>{order.notes}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}

          {pendingOrders.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>🛒</Text>
              <Text style={styles.emptyStateText}>Aucune commande en attente</Text>
            </View>
          )}
        </ScrollView>

        {/* Action buttons */}
        {pendingOrders.length > 0 && (
          <View style={styles.actionButtons}>
            <View style={styles.totalSummary}>
              <Text style={styles.totalSummaryText}>
                Total général: {formatPrice(totalAmount)} FCFA
              </Text>
            </View>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Continuer les achats</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.validateButton, loading ? styles.buttonDisabled : null]} 
                onPress={handleValidateAll}
                disabled={loading}
              >
                <Text style={styles.validateButtonText}>
                  {loading ? 'Validation...' : 'Valider toutes les commandes'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#16a34a',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryInfo: {
    backgroundColor: '#dcfce7',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#15803d',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  orderNumberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  orderInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 2,
  },
  farmerName: {
    fontSize: 14,
    color: '#6b7280',
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    fontSize: 18,
  },
  orderDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#374151',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  addressSection: {
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  addressValue: {
    fontSize: 14,
    color: '#374151',
  },
  notesSection: {
    backgroundColor: '#fffbeb',
    borderRadius: 6,
    padding: 10,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 4,
  },
  notesValue: {
    fontSize: 14,
    color: '#92400e',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
  },
  actionButtons: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    padding: 20,
    paddingBottom: 40,
  },
  totalSummary: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  totalSummaryText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6b7280',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  validateButton: {
    flex: 2,
    backgroundColor: '#16a34a',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  validateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OrderSummaryModal;