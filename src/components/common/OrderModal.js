import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const OrderModal = ({ 
  visible, 
  product, 
  onClose, 
  onConfirm, 
  user 
}) => {
  const [quantity, setQuantity] = useState('1');
  const [deliveryAddress, setDeliveryAddress] = useState(user?.location || '');

  const numericQuantity = parseInt(quantity) || 0;
  const totalPrice = numericQuantity * (product?.price || 0);
  const isValidQuantity = numericQuantity > 0 && numericQuantity <= (product?.stock || 0);

  const handleConfirm = () => {
    if (!isValidQuantity) {
      Alert.alert('Erreur', 'Quantité invalide');
      return;
    }
    
    if (!deliveryAddress.trim()) {
      Alert.alert('Erreur', 'Adresse de livraison requise');
      return;
    }

    Alert.alert(
      'Confirmer la commande',
      `Êtes-vous sûr de vouloir commander ${numericQuantity} kg de ${product?.name} pour ${totalPrice.toLocaleString()} FCFA ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Confirmer', 
          onPress: () => {
            onConfirm(product, numericQuantity, deliveryAddress);
            handleClose();
          }
        }
      ]
    );
  };

  const handleClose = () => {
    setQuantity('1');
    setDeliveryAddress(user?.location || '');
    onClose();
  };

  const incrementQuantity = () => {
    const newQuantity = numericQuantity + 1;
    if (newQuantity <= (product?.stock || 0)) {
      setQuantity(newQuantity.toString());
    }
  };

  const decrementQuantity = () => {
    if (numericQuantity > 1) {
      setQuantity((numericQuantity - 1).toString());
    }
  };

  if (!product) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>📦 Passer commande</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Produit */}
          <View style={styles.productSection}>
            <View style={styles.productInfo}>
              <Text style={styles.productEmoji}>{product.image}</Text>
              <View style={styles.productDetails}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.farmerName}>Par {product.farmer}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.unitPrice}>
                    {product.price.toLocaleString()} FCFA/kg
                  </Text>
                  <Text style={styles.stockInfo}>
                    Stock: {product.stock} kg
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Quantité */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quantité (kg)</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                onPress={decrementQuantity}
                style={[styles.quantityButton, numericQuantity <= 1 && styles.quantityButtonDisabled]}
                disabled={numericQuantity <= 1}
              >
                <Ionicons name="remove" size={20} color={numericQuantity <= 1 ? '#9ca3af' : '#374151'} />
              </TouchableOpacity>
              
              <TextInput
                style={[styles.quantityInput, !isValidQuantity && styles.quantityInputError]}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                selectTextOnFocus
              />
              
              <TouchableOpacity
                onPress={incrementQuantity}
                style={[styles.quantityButton, numericQuantity >= product.stock && styles.quantityButtonDisabled]}
                disabled={numericQuantity >= product.stock}
              >
                <Ionicons name="add" size={20} color={numericQuantity >= product.stock ? '#9ca3af' : '#374151'} />
              </TouchableOpacity>
            </View>
            
            {!isValidQuantity && (
              <Text style={styles.errorText}>
                Quantité doit être entre 1 et {product.stock} kg
              </Text>
            )}
          </View>

          {/* Adresse de livraison */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Adresse de livraison</Text>
            <TextInput
              style={styles.addressInput}
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              placeholder="Entrez votre adresse de livraison"
              multiline
            />
          </View>

          {/* Récapitulatif */}
          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>📋 Récapitulatif</Text>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Produit:</Text>
              <Text style={styles.summaryValue}>{product.name}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Prix unitaire:</Text>
              <Text style={styles.summaryValue}>{product.price.toLocaleString()} FCFA/kg</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Quantité:</Text>
              <Text style={styles.summaryValue}>{numericQuantity} kg</Text>
            </View>
            
            <View style={styles.summaryDivider} />
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total à payer:</Text>
              <Text style={styles.totalValue}>
                {totalPrice.toLocaleString()} FCFA
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleConfirm}
              style={[styles.confirmButton, !isValidQuantity && styles.confirmButtonDisabled]}
              disabled={!isValidQuantity}
            >
              <Ionicons name="card" size={20} color="white" />
              <Text style={styles.confirmButtonText}>
                Commander ({totalPrice.toLocaleString()} FCFA)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
    borderRadius: 20,
  },
  productSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productEmoji: {
    fontSize: 50,
    marginRight: 16,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  farmerName: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  unitPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  stockInfo: {
    fontSize: 14,
    color: '#6b7280',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: '#f9fafb',
  },
  quantityInput: {
    width: 80,
    height: 44,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: 'white',
  },
  quantityInputError: {
    borderColor: '#dc2626',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  addressInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    textAlignVertical: 'top',
    minHeight: 60,
  },
  summarySection: {
    padding: 20,
    backgroundColor: '#f9fafb',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#d1d5db',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  confirmButton: {
    flex: 2,
    backgroundColor: '#16a34a',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default OrderModal;