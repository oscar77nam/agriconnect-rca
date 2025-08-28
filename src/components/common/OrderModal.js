import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ScrollView
} from 'react-native';

const OrderModal = ({ 
  visible, 
  product, 
  onClose, 
  onConfirm,
  user 
}) => {
  const [quantity, setQuantity] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState(user?.location || '');
  const [notes, setNotes] = useState('');

  if (!product) return null;

  const unitPrice = product.price || 0;
  const totalPrice = unitPrice * quantity;
  const maxStock = product.stock || 0;

  const handleQuantityChange = (value) => {
    const numValue = parseInt(value) || 1;
    if (numValue > 0 && numValue <= maxStock) {
      setQuantity(numValue);
    } else if (numValue > maxStock) {
      Alert.alert('Stock insuffisant', `Maximum disponible: ${maxStock} ${product.unit || 'kg'}`);
    }
  };

  const incrementQuantity = () => {
    if (quantity < maxStock) {
      setQuantity(prev => prev + 1);
    } else {
      Alert.alert('Stock insuffisant', `Maximum disponible: ${maxStock} ${product.unit || 'kg'}`);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleConfirm = () => {
    if (!deliveryAddress.trim()) {
      Alert.alert('Adresse requise', 'Veuillez saisir une adresse de livraison');
      return;
    }

    if (quantity <= 0 || quantity > maxStock) {
      Alert.alert('Quantité invalide', `Veuillez choisir entre 1 et ${maxStock} ${product.unit || 'kg'}`);
      return;
    }

    onConfirm({
      product,
      quantity,
      deliveryAddress: deliveryAddress.trim(),
      notes: notes.trim(),
      unitPrice,
      totalPrice
    });

    // Reset du formulaire
    setQuantity(1);
    setDeliveryAddress(user?.location || '');
    setNotes('');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-CF', {
      minimumFractionDigits: 0
    }).format(price);
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
          <Text style={styles.headerTitle}>📦 Commander</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Informations produit */}
          <View style={styles.productCard}>
            <View style={styles.productImageContainer}>
              {product.image_url ? (
                <Image source={{ uri: product.image_url }} style={styles.productImage} />
              ) : (
                <View style={styles.productImagePlaceholder}>
                  <Text style={styles.productImageEmoji}>🌾</Text>
                </View>
              )}
              {product.organic && (
                <View style={styles.organicBadge}>
                  <Text style={styles.organicBadgeText}>🌱 BIO</Text>
                </View>
              )}
            </View>

            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productCategory}>{product.category}</Text>
              <Text style={styles.farmerInfo}>👨‍🌾 {product.farmer || product.farmer_name}</Text>
              <Text style={styles.locationInfo}>📍 {product.location || product.farmer_location}</Text>
              <Text style={styles.stockInfo}>Stock disponible: {maxStock} {product.unit || 'kg'}</Text>
            </View>
          </View>

          {/* Sélection de quantité */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quantité</Text>
            
            <View style={styles.quantityContainer}>
              <TouchableOpacity 
                style={[styles.quantityButton, quantity <= 1 ? styles.quantityButtonDisabled : null]}
                onPress={decrementQuantity}
                disabled={quantity <= 1}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              
              <TextInput
                style={styles.quantityInput}
                value={quantity.toString()}
                onChangeText={handleQuantityChange}
                keyboardType="numeric"
                textAlign="center"
              />
              
              <TouchableOpacity 
                style={[styles.quantityButton, quantity >= maxStock ? styles.quantityButtonDisabled : null]}
                onPress={incrementQuantity}
                disabled={quantity >= maxStock}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
              
              <Text style={styles.unitText}>{product.unit || 'kg'}</Text>
            </View>

            {/* Calcul des prix */}
            <View style={styles.priceCalculation}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Prix unitaire:</Text>
                <Text style={styles.priceValue}>{formatPrice(unitPrice)} FCFA / {product.unit || 'kg'}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Quantité:</Text>
                <Text style={styles.priceValue}>{quantity} {product.unit || 'kg'}</Text>
              </View>
              <View style={[styles.priceRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>{formatPrice(totalPrice)} FCFA</Text>
              </View>
            </View>
          </View>

          {/* Adresse de livraison */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Adresse de livraison *</Text>
            <TextInput
              style={styles.addressInput}
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              placeholder="Ex: PK5, Bangui"
              multiline
              numberOfLines={2}
            />
          </View>

          {/* Notes optionnelles */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes (optionnel)</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Instructions spéciales, heure de livraison préférée..."
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Informations de livraison */}
          <View style={styles.deliveryInfo}>
            <Text style={styles.deliveryInfoTitle}>ℹ️ Informations de livraison</Text>
            <Text style={styles.deliveryInfoText}>• Livraison sous 24-48h</Text>
            <Text style={styles.deliveryInfoText}>• Paiement à la livraison</Text>
            <Text style={styles.deliveryInfoText}>• Vous serez contacté pour confirmer</Text>
          </View>
        </ScrollView>

        {/* Boutons d'action */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmButtonText}>
              Commander • {formatPrice(totalPrice)} FCFA
            </Text>
          </TouchableOpacity>
        </View>
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
    fontSize: 20,
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImageContainer: {
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImageEmoji: {
    fontSize: 40,
  },
  organicBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  organicBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  productInfo: {
    gap: 4,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  productCategory: {
    fontSize: 14,
    color: '#16a34a',
    fontWeight: '600',
  },
  farmerInfo: {
    fontSize: 14,
    color: '#6b7280',
  },
  locationInfo: {
    fontSize: 14,
    color: '#6b7280',
  },
  stockInfo: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
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
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  quantityButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    fontWeight: 'bold',
  },
  unitText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  priceCalculation: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  priceValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
    marginTop: 8,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  addressInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    minHeight: 50,
    textAlignVertical: 'top',
  },
  notesInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  deliveryInfo: {
    backgroundColor: '#fffbeb',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  deliveryInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 8,
  },
  deliveryInfoText: {
    fontSize: 13,
    color: '#92400e',
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 40,
    gap: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
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
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 2,
    backgroundColor: '#16a34a',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OrderModal;