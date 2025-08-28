import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../common/Header';

const RoleBadge = ({ type }) => {
  const map = {
    farmer: { label: 'Agriculteur', color: '#16a34a' },
    buyer:  { label: 'Acheteur',   color: '#2563eb' },
    admin:  { label: 'Admin',      color: '#7c3aed' }
  };
  const { label, color } = map[type] || { label: 'Utilisateur', color:'#6b7280' };
  return (
    <View style={[styles.badge, { backgroundColor: color + '22' }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
};

export default function UsersScreen({
  user,
  users = [],
  onUpdateUser,
  onResetPassword,
  onToggleActive,
  onDeleteUser,
  onBack, onHome, onNavigate, screenHistory, currentScreen
}) {
  const [roleFilter, setRoleFilter] = useState('all');
  const filtered = useMemo(() => users.filter(u => roleFilter === 'all' ? true : u.type === roleFilter), [users, roleFilter]);
  const cycleRole = (r) => r === 'farmer' ? 'buyer' : r === 'buyer' ? 'admin' : 'farmer';

  return (
    <View style={styles.container}>
      <Header title="👥 Utilisateurs" onBack={onBack} onHome={onHome} screenHistory={screenHistory} currentScreen={currentScreen} user={user} />

      <View style={styles.tabs}>
        {[
          { id:'all', label:'Tous' },
          { id:'farmer', label:'Agriculteurs' },
          { id:'buyer', label:'Acheteurs' },
          { id:'admin', label:'Admins' },
        ].map(t => (
          <TouchableOpacity key={t.id} onPress={() => setRoleFilter(t.id)} style={[styles.tab, roleFilter===t.id && styles.tabActive]}>
            <Text style={[styles.tabText, roleFilter===t.id && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {filtered.map(u => (
          <View key={u.id} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.name}>{u.name}</Text>
              <RoleBadge type={u.type} />
            </View>
            <Text style={styles.meta}>📞 {u.phone}</Text>
            <Text style={styles.meta}>📍 {u.location || 'RCA'}</Text>

            <View style={styles.actions}>
              <TouchableOpacity style={[styles.btn, { backgroundColor:'#2563eb' }]} onPress={() => onUpdateUser?.(u.id, { type: cycleRole(u.type) })}>
                <Ionicons name="swap-horizontal" size={18} color="white" />
                <Text style={styles.btnText}>Changer rôle</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.btn, { backgroundColor:'#f59e0b' }]} onPress={() => onResetPassword?.(u.id)}>
                <Ionicons name="key" size={18} color="white" />
                <Text style={styles.btnText}>Réinit. MDP</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.btn, { backgroundColor: (u.isActive ?? true) ? '#dc2626' : '#16a34a' }]} onPress={() => onToggleActive?.(u.id)}>
                <Ionicons name={(u.isActive ?? true) ? 'pause' : 'play'} size={18} color="white" />
                <Text style={styles.btnText}>{(u.isActive ?? true) ? 'Désactiver' : 'Activer'}</Text>
              </TouchableOpacity>

              {u.type !== 'admin' && (
                <TouchableOpacity style={[styles.btn, { backgroundColor:'#111827' }]} onPress={() => onDeleteUser?.(u.id)}>
                  <Ionicons name="trash" size={18} color="white" />
                  <Text style={styles.btnText}>Supprimer</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        {filtered.length === 0 && (
          <View style={{ alignItems:'center', padding:24 }}>
            <Text style={{ color:'#6b7280' }}>Aucun utilisateur</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:'#f9fafb' },
  tabs:{ flexDirection:'row', backgroundColor:'white', paddingHorizontal:12, paddingVertical:8, gap:8 },
  tab:{ paddingVertical:8, paddingHorizontal:12, borderRadius:10, backgroundColor:'#f3f4f6' },
  tabActive:{ backgroundColor:'#16a34a22' },
  tabText:{ color:'#6b7280', fontWeight:'600' },
  tabTextActive:{ color:'#16a34a' },
  content:{ flex:1 }, contentContainer:{ padding:16, paddingBottom:120, gap:12 },
  card:{ backgroundColor:'white', borderRadius:16, padding:16, shadowColor:'#000', shadowOpacity:0.05, shadowRadius:3, elevation:2, gap:8 },
  row:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  name:{ fontSize:16, fontWeight:'700', color:'#1f2937' },
  meta:{ color:'#6b7280' },
  badge:{ paddingVertical:4, paddingHorizontal:10, borderRadius:999 },
  badgeText:{ fontWeight:'700', fontSize:12 },
  actions:{ flexDirection:'row', flexWrap:'wrap', gap:8, marginTop:8 },
  btn:{ flexDirection:'row', alignItems:'center', gap:8, paddingHorizontal:12, paddingVertical:10, borderRadius:12 },
  btnText:{ color:'white', fontWeight:'700' },
});
