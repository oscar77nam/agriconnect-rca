import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../common/Header';

const safe = (n) => (Number.isFinite(Number(n)) ? Number(n) : 0);

const AdminDashboardScreen = ({
  user,
  stats = {},
  products = [],
  orders = [],
  users = [],
  onBack,
  onHome,
  onNavigate,
  screenHistory,
  currentScreen,
}) => {
  const totalRevenue = safe(stats.totalRevenue || orders.reduce((s, o) => s + (Number(o.total_amount ?? o.total ?? (o.unit_price * o.quantity)) || 0), 0));
  const totalProducts = stats.totalProducts ?? products.length ?? 0;
  const totalOrders = stats.totalOrders ?? orders.length ?? 0;
  const totalUsers = users.length ?? 0;

  return (
    <View style={styles.container}>
      <Header
        title="👑 Tableau de bord Admin"
        onBack={onBack}
        onHome={onHome}
        screenHistory={screenHistory}
        currentScreen={currentScreen}
        user={user}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.cardsRow}>
          <View style={[styles.card, { borderLeftColor: '#16a34a' }]}>
            <Text style={styles.cardLabel}>Produits</Text>
            <Text style={styles.cardValue}>{totalProducts.toLocaleString('fr-FR')}</Text>
          </View>
          <View style={[styles.card, { borderLeftColor: '#7c3aed' }]}>
            <Text style={styles.cardLabel}>Commandes</Text>
            <Text style={styles.cardValue}>{totalOrders.toLocaleString('fr-FR')}</Text>
          </View>
        </View>

        <View style={styles.cardsRow}>
          <View style={[styles.card, { borderLeftColor: '#2563eb' }]}>
            <Text style={styles.cardLabel}>Utilisateurs</Text>
            <Text style={styles.cardValue}>{totalUsers.toLocaleString('fr-FR')}</Text>
          </View>
          <View style={[styles.card, { borderLeftColor: '#dc2626' }]}>
            <Text style={styles.cardLabel}>Revenus (FCFA)</Text>
            <Text style={styles.cardValue}>{totalRevenue.toLocaleString('fr-FR')}</Text>
          </View>
        </View>

        {/* Boutons d’accès admin */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => onNavigate?.('users')}>
            <Ionicons name="people" size={18} color="#111827" />
            <Text style={styles.actionText}>Gérer les utilisateurs</Text>
            <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={() => onNavigate?.('adminNetwork')}>
            <Ionicons name="globe" size={18} color="#111827" />
            <Text style={styles.actionText}>Paramètres réseau (API)</Text>
            <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <View style={styles.help}>
          <Text style={styles.helpTitle}>Conseils</Text>
          <Text style={styles.helpText}>• Surveillez l’activité et les tendances de vente.</Text>
          <Text style={styles.helpText}>• Vérifiez régulièrement l’état de l’API dans Paramètres réseau.</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, paddingBottom: 120, gap: 16 },

  cardsRow: { flexDirection: 'row', gap: 12 },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderLeftWidth: 5,
  },
  cardLabel: { color: '#6b7280', fontWeight: '700' },
  cardValue: { color: '#111827', fontWeight: '900', fontSize: 22, marginTop: 6 },

  actions: { gap: 8 },
  actionBtn: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionText: { flex: 1, color: '#111827', fontWeight: '700' },

  help: {
    backgroundColor: '#fffbeb',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    borderRadius: 10,
    padding: 14,
    gap: 6,
  },
  helpTitle: { fontWeight: '800', color: '#92400e' },
  helpText: { color: '#7c2d12' },
});

export default AdminDashboardScreen;
