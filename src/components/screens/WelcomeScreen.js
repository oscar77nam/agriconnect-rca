import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const WelcomeScreen = ({ onNavigate }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🌾</Text>
        <Text style={styles.title}>AgriConnect</Text>
        <Text style={styles.subtitle}>RCA</Text>
        <Text style={styles.description}>L'agriculture centrafricaine connectée</Text>
        
        <View style={styles.tagsContainer}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>🥔 Manioc</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>🌽 Maïs</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>🥬 Légumes</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>🍅 Fruits</Text>
          </View>
        </View>
        
        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <Text style={styles.featureEmoji}>👨‍🌾</Text>
            <Text style={styles.featureText}>Vendez vos produits</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureEmoji}>🛒</Text>
            <Text style={styles.featureText}>Achetez local</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureEmoji}>📱</Text>
            <Text style={styles.featureText}>Simple et rapide</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => onNavigate('login')}
        >
          <Text style={styles.loginButtonText}>🔐 Se connecter</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => onNavigate('register')}
        >
          <Text style={styles.buttonText}>🚀 Créer un compte</Text>
        </TouchableOpacity>
        
        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitText}>✓ Gratuit à utiliser</Text>
          <Text style={styles.benefitText}>✓ Paiement sécurisé</Text>
          <Text style={styles.benefitText}>✓ Livraison rapide</Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>🇨🇫 Développé pour les agriculteurs de RCA</Text>
        <Text style={styles.footerSubtext}>
          Connecter • Vendre • Prospérer
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#16a34a',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 100,
    marginBottom: 24,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#fef3c7',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 20,
    color: 'white',
    opacity: 0.9,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 28,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 32,
  },
  feature: {
    alignItems: 'center',
    flex: 1,
  },
  featureEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.9,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
    shadowColor: '#2563eb',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonText: {
    color: '#16a34a',
    fontSize: 18,
    fontWeight: 'bold',
  },
  benefitsContainer: {
    alignItems: 'center',
    gap: 4,
  },
  benefitText: {
    color: 'white',
    fontSize: 14,
    opacity: 0.8,
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    color: 'white',
    fontSize: 14,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 4,
  },
  footerSubtext: {
    color: 'white',
    fontSize: 12,
    opacity: 0.6,
    fontStyle: 'italic',
  },
});

export default WelcomeScreen;