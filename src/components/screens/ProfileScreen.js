import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../common/Header';

const ProfileScreen = ({ 
  user,
  getStats,
  logout,
  onBack,
  onHome,
  onNavigate,
  screenHistory,
  currentScreen
}) => {
  const stats = getStats ? getStats() : {};

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnecter', 
          style: 'destructive', 
          onPress: async () => {
            try {
              if (logout) {
                await logout();
              } else {
                Alert.alert('Erreur', 'Fonction de déconnexion non disponible');
              }
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de se déconnecter. Veuillez réessayer.');
            }
          }
        }
      ]
    );
  };

  const getUserTypeLabel = () => {
    switch(user?.type) {
      case 'farmer': return 'Agriculteur';
      case 'buyer': return 'Acheteur';
      case 'admin': return 'Administrateur';
      default: return 'Utilisateur';
    }
  };

  const getUserEmoji = () => {
    switch(user?.type) {
      case 'farmer': return '👨‍🌾';
      case 'buyer': return '🛒';
      case 'admin': return '👑';
      default: return '👤';
    }
  };

  return (
    <View style={styles.container}>
      <Header 
        title="👤 Mon Profil"
        onBack={onBack}
        onHome={onHome}
        screenHistory={screenHistory}
        currentScreen={currentScreen}
        user={user}
      />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Carte Profil */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>{getUserEmoji()}</Text>
            </View>
            <Text style={styles.userName}>{user?.name || 'Utilisateur'}</Text>
            <Text style={styles.userType}>{getUserTypeLabel()}</Text>
          </View>
          
          <View style={styles.userInfo}>
            <View style={styles.infoItem}>
              <Ionicons name="call" size={20} color="#9ca3af" />
              <Text style={styles.infoText}>{user?.phone || 'Téléphone non renseigné'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="location" size={20} color="#9ca3af" />
              <Text style={styles.infoText}>{user?.location || 'Localisation non renseignée'}</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>⚙️ Actions</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onNavigate && onNavigate('settings')}
          >
            <Ionicons name="settings" size={20} color="#374151" />
            <Text style={styles.actionText}>Paramètres du compte</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out" size={20} color="#dc2626" />
            <Text style={[styles.actionText, styles.logoutText]}>Déconnexion</Text>
            <Ionicons name="chevron-forward" size={20} color="#dc2626" />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>🇨🇫 AgriConnect RCA v1.0</Text>
          <Text style={styles.footerSubtext}>Connecter l'agriculture centrafricaine</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { flex: 1 },
  contentContainer: { padding: 24, paddingBottom: 120 },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 3, elevation: 3,
  },
  profileHeader: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#16a34a', alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  avatarEmoji: { fontSize: 40 },
  userName: { fontSize: 24, fontWeight: 'bold', marginBottom: 4, color: '#1f2937' },
  userType: { fontSize: 16, color: '#6b7280', fontWeight: '500' },
  userInfo: { gap: 16 },
  infoItem: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, backgroundColor: '#f9fafb',
    borderRadius: 12, gap: 12,
  },
  infoText: { fontSize: 16, color: '#374151', flex: 1 },
  actionsSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 },
  actionButton: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'white', padding: 16, borderRadius: 12,
    marginBottom: 8, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 2, elevation: 1,
  },
  logoutButton: { borderWidth: 1, borderColor: '#fee2e2', backgroundColor: '#fef2f2' },
  actionText: { flex: 1, fontSize: 16, color: '#374151', fontWeight: '500' },
  logoutText: { color: '#dc2626' },
  footer: { alignItems: 'center', paddingTop: 24, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  footerText: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 4 },
  footerSubtext: { fontSize: 14, color: '#6b7280' },
});

export default ProfileScreen;
