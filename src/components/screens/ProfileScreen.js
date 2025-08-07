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
              console.log('🚪 Début de la déconnexion...');
              
              // Appeler la fonction logout du hook
              if (logout) {
                await logout();
                console.log('✅ Déconnexion réussie');
              } else {
                console.error('❌ Fonction logout non disponible');
                Alert.alert('Erreur', 'Fonction de déconnexion non disponible');
              }
              
            } catch (error) {
              console.error('❌ Erreur lors de la déconnexion:', error);
              Alert.alert(
                'Erreur', 
                'Impossible de se déconnecter. Veuillez réessayer.',
                [{ text: 'OK' }]
              );
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

  const getStatsCards = () => {
    if (user?.type === 'farmer') {
      return [
        {
          title: 'Produits',
          value: stats.productsCount || 0,
          icon: 'cube',
          color: '#16a34a'
        },
        {
          title: 'Commandes',
          value: stats.ordersCount || 0,
          icon: 'receipt',
          color: '#2563eb'
        },
        {
          title: 'Revenus (FCFA)',
          value: (stats.totalRevenue || 0).toLocaleString(),
          icon: 'card',
          color: '#dc2626'
        },
        {
          title: 'Total vendu (kg)',
          value: stats.totalSold || 0,
          icon: 'trending-up',
          color: '#7c3aed'
        }
      ];
    } else if (user?.type === 'buyer') {
      return [
        {
          title: 'Mes commandes',
          value: stats.ordersCount || 0,
          icon: 'bag',
          color: '#2563eb'
        },
        {
          title: 'Total dépensé (FCFA)',
          value: (stats.totalSpent || 0).toLocaleString(),
          icon: 'card',
          color: '#dc2626'
        },
        {
          title: 'Favoris',
          value: stats.favoritesCount || 0,
          icon: 'heart',
          color: '#f59e0b'
        },
        {
          title: 'Panier',
          value: stats.cartItemsCount || 0,
          icon: 'bag-handle',
          color: '#16a34a'
        }
      ];
    } else if (user?.type === 'admin') {
      return [
        {
          title: 'Total produits',
          value: stats.totalProducts || 0,
          icon: 'cube',
          color: '#16a34a'
        },
        {
          title: 'Total commandes',
          value: stats.totalOrders || 0,
          icon: 'receipt',
          color: '#2563eb'
        },
        {
          title: 'Agriculteurs',
          value: stats.totalFarmers || 0,
          icon: 'people',
          color: '#7c3aed'
        },
        {
          title: 'Revenus (FCFA)',
          value: (stats.totalRevenue || 0).toLocaleString(),
          icon: 'trending-up',
          color: '#dc2626'
        }
      ];
    }
    return [];
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
      
      <View style={[styles.header, { backgroundColor: user?.type === 'farmer' ? '#16a34a' : user?.type === 'buyer' ? '#2563eb' : '#7c3aed' }]}>
        <Text style={styles.headerText}>Informations et statistiques</Text>
      </View>
      
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
            <View style={styles.infoItem}>
              <Ionicons name="calendar" size={20} color="#9ca3af" />
              <Text style={styles.infoText}>
                Membre depuis {new Date().toLocaleDateString('fr-FR')}
              </Text>
            </View>
          </View>
        </View>

        {/* Statistiques */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>📊 Mes statistiques</Text>
          <View style={styles.statsGrid}>
            {getStatsCards().map((stat, index) => (
              <View key={index} style={[styles.statCard, { borderLeftColor: stat.color }]}>
                <View style={styles.statHeader}>
                  <Ionicons name={stat.icon} size={24} color={stat.color} />
                  <Text style={styles.statTitle}>{stat.title}</Text>
                </View>
                <Text style={[styles.statValue, { color: stat.color }]}>
                  {stat.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Section Conseils */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>💡 Conseils</Text>
          <View style={styles.tipCard}>
            {user?.type === 'farmer' ? (
              <>
                <Text style={styles.tipText}>
                  🌱 Ajoutez des photos de qualité à vos produits
                </Text>
                <Text style={styles.tipText}>
                  📅 Mettez à jour régulièrement vos stocks
                </Text>
                <Text style={styles.tipText}>
                  🌿 Les produits biologiques se vendent mieux
                </Text>
              </>
            ) : user?.type === 'buyer' ? (
              <>
                <Text style={styles.tipText}>
                  ❤️ Utilisez les favoris pour retrouver vos produits préférés
                </Text>
                <Text style={styles.tipText}>
                  🛒 Vérifiez votre panier avant de commander
                </Text>
                <Text style={styles.tipText}>
                  ⭐ Laissez des avis pour aider les autres acheteurs
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.tipText}>
                  👥 Surveillez l'activité des utilisateurs
                </Text>
                <Text style={styles.tipText}>
                  📈 Analysez les tendances de vente
                </Text>
                <Text style={styles.tipText}>
                  🔧 Maintenez la qualité de la plateforme
                </Text>
              </>
            )}
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
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="help-circle" size={20} color="#374151" />
            <Text style={styles.actionText}>Aide et support</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="document-text" size={20} color="#374151" />
            <Text style={styles.actionText}>Conditions d'utilisation</Text>
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
          <Text style={styles.footerText}>
            🇨🇫 AgriConnect RCA v1.0
          </Text>
          <Text style={styles.footerSubtext}>
            Connecter l'agriculture centrafricaine
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 24,
  },
  headerText: {
    color: 'white',
    fontSize: 16,
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 120,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarEmoji: {
    fontSize: 40,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1f2937',
  },
  userType: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  userInfo: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  statsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  statsGrid: {
    gap: 12,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  tipsSection: {
    marginBottom: 24,
  },
  tipCard: {
    backgroundColor: '#fffbeb',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  tipText: {
    fontSize: 14,
    color: '#92400e',
    marginBottom: 8,
    lineHeight: 20,
  },
  actionsSection: {
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#fee2e2',
    backgroundColor: '#fef2f2',
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  logoutText: {
    color: '#dc2626',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
});

export default ProfileScreen;