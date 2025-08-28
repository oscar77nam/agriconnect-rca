import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../common/Header';

const safeNumber = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

const FarmerProductsScreen = ({
  user,
  farmerProducts = [],
  onNavigate,
  onBack,
  onHome,
  screenHistory,
  currentScreen,
  deleteProduct,
}) => {
  const [selected, setSelected] = useState(null);

  const data = useMemo(() => farmerProducts || [], [farmerProducts]);

  const renderItem = ({ item }) => {
    const stock = safeNumber(item.stock);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => setSelected(selected?.id === item.id ? null : item)}
      >
        <View style={styles.cardRow}>
          <Text style={styles.emoji}>{item.image || item.emoji || '🌾'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>
              {item.category_name || item.category || 'Divers'} • {item.unit || 'kg'}
            </Text>
            <Text style={styles.price}>
              {(safeNumber(item.price)).toLocaleString('fr-FR')} FCFA
            </Text>
            <Text style={styles.stock}>
              Stock: {stock} {item.unit || 'kg'}
            </Text>
          </View>
          <Ionicons
            name={selected?.id === item.id ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#6b7280"
          />
        </View>

        {selected?.id === item.id && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#2563eb' }]}
              onPress={() => onNavigate?.('productDetails', { product: item })}
            >
              <Ionicons name="eye" size={18} color="#fff" />
              <Text style={styles.actionText}>Voir</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#16a34a' }]}
              onPress={() => onNavigate?.('productForm', { product: item })}
            >
              <Ionicons name="create" size={18} color="#fff" />
              <Text style={styles.actionText}>Éditer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#dc2626' }]}
              onPress={() => deleteProduct?.(item.id)}
            >
              <Ionicons name="trash" size={18} color="#fff" />
              <Text style={styles.actionText}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const ListEmpty = () => (
    <View style={styles.emptyBox}>
      <Ionicons name="leaf-outline" size={36} color="#9ca3af" />
      <Text style={styles.emptyTitle}>Aucun produit</Text>
      <Text style={styles.emptySub}>Ajoutez vos premiers produits.</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        title="🌱 Mes produits"
        onBack={onBack}
        onHome={onHome}
        screenHistory={screenHistory}
        currentScreen={currentScreen}
        user={user}
      />

      <FlatList
        data={data}
        keyExtractor={(it, idx) => String(it?.id ?? idx)}
        renderItem={renderItem}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={styles.listContainer}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => onNavigate?.('productForm')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  listContainer: { padding: 16, paddingBottom: 100 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    marginBottom: 10,
  },
  cardRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  emoji: { fontSize: 34 },
  name: { fontWeight: '800', color: '#111827', marginBottom: 2 },
  meta: { color: '#6b7280', marginBottom: 2 },
  price: { color: '#16a34a', fontWeight: '800' },
  stock: { color: '#6b7280', marginTop: 2 },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionText: { color: '#fff', fontWeight: '700' },

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
  },

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

export default FarmerProductsScreen;
