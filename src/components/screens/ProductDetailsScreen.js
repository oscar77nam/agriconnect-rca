import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../common/Header';

const safeNumber = (v, def = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};
const money = (n) => {
  const num = safeNumber(n);
  try { return num.toLocaleString('fr-FR'); } catch { return String(num); }
};

const ProductDetailsScreen = ({
  user,
  product,
  onBack,
  onHome,
  onNavigate,
  screenHistory,
  currentScreen,
  addToCart,
  toggleFavorite,
}) => {
  const price = safeNumber(product?.price);
  const stock = safeNumber(product?.stock, 0);
  const unit = product?.unit || 'kg';
  const location = product?.location || product?.farmer_location || '—';
  const farmerName = product?.farmer || product?.farmer_name || '—';
  const isOrganic = Boolean(product?.organic);

  // ---- Quantité inline ----
  const [qty, setQty] = useState(1);
  const inc = () => setQty((q) => (stock ? Math.min(stock, q + 1) : q + 1));
  const dec = () => setQty((q) => Math.max(1, q - 1));
  const onChangeQty = (t) => {
    const v = parseInt(String(t).replace(/[^\d]/g, ''), 10);
    if (!Number.isFinite(v)) return setQty(1);
    if (!stock) return setQty(Math.max(1, v));
    setQty(Math.max(1, Math.min(stock, v)));
  };
  const total = useMemo(() => Math.max(0, price * qty), [price, qty]);

  const onAdd = () => {
    if (!product) return;
    if (stock <= 0) {
      Alert.alert('Stock indisponible', 'Ce produit n’est plus en stock.');
      return;
    }
    if (qty <= 0) {
      Alert.alert('Quantité invalide', 'La quantité doit être au moins 1.');
      return;
    }
    if (stock && qty > stock) {
      Alert.alert('Stock insuffisant', `Stock disponible: ${stock} ${unit}.`);
      return;
    }
    try {
      addToCart?.(product, qty);
      // ✅ Navigation automatique vers le panier
      onNavigate?.('cart');
    } catch (e) {
      console.error('addToCart error:', e);
      Alert.alert('Erreur', e?.message || 'Impossible d’ajouter au panier.');
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="🥕 Détails du produit"
        onBack={onBack}
        onHome={onHome}
        screenHistory={screenHistory}
        currentScreen={currentScreen}
        user={user}
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Carte produit */}
        <View style={styles.productCard}>
          <Text style={styles.emoji}>{product?.image || product?.emoji || '🥕'}</Text>
          <Text style={styles.name}>{product?.name || product?.title || 'Produit'}</Text>
          <Text style={styles.price}>
            {money(price)} FCFA/{unit}
          </Text>
        </View>

        {/* Infos */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="person" size={18} color="#6b7280" />
            <Text style={styles.infoText}>Vendu par {farmerName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={18} color="#6b7280" />
            <Text style={styles.infoText}>{location}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name={isOrganic ? 'leaf' : 'beaker'} size={18} color="#6b7280" />
            <Text style={styles.infoText}>{isOrganic ? 'Biologique' : 'Conventionnel'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="cube" size={18} color="#6b7280" />
            <Text style={styles.infoText}>
              Stock: {stock} {unit}
            </Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.descCard}>
          <Text style={styles.descTitle}>Description</Text>
          <Text style={styles.descText}>{product?.description || '—'}</Text>
        </View>

        {/* Formulaire quantité (inline) */}
        <View style={styles.qtyCard}>
          <Text style={styles.qtyTitle}>Quantité</Text>

          <View style={styles.qtyRow}>
            <TouchableOpacity onPress={dec} style={styles.qtyBtn}>
              <Ionicons name="remove" size={20} color="#111827" />
            </TouchableOpacity>

            <TextInput
              value={String(qty)}
              onChangeText={onChangeQty}
              keyboardType="number-pad"
              style={styles.qtyInput}
            />

            <TouchableOpacity
              onPress={inc}
              style={styles.qtyBtn}
              disabled={stock ? qty >= stock : false}
            >
              <Ionicons
                name="add"
                size={20}
                color={stock && qty >= stock ? '#d1d5db' : '#111827'}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.stockHint}>
            Stock disponible : {stock || '—'} {unit}
          </Text>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{money(total)} FCFA</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.btn, styles.favBtn]}
            onPress={() => toggleFavorite?.(product?.id)}
          >
            <Ionicons name="heart" size={18} color="#dc2626" />
            <Text style={[styles.btnTxt, { color: '#dc2626' }]}>Favori</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.cartBtn]}
            onPress={onAdd}
            disabled={stock <= 0}
          >
            <Ionicons name="cart" size={18} color="#fff" />
            <Text style={[styles.btnTxt, { color: '#fff' }]}>
              {stock > 0 ? 'Ajouter au panier' : 'Indisponible'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  content: { flex: 1 },
  contentContainer: { padding: 16, paddingBottom: 140 },

  productCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eef2f7',
  },
  emoji: { fontSize: 64, marginBottom: 8 },
  name: { fontSize: 20, fontWeight: '700', color: '#111827', textTransform: 'capitalize' },
  price: { marginTop: 6, fontSize: 14, fontWeight: '700', color: '#16a34a' },

  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eef2f7',
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  infoText: { color: '#374151', fontSize: 14 },

  descCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eef2f7',
  },
  descTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 6 },
  descText: { color: '#374151', lineHeight: 20 },

  /* ---- Quantité inline ---- */
  qtyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eef2f7',
  },
  qtyTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 8 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  qtyBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center',
  },
  qtyInput: {
    minWidth: 90,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontWeight: '700',
    color: '#111827',
  },
  stockHint: { textAlign: 'center', marginTop: 8, color: '#6b7280' },
  totalRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eef2f7',
  },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#111827' },
  totalValue: { fontSize: 18, fontWeight: '800', color: '#16a34a' },

  /* ---- Actions ---- */
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  btn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  favBtn: { backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#fecaca' },
  cartBtn: { backgroundColor: '#16a34a' },
  btnTxt: { fontWeight: '700', color: '#111827' },
});

export default ProductDetailsScreen;
