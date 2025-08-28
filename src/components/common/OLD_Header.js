import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Props attendues (toutes optionnelles sauf title):
 * - title: string
 * - user: { name?: string, type?: 'farmer'|'buyer'|'admin' }
 * - onBack: () => void
 * - onHome: () => void
 * - onNavigate: (screen: string, params?: any) => void   // facultatif, mais utilisé pour le bouton Profil
 * - screenHistory: string[]
 * - currentScreen: string
 */
const Header = ({
  title = 'AgriConnect RCA',
  user,
  onBack,
  onHome,
  onNavigate,
  screenHistory,
  currentScreen,
}) => {
  const canGoBack = Array.isArray(screenHistory) && screenHistory.length > 0;

  const userEmoji = (() => {
    switch (user?.type) {
      case 'farmer':
        return '👨‍🌾';
      case 'buyer':
        return '🛒';
      case 'admin':
        return '👑';
      default:
        return '👤';
    }
  })();

  const openProfile = () => {
    if (onNavigate) {
      onNavigate('profile');
    } else if (onHome) {
      // fallback doux si onNavigate n'est pas fourni
      onHome();
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.bar}>
        {/* Bouton gauche: Back si possible, sinon Home */}
        {canGoBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={styles.iconBtn}
            accessibilityRole="button"
            accessibilityLabel="Revenir en arrière"
          >
            <Ionicons name="arrow-back" size={22} color="#111827" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={onHome}
            style={styles.iconBtn}
            accessibilityRole="button"
            accessibilityLabel="Retour à l'accueil"
          >
            <Ionicons name="home" size={22} color="#111827" />
          </TouchableOpacity>
        )}

        {/* Titre centré */}
        <View style={styles.center}>
          <Text numberOfLines={1} style={styles.title}>
            {title}
          </Text>
          {/* Sous-titre léger : écran courant (facultatif) */}
          {!!currentScreen && (
            <Text numberOfLines={1} style={styles.subtitle}>
              {labelForScreen(currentScreen)}
            </Text>
          )}
        </View>

        {/* Bouton droit: Profil si user, sinon placeholder pour équilibrer */}
        {user ? (
          <TouchableOpacity
            onPress={openProfile}
            style={styles.profileBtn}
            accessibilityRole="button"
            accessibilityLabel="Ouvrir mon profil"
          >
            <Text style={styles.avatar}>{userEmoji}</Text>
            <Text numberOfLines={1} style={styles.userName}>
              {user?.name || 'Profil'}
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#6b7280" />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconBtn} />
        )}
      </View>
    </View>
  );
};

function labelForScreen(key) {
  switch (key) {
    case 'home':
      return 'Accueil';
    case 'products':
      return 'Produits';
    case 'productDetails':
      return 'Détails du produit';
    case 'productForm':
      return 'Nouveau produit';
    case 'cart':
      return 'Mon panier';
    case 'favorites':
      return 'Favoris';
    case 'orders':
      return 'Mes commandes';
    case 'notifications':
      return 'Notifications';
    case 'settings':
      return 'Paramètres';
    case 'login':
      return 'Connexion';
    case 'register':
      return 'Inscription';
    case 'profile':
      return 'Mon profil';
    case 'farmerDashboard':
      return 'Tableau de bord (agriculteur)';
    case 'farmerProducts':
      return 'Mes produits (agriculteur)';
    case 'salesHistory':
      return 'Historique des ventes';
    case 'adminDashboard':
      return 'Administration';
    case 'users':
      return 'Utilisateurs';
    case 'forgotPassword':
      return 'Mot de passe oublié';
    default:
      return '';
  }
}

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: Platform.select({ ios: 52, android: 24, default: 16 }),
    backgroundColor: '#ffffff',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 12,
    gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: 11,
    color: '#6b7280',
  },
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 10,
    height: 40,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    maxWidth: 180,
  },
  avatar: {
    fontSize: 16,
  },
  userName: {
    color: '#374151',
    fontWeight: '600',
    maxWidth: 110,
  },
});

export default Header;
