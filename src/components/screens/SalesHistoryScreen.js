import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../common/Header';

const SalesHistoryScreen = ({
  user,
  recentSales = [],
  onBack,
  onHome,
  screenHistory,
  currentScreen,
}) => {
  const rows = Array.isArray(recentSales) ? recentSales : [];

  return (
    <View style={styles.container}>
      <Header
        title="📈 Historique des ventes"
        onBack={onBack}
        onHome={onHome}
        screenHistory={screenHistory}
        currentScreen={currentScreen}
        user={user}
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {rows.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="bar-chart" size={72} color="#d1d5db" />
            <Text style={styles.emptyTitle}>Aucune vente récente</Text>
            <Text style={styles.emptyText}>Vos ventes s’afficheront ici.</Text>
          </View>
        ) : (
          rows.map((s, idx) => {
            const name = s?.product_name || s?.name || 'Produit';
            const qty = Number(s?.quantity ?? 0);
            const total = Number(s?.total_amount ?? s?.total ?? 0);
            const dateTxt = s?.created_at
              ? new Date(s.created_at).toLocaleString('fr-FR')
              : '—';
            return (
              <View key={s?.id ?? idx} style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.title}>{name}</Text>
                  <Text style={styles.total}>{total.toLocaleString('fr-FR')} FCFA</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Quantité</Text>
                  <Text style={styles.metaValue}>{qty.toLocaleString('fr-FR')}</Text>
                </View>
                <Text style={styles.date}>{dateTxt}</Text>
              </View>
            );
          })
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { flex: 1 },
  contentContainer: { padding: 16, paddingBottom: 80 },

  empty: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 12 },
  emptyText: { fontSize: 14, color: '#6b7280', marginTop: 4 },

  card: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '700', color: '#111827' },
  total: { fontSize: 14, fontWeight: '700', color: '#16a34a' },

  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  metaLabel: { color: '#6b7280' },
  metaValue: { color: '#111827', fontWeight: '700' },

  date: { marginTop: 8, fontSize: 12, color: '#6b7280' },
});

export default SalesHistoryScreen;
