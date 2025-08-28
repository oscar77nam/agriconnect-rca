// src/components/screens/ProductsScreen.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../common/Header';

const norm = (s) => (s || '').toString().trim();
const catOf = (p) => norm(p.category || p.category_name || 'Divers');
const cityOf = (p) => norm(p.location || p.farmer_location || '—');
const safeNumber = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

const ProductsScreen = ({
  user,
  products = [],
  cart = [],
  addToCart,
  onNavigate,
  onBack,
  onHome,
  screenHistory,
  currentScreen,
  refetchProducts,
}) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [qtyById, setQtyById] = useState({}); // { [id]: number }

  // 🔁 tenter un fetch si on arrive sur l'écran sans produits
  useEffect(() => {
    if (user && (!products || products.length === 0)) {
      refetchProducts?.().catch(() => {});
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // reset pagination quand on tape
  useEffect(() => {
    setPage(1);
  }, [search]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products || [];
    return (products || []).filter((p) => {
      const fields = [
        p.name,
        p.title,
        cityOf(p),
        catOf(p),
        p.farmer,
        p.farmer_name,
      ]
        .filter(Boolean)
        .map((x) => x.toString().toLowerCase());
      return fields.some((f) => f.includes(q));
    });
  }, [products, search]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageClamped = Math.min(Math.max(1, page), totalPages);

  const paginatedData = useMemo(() => {
    const start = (pageClamped - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, pageClamped]);

  const setQty = (id, next) => {
    const v = Math.max(1, safeNumber(next));
    setQtyById((prev) => ({ ...prev, [id]: v }));
  };

  const addQuick = (p) => {
    const q = qtyById[p.id] || 1;
    addToCart?.(p, q);
  };

  const priceText = (p) => {
    const n = safeNumber(p.price);
    try {
      return `${n.toLocaleString('fr-FR')} FCFA/${p.unit || 'kg'}`;
    } catch {
      return `${n} FCFA/${p.unit || 'kg'}`;
    }
  };

  const ListHeader = () => (
    <View style={{ gap: 12 }}>
      {/* Bandeau panier */}
      {cart?.length > 0 && (
        <TouchableOpacity
          onPress={() => onNavigate?.('cart')}
          style={styles.cartBanner}
        >
          <Ionicons name="cart" size={18} color="#166534" />
          <Text style={styles.cartBannerText}>
            {cart.length} article{cart.length > 1 ? 's' : ''} dans le panier
          </Text>
          <View style={styles.cartBannerBtn}>
            <Text style={styles.cartBannerBtnText}>Voir</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Recherche */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#9ca3af" />
        <TextInput
          placeholder="Rechercher un produit, une ville, une catégorie…"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      {/* Résumé */}
      <View style={styles.filterHeader}>
        <Text style={styles.filterInfo}>
          {total} produit{total > 1 ? 's' : ''} — page {pageClamped}/{totalPages}
        </Text>
      </View>
    </View>
  );

  const renderItem = ({ item: p, index }) => {
    const emoji = p.image || p.emoji || '🥕';
    const farmer = p.farmer || p.farmer_name || '—';
    const unit = p.unit || 'kg';
    const stock = safeNumber(p.stock);
    const qty = qtyById[p.id] || 1;

    return (
      <View key={p.id ?? index} style={styles.card}>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => onNavigate?.('productDetails', { product: p })}
        >
          <View style={styles.cardRow}>
            <Text style={styles.emoji}>{emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>
                {p.name || p.title || 'Produit'}
              </Text>
              <Text style={styles.meta} numberOfLines={1}>
                {catOf(p)} • {cityOf(p)} • Par {farmer}
              </Text>
              <Text style={styles.price}>{priceText(p)}</Text>
              <Text style={styles.stock}>
                Stock: {stock} {unit}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Inline achat */}
        <View style={styles.buyRow}>
          <TouchableOpacity
            onPress={() => setQty(p.id, Math.max(1, qty - 1))}
            style={styles.qtyBtn}
          >
            <Ionicons name="remove" size={18} color="#111827" />
          </TouchableOpacity>
          <View style={styles.qtyDisplay}>
            <Text style={styles.qtyText}>{qty}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setQty(p.id, Math.min(stock || 999999, qty + 1))}
            style={styles.qtyBtn}
          >
            <Ionicons name="add" size={18} color="#111827" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => addQuick(p)} style={styles.addBtn}>
            <Ionicons name="cart" size={16} color="#fff" />
            <Text style={styles.addBtnText}>Ajouter</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const ListEmpty = () => (
    <View style={styles.emptyBox}>
      <Ionicons name="leaf-outline" size={36} color="#9ca3af" />
      <Text style={styles.emptyTitle}>Aucun produit trouvé</Text>
      <Text style={styles.emptySub}>Modifiez la recherche.</Text>
    </View>
  );

  const ListFooter = () => (
    <View style={styles.pagerRow}>
      <TouchableOpacity
        disabled={pageClamped <= 1}
        onPress={() => setPage((x) => Math.max(1, x - 1))}
        style={[styles.pagerBtn, pageClamped <= 1 && styles.pagerBtnDisabled]}
      >
        <Ionicons
          name="chevron-back"
          size={16}
          color={pageClamped <= 1 ? '#9ca3af' : '#111827'}
        />
        <Text
          style={[styles.pagerText, pageClamped <= 1 && { color: '#9ca3af' }]}
        >
          Précédent
        </Text>
      </TouchableOpacity>

      <Text style={styles.pagerInfo}>
        Page {pageClamped} / {totalPages}
      </Text>

      <TouchableOpacity
        disabled={pageClamped >= totalPages}
        onPress={() => setPage((x) => Math.min(totalPages, x + 1))}
        style={[
          styles.pagerBtn,
          pageClamped >= totalPages && styles.pagerBtnDisabled,
        ]}
      >
        <Text
          style={[styles.pagerText, pageClamped >= totalPages && { color: '#9ca3af' }]}
        >
          Suivant
        </Text>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={pageClamped >= totalPages ? '#9ca3af' : '#111827'}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        title="🛍️ Tous les produits"
        onBack={onBack}
        onHome={onHome}
        screenHistory={screenHistory}
        currentScreen={currentScreen}
        user={user}
      />

      <FlatList
        data={paginatedData}
        keyExtractor={(it, idx) => String(it?.id ?? idx)}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        ListFooterComponent={ListFooter}
        contentContainerStyle={styles.listContainer}
      />

      {/* FAB panier */}
      <TouchableOpacity style={styles.fab} onPress={() => onNavigate?.('cart')}>
        <Ionicons name="cart" size={22} color="#fff" />
        {cart?.length > 0 && (
          <View style={styles.fabBadge}>
            <Text style={styles.fabBadgeText}>{cart.length}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  listContainer: { padding: 16, paddingBottom: 120 },

  cartBanner: {
    backgroundColor: '#ecfdf5',
    borderColor: '#bbf7d0',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cartBannerText: { flex: 1, color: '#166534', fontWeight: '600' },
  cartBannerBtn: {
    backgroundColor: '#16a34a',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  cartBannerBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },

  searchBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 16 },

  filterHeader: {
    marginTop: 2,
    marginBottom: 2,
    paddingHorizontal: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  filterInfo: { color: '#374151', fontWeight: '600' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 10,
  },
  cardRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  emoji: { fontSize: 34 },
  name: { fontWeight: '800', color: '#111827', marginBottom: 2 },
  meta: { color: '#6b7280', marginBottom: 2 },
  price: { color: '#16a34a', fontWeight: '800' },
  stock: { color: '#6b7280', marginTop: 2 },

  buyRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyDisplay: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    minWidth: 48,
    alignItems: 'center',
  },
  qtyText: { fontWeight: '800', color: '#111827' },
  addBtn: {
    backgroundColor: '#16a34a',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addBtnText: { color: '#fff', fontWeight: '800' },

  pagerRow: {
    marginTop: 12,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pagerBtn: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pagerBtnDisabled: { opacity: 0.6 },
  pagerText: { color: '#111827', fontWeight: '800' },
  pagerInfo: { color: '#374151', fontWeight: '700' },

  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    backgroundColor: '#16a34a',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  fabBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#dc2626',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  fabBadgeText: { color: '#fff', fontWeight: '800', fontSize: 12 },

  emptyBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 20,
    alignItems: 'center',
    marginTop: 12,
  },
  emptyTitle: { marginTop: 8, fontWeight: '800', color: '#111827' },
  emptySub: { color: '#6b7280', textAlign: 'center', marginTop: 4 },
});

export default ProductsScreen;
