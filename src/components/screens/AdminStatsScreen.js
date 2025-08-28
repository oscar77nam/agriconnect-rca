// src/components/screens/AdminStatsScreen.js
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../common/Header';
import { API_BASE } from '../../AgriConnectRCA';

const { width } = Dimensions.get('window');
const KEY_TOKEN = 'agri_token';

const n = (v) => Number(v || 0);
const fmtNum = (v) => n(v).toLocaleString('fr-FR');
const fmtMoney = (v) => `${n(v).toLocaleString('fr-FR')} FCFA`;

const SectionTitle = ({ icon = 'analytics', color = '#1f2937', children }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionHeaderLeft}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={[styles.sectionTitle, { color }]}>{children}</Text>
    </View>
  </View>
);

const StatCard = ({ label, value, icon, color }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const BarRow = ({ label, value, max = 1, sub, color = '#2563eb' }) => {
  const widthPct = Math.max(2, Math.min(100, (n(value) / Math.max(1, n(max))) * 100));
  return (
    <View style={styles.barRow}>
      <View style={styles.barRowHeader}>
        <Text style={styles.barRowLabel} numberOfLines={1}>{label}</Text>
        <Text style={styles.barRowValue}>{fmtNum(value)}</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${widthPct}%`, backgroundColor: color }]} />
      </View>
      {!!sub && <Text style={styles.barRowSub}>{sub}</Text>}
    </View>
  );
};

const Empty = ({ text = 'Aucune donnée' }) => (
  <View style={styles.empty}>
    <Ionicons name="ban" size={18} color="#9ca3af" />
    <Text style={styles.emptyText}>{text}</Text>
  </View>
);

const todayISO = () => new Date().toISOString().slice(0, 10);
const daysAgoISO = (d) => {
  const dt = new Date();
  dt.setDate(dt.getDate() - d);
  return dt.toISOString().slice(0, 10);
};

const AdminStatsScreen = ({
  user,
  onBack,
  onHome,
  onNavigate,
  screenHistory,
  currentScreen,
}) => {
  const isAdmin = user?.type === 'admin';

  const [from, setFrom] = useState(daysAgoISO(30));
  const [to, setTo] = useState(todayISO());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [err, setErr] = useState(null);
  const [dash, setDash] = useState(null);

  const fetchData = useCallback(async () => {
    if (!isAdmin) return;
    setErr(null);
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem(KEY_TOKEN);
      const h = token ? { Authorization: `Bearer ${token}` } : {};
      const qs = `?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
      const r = await fetch(`${API_BASE}/admin/stats/dashboard${qs}`, { headers: h });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d?.message || 'Erreur de chargement');
      setDash(d?.data || null);
    } catch (e) {
      setErr(e?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  }, [from, to, isAdmin]);

  useEffect(() => { if (isAdmin) fetchData(); }, [isAdmin, fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await fetchData(); } finally { setRefreshing(false); }
  }, [fetchData]);

  const setPreset = (days) => {
    setFrom(daysAgoISO(days));
    setTo(todayISO());
  };
  const setThisMonth = () => {
    const d = new Date();
    const start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
    setFrom(start);
    setTo(todayISO());
  };
  const setThisYear = () => {
    const d = new Date();
    const start = `${d.getFullYear()}-01-01`;
    setFrom(start);
    setTo(todayISO());
  };

  const exportCSV = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem(KEY_TOKEN);
      const h = { Authorization: `Bearer ${token}` };
      const qs = `?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
      const url = `${API_BASE}/admin/orders/export.csv${qs}`;
      const res = await fetch(url, { headers: h });
      const txt = await res.text();
      if (!res.ok) throw new Error('Export impossible');

      const filename = `orders_export_${from}_to_${to}.csv`;
      const path = FileSystem.cacheDirectory + filename;
      await FileSystem.writeAsStringAsync(path, txt, { encoding: FileSystem.EncodingType.UTF8 });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(path, { dialogTitle: 'Exporter les commandes' });
      } else {
        // fallback: ouvrir l’URL locale (Android accepte file://)
        await Linking.openURL(path);
      }
    } catch (e) {
      Alert.alert('Export CSV', e?.message || 'Impossible de générer le fichier');
    }
  }, [from, to]);

  // --- Sécuriser les accès aux champs
  const ordersTotals = dash?.orders?.totals || {};
  const ordersByStatus = dash?.orders?.byStatus || [];
  const ordersDaily = dash?.orders?.daily || [];

  const signupsTotals = dash?.signups?.totals || {};
  const signupsDaily = dash?.signups?.daily || [];

  const usersByCity = dash?.usageByCity?.users || [];
  const ordersByCity = dash?.usageByCity?.orders || [];

  const productsSoldTotals = dash?.productsSold?.totals || {};
  const topProducts = dash?.productsSold?.topProducts || [];

  const abandonTotals = dash?.abandonments?.totals || {};
  const abandonDaily = dash?.abandonments?.daily || [];
  const abandonByReason = dash?.abandonments?.byReason || [];

  // max pour barres
  const maxOrdersDaily = Math.max(1, ...ordersDaily.map((x) => n(x.orders)));
  const maxSignupsDaily = Math.max(1, ...signupsDaily.map((x) => n(x.signups)));
  const maxUsersCity = Math.max(1, ...usersByCity.map((x) => n(x.users)));
  const maxOrdersCity = Math.max(1, ...ordersByCity.map((x) => n(x.orders)));
  const maxTopQty = Math.max(1, ...topProducts.map((x) => n(x.total_qty)));
  const maxAbandDaily = Math.max(1, ...abandonDaily.map((x) => n(x.abandons)));

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <Header
          title="📊 Statistiques (Admin)"
          onBack={onBack}
          onHome={onHome}
          screenHistory={screenHistory}
          currentScreen={currentScreen}
          user={user}
        />
        <View style={styles.center}><Text style={styles.warnText}>Accès réservé aux administrateurs.</Text></View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="📊 Statistiques détaillées"
        onBack={onBack}
        onHome={onHome}
        screenHistory={screenHistory}
        currentScreen={currentScreen}
        user={user}
      />

      {/* Filtres */}
      <View style={styles.filters}>
        <View style={styles.inputWrap}>
          <Text style={styles.inputLabel}>Du</Text>
          <TextInput
            value={from}
            onChangeText={setFrom}
            placeholder="AAAA-MM-JJ"
            style={styles.input}
            keyboardType={Platform.select({ ios: 'numbers-and-punctuation', android: 'numeric' })}
          />
        </View>
        <View style={styles.inputWrap}>
          <Text style={styles.inputLabel}>Au</Text>
          <TextInput
            value={to}
            onChangeText={setTo}
            placeholder="AAAA-MM-JJ"
            style={styles.input}
            keyboardType={Platform.select({ ios: 'numbers-and-punctuation', android: 'numeric' })}
          />
        </View>
      </View>

      <View style={styles.quickRow}>
        <TouchableOpacity style={styles.quickBtn} onPress={() => setPreset(7)}>
          <Text style={styles.quickTxt}>7 jours</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickBtn} onPress={() => setPreset(30)}>
          <Text style={styles.quickTxt}>30 jours</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickBtn} onPress={setThisMonth}>
          <Text style={styles.quickTxt}>Ce mois</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickBtn} onPress={setThisYear}>
          <Text style={styles.quickTxt}>Cette année</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.quickBtn, styles.refreshBtn]} onPress={fetchData}>
          <Ionicons name="refresh" size={16} color="white" />
          <Text style={[styles.quickTxt, { color: 'white' }]}>Actualiser</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={styles.loadingText}>Chargement…</Text>
          {!!err && <Text style={styles.errorText}>{err}</Text>}
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* KPIs période */}
          <View style={styles.kpiRow}>
            <StatCard label="Commandes (période)" value={fmtNum(ordersTotals.total_orders ?? 0)} icon="receipt" color="#7c3aed" />
            <StatCard label="Revenus (période)" value={fmtMoney(ordersTotals.total_revenue ?? 0)} icon="cash" color="#dc2626" />
          </View>
          <View style={styles.kpiRow}>
            <StatCard label="Inscriptions (période)" value={fmtNum(signupsTotals.total_signups ?? 0)} icon="person-add" color="#2563eb" />
            <StatCard label="Abandons (période)" value={fmtNum(abandonTotals.total ?? 0)} icon="close-circle" color="#ef4444" />
          </View>

          {/* Export */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.exportBtn} onPress={exportCSV}>
              <Ionicons name="download" size={18} color="white" />
              <Text style={styles.exportTxt}>Exporter CSV (commandes)</Text>
            </TouchableOpacity>
          </View>

          {/* Commandes par statut */}
          <SectionTitle icon="list" color="#8b5cf6">Commandes par statut</SectionTitle>
          <View style={styles.card}>
            {ordersByStatus.length ? (
              ordersByStatus.map((s, i) => (
                <BarRow
                  key={`st-${i}`}
                  label={s.status}
                  value={s.count}
                  max={Math.max(1, ...ordersByStatus.map((x) => n(x.count)))}
                  sub={`${fmtMoney(s.revenue)}`
                  }
                  color="#8b5cf6"
                />
              ))
            ) : <Empty text="Aucune commande sur la période" />}
          </View>

          {/* Évolution quotidienne des commandes */}
          <SectionTitle icon="calendar" color="#6366f1">Commandes quotidiennes</SectionTitle>
          <View style={styles.card}>
            {ordersDaily.length ? (
              ordersDaily.map((d, i) => (
                <BarRow
                  key={`od-${i}`}
                  label={new Date(d.day).toLocaleDateString('fr-FR')}
                  value={d.orders}
                  max={maxOrdersDaily}
                  sub={`${fmtMoney(d.total_amount ?? d.revenue ?? 0)}`}
                  color="#6366f1"
                />
              ))
            ) : <Empty text="Aucune commande au jour le jour" />}
          </View>

          {/* Inscriptions quotidiennes */}
          <SectionTitle icon="person-add" color="#3b82f6">Inscriptions quotidiennes</SectionTitle>
          <View style={styles.card}>
            {signupsDaily.length ? (
              signupsDaily.map((d, i) => (
                <BarRow
                  key={`sd-${i}`}
                  label={new Date(d.day).toLocaleDateString('fr-FR')}
                  value={d.signups}
                  max={maxSignupsDaily}
                  color="#3b82f6"
                />
              ))
            ) : <Empty text="Aucune inscription" />}
          </View>

          {/* Utilisation par ville */}
          <SectionTitle icon="location" color="#10b981">Utilisation par ville</SectionTitle>
          <View style={styles.card}>
            <Text style={styles.cardSubtitle}>👥 Utilisateurs (Top 5)</Text>
            {usersByCity.slice(0, 5).map((row, i) => (
              <BarRow
                key={`uc-${i}`}
                label={row.city}
                value={row.users}
                max={maxUsersCity}
                color="#10b981"
              />
            ))}
            {!usersByCity.length && <Empty text="Aucune donnée d’utilisateurs" />}

            <View style={styles.separator} />
            <Text style={styles.cardSubtitle}>🧾 Commandes (Top 5)</Text>
            {ordersByCity.slice(0, 5).map((row, i) => (
              <BarRow
                key={`oc-${i}`}
                label={row.city}
                value={row.orders}
                max={maxOrdersCity}
                sub={`${fmtMoney(row.revenue)}`}
                color="#14b8a6"
              />
            ))}
            {!ordersByCity.length && <Empty text="Aucune commande par ville" />}
          </View>

          {/* Produits vendus */}
          <SectionTitle icon="leaf" color="#22c55e">Produits vendus</SectionTitle>
          <View style={styles.card}>
            <View style={styles.rowWrap}>
              <View style={styles.badge}>
                <Text style={styles.badgeLabel}>Quantité</Text>
                <Text style={styles.badgeValue}>{fmtNum(productsSoldTotals.total_qty ?? 0)}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeLabel}>Revenus</Text>
                <Text style={styles.badgeValue}>{fmtMoney(productsSoldTotals.total_revenue ?? 0)}</Text>
              </View>
            </View>
            <View style={styles.separator} />
            <Text style={styles.cardSubtitle}>Top produits</Text>
            {topProducts.length ? (
              topProducts.map((p, i) => (
                <BarRow
                  key={`tp-${p.id}-${i}`}
                  label={p.name}
                  value={p.total_qty}
                  max={maxTopQty}
                  sub={`${fmtMoney(p.total_amount)}`}
                  color="#22c55e"
                />
              ))
            ) : <Empty text="Aucun produit vendu" />}
          </View>

          {/* Abandons */}
          <SectionTitle icon="close-circle" color="#ef4444">Achats abandonnés</SectionTitle>
          <View style={styles.card}>
            <View style={styles.rowWrap}>
              <View style={styles.badge}>
                <Text style={styles.badgeLabel}>Total abandons</Text>
                <Text style={styles.badgeValue}>{fmtNum(abandonTotals.total ?? 0)}</Text>
              </View>
            </View>
            <View style={styles.separator} />
            <Text style={styles.cardSubtitle}>Quotidien</Text>
            {abandonDaily.length ? (
              abandonDaily.map((d, i) => (
                <BarRow
                  key={`ad-${i}`}
                  label={new Date(d.day).toLocaleDateString('fr-FR')}
                  value={d.abandons}
                  max={maxAbandDaily}
                  color="#ef4444"
                />
              ))
            ) : <Empty text="Aucun abandon détecté" />}
            <View style={styles.separator} />
            <Text style={styles.cardSubtitle}>Par raison</Text>
            {abandonByReason.length ? (
              abandonByReason.map((r, i) => (
                <BarRow
                  key={`ar-${i}`}
                  label={r.reason}
                  value={r.count}
                  max={Math.max(1, ...abandonByReason.map((x) => n(x.count)))}
                  color="#f97316"
                />
              ))
            ) : <Empty text="Aucune raison remontée" />}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { flex: 1 },
  contentContainer: { padding: 16, paddingBottom: 120 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 8, color: '#6b7280' },
  errorText: { marginTop: 8, color: '#dc2626' },
  warnText: { color: '#dc2626', fontWeight: '600' },

  filters: { flexDirection: 'row', gap: 12, padding: 12, paddingBottom: 0 },
  inputWrap: { flex: 1 },
  inputLabel: { fontSize: 12, color: '#6b7280', marginBottom: 6 },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 14,
    color: '#111827',
  },
  quickRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, marginTop: 10, marginBottom: 6, flexWrap: 'wrap'
  },
  quickBtn: {
    backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb',
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
  },
  quickTxt: { color: '#374151', fontWeight: '600', fontSize: 12 },
  refreshBtn: { backgroundColor: '#2563eb', borderColor: '#2563eb', flexDirection: 'row', alignItems: 'center', gap: 6 },

  kpiRow: { flexDirection: 'row', gap: 12, marginTop: 8, paddingHorizontal: 12 },
  statCard: {
    flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 16,
    alignItems: 'flex-start', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 1 }, shadowRadius: 2, elevation: 2,
  },
  statIcon: {
    width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  statValue: { fontSize: 18, fontWeight: '700', color: '#111827' },
  statLabel: { fontSize: 12, color: '#6b7280', marginTop: 2 },

  sectionHeader: { marginTop: 12, marginBottom: 8, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },

  card: {
    backgroundColor: 'white', borderRadius: 16, padding: 16, marginHorizontal: 12, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 1 }, shadowRadius: 2, elevation: 2,
  },
  cardSubtitle: { fontSize: 13, color: '#374151', fontWeight: '600', marginBottom: 8 },

  rowWrap: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  badge: {
    backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb',
    borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, marginRight: 8, marginBottom: 8,
  },
  badgeLabel: { fontSize: 12, color: '#6b7280' },
  badgeValue: { fontSize: 16, color: '#111827', fontWeight: '700', marginTop: 2 },

  barRow: { marginBottom: 10 },
  barRowHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  barRowLabel: { fontSize: 13, color: '#374151', flex: 1, paddingRight: 8 },
  barRowValue: { fontSize: 13, color: '#111827', fontWeight: '700' },
  barTrack: { width: '100%', height: 8, backgroundColor: '#eef2ff', borderRadius: 8, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 8 },
  barRowSub: { fontSize: 12, color: '#6b7280', marginTop: 4 },

  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 8, paddingHorizontal: 12 },
  exportBtn: {
    flex: 1, backgroundColor: '#16a34a', borderRadius: 12, padding: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 1 }, shadowRadius: 2, elevation: 2,
  },
  exportTxt: { color: 'white', fontWeight: '700' },

  empty: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12 },
  emptyText: { color: '#9ca3af' },
});

export default AdminStatsScreen;
