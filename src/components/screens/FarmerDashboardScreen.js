import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../common/Header';

const formatFCFA = (v) => Number(v || 0).toLocaleString('fr-FR') + ' FCFA';

const FarmerDashboardScreen = ({
  user,
  stats = {},
  recentSales = [],
  topProducts = [],
  products = [],
  onNavigate,
  onBack,
  onHome,
  screenHistory,
  currentScreen,
}) => {
  // garde-fous
  const safeStats = {
    productsCount: Number(stats.productsCount || 0),
    salesCount: Number(stats.salesCount || 0),
    totalRevenue: Number(stats.totalRevenue || 0),
    lowStock: Number(stats.lowStock || 0),
  };

  const QuickAction = ({ icon, color, title, subtitle, onPress }) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
      <View style={[styles.actionIcon, { backgroundColor: `${color}1A` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header
        title="📊 Tableau de bord"
        subtitle="Tableau de bord (agriculteur)"
        onBack={onBack}
        onHome={onHome}
        onNavigate={onNavigate}
        screenHistory={screenHistory}
        currentScreen={currentScreen}
        user={user}
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Stat principaux */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { borderLeftColor: '#16a34a' }]}>
            <Text style={styles.statLabel}>Produits</Text>
            <Text style={styles.statValue}>{safeStats.productsCount}</Text>
          </View>
          <View style={[styles.statBox, { borderLeftColor: '#7c3aed' }]}>
            <Text style={styles.statLabel}>Ventes</Text>
            <Text style={styles.statValue}>{safeStats.salesCount}</Text>
          </View>
          <View style={[styles.statBox, { borderLeftColor: '#dc2626' }]}>
            <Text style={styles.statLabel}>Revenus</Text>
            <Text style={styles.statValue}>{formatFCFA(safeStats.totalRevenue)}</Text>
          </View>
        </View>

        {/* Actions */}
        <Text style={styles.sectionTitle}>⚡ Actions Vendeur</Text>
        <View style={styles.actionsGrid}>
          <QuickAction
            icon="add"
            color="#16a34a"
            title="Ajouter produit"
            subtitle="Mettre en vente"
            onPress={() => onNavigate?.('productForm')}
          />
          <QuickAction
            icon="cube"
            color="#2563eb"
            title="Gérer stock"
            subtitle={`${products?.length || 0} produits`}
            onPress={() => onNavigate?.('farmerProducts')}
          />
          <QuickAction
            icon="receipt"
            color="#7c3aed"
            title="Mes ventes"
            subtitle="Historique"
            onPress={() => onNavigate?.('salesHistory')}
          />
          <QuickAction
            icon="person"
            color="#ef4444"
            title="Mon profil"
            subtitle="Vendeur"
            onPress={() => onNavigate?.('profile')}
          />
        </View>

        {/* Ventes récentes */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🕒 Ventes récentes</Text>
          <TouchableOpacity onPress={() => onNavigate?.('salesHistory')}>
            <Text style={styles.link}>Voir tout</Text>
          </TouchableOpacity>
        </View>
        {(!recentSales || recentSales.length === 0) ? (
          <View style={styles.emptyCard}>
            <Ionicons name="document-text" size={22} color="#9ca3af" />
            <Text style={styles.emptyText}>Aucune vente récente</Text>
            <Text style={styles.emptySubtext}>Vos prochaines ventes apparaîtront ici</Text>
          </View>
        ) : (
          <View style={styles.listCard}>
            {recentSales.slice(0, 5).map((s, idx) => (
              <View key={s.id || idx} style={styles.rowItem}>
                <Text style={styles.rowTitle}>{s.productTitle || s.product_name || 'Produit'}</Text>
                <Text style={styles.rowValue}>{formatFCFA(s.totalAmount || s.total_amount)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Top produits */}
        <Text style={[styles.sectionTitle, { marginTop: 12 }]}>🏆 Produits les plus vendus</Text>
        <View style={styles.listCard}>
          {(topProducts || []).slice(0, 5).map((p, i) => (
            <View key={p.id || i} style={styles.rowItem}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{i + 1}</Text>
              </View>
              <Text style={[styles.rowTitle, { flex: 1 }]} numberOfLines={1}>
                {p.name || p.title || 'Produit'}
              </Text>
              <Text style={styles.rowHint}>
                {(p.totalSold || 0)} unités · {formatFCFA((p.totalSold || 0) * (p.price || 0))}
              </Text>
            </View>
          ))}
          {(topProducts || []).length === 0 && (
            <Text style={styles.emptySubtext}>Pas encore de ventes sur vos produits.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { flex: 1 },
  contentContainer: { padding: 16, paddingBottom: 120 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
  statLabel: { color: '#6b7280', fontSize: 12, marginBottom: 6 },
  statValue: { color: '#111827', fontSize: 18, fontWeight: '700' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1f2937', marginVertical: 8 },
  link: { color: '#2563eb', fontWeight: '600' },

  actionsGrid: { gap: 10, flexDirection: 'row', flexWrap: 'wrap' },
  actionCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  actionIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  actionTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  actionSubtitle: { fontSize: 12, color: '#6b7280' },

  listCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  rowItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, gap: 12 },
  rowTitle: { fontSize: 14, color: '#111827', fontWeight: '600' },
  rowHint: { fontSize: 12, color: '#6b7280' },
  rowValue: { fontSize: 14, color: '#16a34a', fontWeight: '700' },

  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  emptyText: { fontSize: 14, fontWeight: '700', color: '#374151' },
  emptySubtext: { fontSize: 12, color: '#6b7280' },

  badge: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: '#e5e7eb',
    alignItems: 'center', justifyContent: 'center', marginRight: 6,
  },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#374151' },
});

export default FarmerDashboardScreen;
