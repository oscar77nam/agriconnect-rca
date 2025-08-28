import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../common/Header';

const norm = (s) => (s || '').toString().trim();
const catOf = (p) => norm(p.category || p.category_name || 'Divers');

/**
 * Écran Catégories
 * - Sélection multi-catégories (chips)
 * - Recherche (produits + catégories) insensible à la casse
 * - Liste groupée par catégorie
 * - Ajout rapide au panier + accès panier
 */
const CategoriesScreen = ({
  user,
  products = [],
  cart = [],
  addToCart,
  onNavigate,
  onBack,
  onHome,
  screenHistory,
  currentScreen,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCats, setSelectedCats] = useState([]); // noms de catégories sélectionnées

  // Catégories uniques + compteur
  const categories = useMemo(() => {
    const map = new Map();
    for (const p of products) {
      const c = catOf(p);
      map.set(c, (map.get(c) || 0) + 1);
    }
    return [...map.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ name, count }));
  }, [products]);

  // Filtre (recherche + catégories sélectionnées)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (products || []).filter((p) => {
      const inCats =
        selectedCats.length === 0 || selectedCats.includes(catOf(p));
      if (!inCats) return false;

      if (!q) return true;

      const fields = [
        p.name,
        p.title,
        p.location,
        catOf(p),
        p.farmer,
        p.farmer_name,
      ]
        .filter(Boolean)
        .map((x) => x.toString().toLowerCase());

      return fields.some((f) => f.includes(q));
    });
  }, [products, search, selectedCats]);

  // Groupement par catégorie
  const grouped = useMemo(() => {
    const g = new Map();
    for (const p of filtered) {
      const c = catOf(p);
      if (!g.has(c)) g.set(c, []);
      g.get(c).push(p);
    }
    return [...g.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  const toggleCat = (name) => {
    setSelectedCats((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };

  const clearCats = () => setSelectedCats([]);

  const handleAdd = (product) => {
    // ajout rapide (qty 1) ; l’acheteur pourra ajuster dans le panier
    addToCart?.(product, 1);
  };

  const money = (n) => {
    const v = Number(n) || 0;
    try { return v.toLocaleString('fr-FR'); } catch { return String(v); }
  };

  return (
    <View style={styles.container}>
      <Header
        title="🗂️ Catégories"
        onBack={onBack}
        onHome={onHome}
        screenHistory={screenHistory}
        currentScreen={currentScreen}
        user={user}
      />

      {/* Bandeau panier */}
      {cart?.length > 0 && (
        <TouchableOpacity
          onPress={() => onNavigate?.('cart')}
          style={styles.cartBanner}
        >
          <Ionicons name="cart" size={18} color="#166534" />
          <Text style={styles.cartBannerText}>
            Vous avez {cart.length} article{cart.length > 1 ? 's' : ''} dans le panier
          </Text>
          <View style={styles.cartBannerBtn}>
            <Text style={styles.cartBannerBtnText}>Voir le panier</Text>
          </View>
        </TouchableOpacity>
      )}

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
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

        {/* Chips catégories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          <TouchableOpacity
            onPress={clearCats}
            style={[
              styles.chip,
              selectedCats.length === 0 && styles.chipActive,
            ]}
          >
            <Ionicons
              name="layers"
              size={14}
              color={selectedCats.length === 0 ? '#fff' : '#374151'}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.chipText,
                selectedCats.length === 0 && { color: '#fff' },
              ]}
            >
              Toutes
            </Text>
          </TouchableOpacity>

          {categories.map((c) => {
            const active = selectedCats.includes(c.name);
            return (
              <TouchableOpacity
                key={c.name}
                onPress={() => toggleCat(c.name)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Ionicons
                  name="pricetags"
                  size={14}
                  color={active ? '#fff' : '#374151'}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.chipText, active && { color: '#fff' }]}>
                  {c.name} · {c.count}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Groupes de produits */}
        {grouped.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="leaf-outline" size={36} color="#9ca3af" />
            <Text style={styles.emptyTitle}>Aucun produit trouvé</Text>
            <Text style={styles.emptySub}>
              Essayez un autre mot-clé ou sélectionnez d’autres catégories.
            </Text>
          </View>
        ) : (
          grouped.map(([catName, items]) => (
            <View key={catName} style={styles.categoryBlock}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>
                  {catName} <Text style={styles.categoryCount}>({items.length})</Text>
                </Text>
                <TouchableOpacity onPress={() => onNavigate?.('products')}>
                  <Text style={styles.link}>Voir tout</Text>
                </TouchableOpacity>
              </View>

              {items.map((p) => {
                const emoji = p.image || p.emoji || '🥕';
                const unit = p.unit || 'kg';
                const farmer = p.farmer || p.farmer_name || '—';
                return (
                  <View key={p.id} style={styles.card}>
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
                            Par {farmer} • {p.location || '—'}
                          </Text>
                          <Text style={styles.price}>
                            {money(p.price)} FCFA/{unit}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>

                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        onPress={() => handleAdd(p)}
                        style={styles.addBtn}
                      >
                        <Ionicons name="cart" size={16} color="#fff" />
                        <Text style={styles.addBtnText}>Ajouter</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => onNavigate?.('productDetails', { product: p })}
                        style={styles.secondaryBtn}
                      >
                        <Text style={styles.secondaryBtnText}>Détails</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { flex: 1 },
  contentContainer: { padding: 16, paddingBottom: 100 },

  cartBanner: {
    margin: 16,
    marginBottom: 0,
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
    marginTop: 12,
  },
  searchInput: { flex: 1, fontSize: 16 },

  chipsRow: { paddingVertical: 12, gap: 8, paddingRight: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 8,
  },
  chipActive: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  chipText: { color: '#374151', fontWeight: '700' },

  categoryBlock: { marginTop: 8 },
  categoryHeader: {
    paddingHorizontal: 4,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  categoryTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  categoryCount: { color: '#6b7280', fontWeight: '600' },
  link: { color: '#2563eb', fontWeight: '700' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 10,
  },
  cardRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  emoji: { fontSize: 34 },
  name: { fontWeight: '800', color: '#111827', marginBottom: 2 },
  meta: { color: '#6b7280', marginBottom: 2 },
  price: { color: '#16a34a', fontWeight: '800' },

  cardActions: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  addBtn: {
    backgroundColor: '#16a34a',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addBtnText: { color: '#fff', fontWeight: '800' },

  secondaryBtn: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  secondaryBtnText: { color: '#374151', fontWeight: '800' },

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

export default CategoriesScreen;
