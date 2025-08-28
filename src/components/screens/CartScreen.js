import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../common/Header';

// Helpers sûrs
const n = (v) => {
  const x = typeof v === 'string' ? parseFloat(v) : Number(v);
  return Number.isFinite(x) ? x : 0;
};
const fmt = (v) => {
  const x = n(v);
  try { return x.toLocaleString('fr-FR'); } catch { return String(x); }
};

const CartScreen = ({
  user,
  cart = [],
  updateCartQuantity,
  removeFromCart,
  clearCart,
  checkout,
  onNavigate,
  onBack,
  onHome,
  screenHistory,
  currentScreen,
}) => {
  // Nettoyer les items invalides (product absent)
  const saneItems = useMemo(
    () => (Array.isArray(cart) ? cart.filter(it => it && it.product) : []),
    [cart]
  );

  // Dérivés robustes
  const lines = useMemo(() => {
    return saneItems.map((it) => {
      const product = it.product || {};
      const qty = Math.max(1, n(it.quantity));
      const unitPrice = n(product.price ?? it.unit_price ?? 0);
      const lineTotal = unitPrice * qty;
      return { product, qty, unitPrice, lineTotal };
    });
  }, [saneItems]);

  const cartTotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.lineTotal, 0),
    [lines]
  );
  const itemsCount = useMemo(
    () => lines.reduce((sum, l) => sum + l.qty, 0),
    [lines]
  );

  const onConfirmClear = () => {
    if (!lines.length) return;
    Alert.alert(
      'Vider le panier',
      'Êtes-vous sûr de vouloir supprimer tous les articles ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Vider', style: 'destructive', onPress: () => clearCart?.() },
      ]
    );
  };

  const renderItem = ({ item, index }) => {
    const { product, qty, unitPrice, lineTotal } = item;
    const emoji = product.image || product.emoji || '🥕';
    const title = product.name || product.title || 'Produit';
    const farmer = product.farmer_name || product.farmer || '—';
    const unit = product.unit || 'kg';

    return (
      <View key={product.id ?? index} style={styles.card}>
        <View style={styles.rowTop}>
          <Text style={styles.emoji}>{emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={1}>{title}</Text>
            <Text style={styles.meta} numberOfLines={1}>Par {farmer}</Text>

            {/* Prix unitaire */}
            <Text style={styles.price}>{fmt(unitPrice)} FCFA/{unit}</Text>

            {/* Sous-total */}
            <Text style={styles.subTotal}>
              Sous-total: <Text style={styles.subTotalStrong}>{fmt(lineTotal)} FCFA</Text>
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => removeFromCart?.(product.id)}
            style={styles.delBtn}
          >
            <Ionicons name="trash" size={18} color="#dc2626" />
          </TouchableOpacity>
        </View>

        {/* Quantité */}
        <View style={styles.qtyRow}>
          <TouchableOpacity
            onPress={() => updateCartQuantity?.(product.id, Math.max(1, qty - 1))}
            style={styles.qtyBtn}
          >
            <Ionicons name="remove" size={18} color="#111827" />
          </TouchableOpacity>

          <View style={styles.qtyDisplay}>
            <Text style={styles.qtyText}>{qty}</Text>
          </View>

          <TouchableOpacity
            onPress={() => updateCartQuantity?.(product.id, qty + 1)}
            style={styles.qtyBtn}
          >
            <Ionicons name="add" size={18} color="#111827" />
          </TouchableOpacity>
        </View>

        <View style={styles.separator} />

        {/* Total de la ligne */}
        <Text style={styles.lineTotal}>{fmt(lineTotal)} FCFA</Text>
      </View>
    );
  };

  const ListHeader = () => (
    <View style={styles.headerBar}>
      <Text style={styles.headerBarText}>
        {itemsCount} article{itemsCount > 1 ? 's' : ''} dans votre panier
      </Text>
      <TouchableOpacity style={styles.clearBtn} onPress={onConfirmClear}>
        <Ionicons name="trash" size={16} color="#ef4444" />
        <Text style={styles.clearBtnText}>Vider</Text>
      </TouchableOpacity>
    </View>
  );

  const ListEmpty = () => (
    <View style={styles.empty}>
      <Ionicons name="bag-outline" size={54} color="#cbd5e1" />
      <Text style={styles.emptyTitle}>Votre panier est vide</Text>
      <Text style={styles.emptySub}>
        Explorez le marketplace pour trouver des produits frais
      </Text>
      <TouchableOpacity
        style={styles.continueBtn}
        onPress={() => onNavigate?.('products')}
      >
        <Ionicons name="pricetags" size={18} color="#fff" />
        <Text style={styles.continueBtnText}>Continuer mes achats</Text>
      </TouchableOpacity>
    </View>
  );

  const ListFooter = () => (
    <View style={styles.footer}>
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total à payer</Text>
        <Text style={styles.totalValue}>{fmt(cartTotal)} FCFA</Text>
      </View>

      <TouchableOpacity
        style={[styles.secondaryBtn, { marginTop: 8 }]}
        onPress={() => onNavigate?.('products')}
      >
        <Ionicons name="pricetags" size={18} color="#1d4ed8" />
        <Text style={styles.secondaryBtnText}>Continuer mes achats</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.primaryBtn, { marginTop: 10 }]}
        onPress={() => {
          if (!itemsCount) return;
          checkout?.();
          onNavigate?.('products');
        }}
      >
        <Ionicons name="card" size={18} color="#fff" />
        <Text style={styles.primaryBtnText}>
          Passer commande ({itemsCount})
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        title="🛒 Mon Panier"
        user={user}
        onBack={onBack}
        onHome={onHome}
        screenHistory={screenHistory}
        currentScreen={currentScreen}
      />

      <FlatList
        data={lines}
        keyExtractor={(it, idx) => String(it?.product?.id ?? idx)}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        ListFooterComponent={ListFooter}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  listContainer: { padding: 12, paddingBottom: 140 },

  headerBar: {
    backgroundColor: '#1d4ed8',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerBarText: { color: '#fff', fontWeight: '700' },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  clearBtnText: { color: '#ef4444', fontWeight: '700' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    marginBottom: 10,
  },
  rowTop: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  emoji: { fontSize: 30 },
  name: { fontWeight: '800', color: '#111827' },
  meta: { color: '#6b7280' },
  price: { color: '#16a34a', fontWeight: '800', marginTop: 2 },

  subTotal: { color: '#4b5563', marginTop: 2 },
  subTotalStrong: { color: '#111827', fontWeight: '800' },

  delBtn: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fee2e2',
  },

  qtyRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  qtyBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#f3f4f6',
    alignItems: 'center', justifyContent: 'center',
  },
  qtyDisplay: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 999, minWidth: 48, alignItems: 'center',
  },
  qtyText: { fontWeight: '800', color: '#111827' },

  separator: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 10 },

  lineTotal: { color: '#16a34a', fontWeight: '800', fontSize: 16 },

  footer: {
    backgroundColor: '#fff',
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: '#374151', fontWeight: '700' },
  totalValue: { color: '#16a34a', fontWeight: '900', fontSize: 18 },

  secondaryBtn: {
    backgroundColor: '#e0ecff',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryBtnText: { color: '#1d4ed8', fontWeight: '800' },

  primaryBtn: {
    backgroundColor: '#16a34a',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnText: { color: '#fff', fontWeight: '800' },
});

export default CartScreen;
