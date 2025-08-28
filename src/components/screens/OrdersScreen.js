// src/components/screens/OrdersScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import Header from '../common/Header';

const money = (n) => {
  const v = Number(n) || 0;
  try { return v.toLocaleString('fr-FR'); } catch { return String(v); }
};

const OrdersScreen = ({
  user,
  onBack,
  onHome,
  onNavigate,
  screenHistory,
  currentScreen,
  getUserOrders,
}) => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    (async () => {
      const arr = await getUserOrders?.();
      setOrders(Array.isArray(arr) ? arr : []);
    })();
  }, [getUserOrders]);

  const keyExtractor = (it, idx) => String(it?.id ?? idx);

  const renderItem = ({ item: o }) => {
    const total = o.total_amount ?? o.total ?? ((o.unit_price || 0) * (o.quantity || 0));
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Commande #{(o.id || '').slice(0, 8)}</Text>
        <Text style={styles.line}>Produit: {o.product_name || '—'}</Text>
        <Text style={styles.line}>Quantité: {o.quantity || 0}</Text>
        <Text style={styles.line}>Prix unitaire: {money(o.unit_price)} FCFA</Text>
        <Text style={styles.total}>Total: {money(total)} FCFA</Text>
        <Text style={styles.status}>Statut: {o.status || 'pending'}</Text>
        <Text style={styles.date}>
          {o.created_at ? new Date(o.created_at).toLocaleString('fr-FR') : ''}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="📦 Mes commandes"
        onBack={onBack}
        onHome={onHome}
        screenHistory={screenHistory}
        currentScreen={currentScreen}
        user={user}
      />
      <FlatList
        data={orders}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Aucune commande</Text>
            <Text style={styles.emptySub}>Vos commandes apparaîtront ici.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 10,
  },
  title: { fontWeight: '800', color: '#111827', marginBottom: 6 },
  line: { color: '#374151', marginTop: 2 },
  total: { color: '#16a34a', fontWeight: '800', marginTop: 6 },
  status: { color: '#6b7280', marginTop: 4 },
  date: { color: '#6b7280', marginTop: 2, fontSize: 12 },

  empty: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  emptySub: { color: '#6b7280', marginTop: 6 },
});

export default OrdersScreen;
