import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const WelcomeScreen = ({ onNavigate }) => (
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
          <Text style={styles.tagText}>🐔 Élevage</Text>
        </View>
      </View>
    </View>
    
    <View style={styles.buttonContainer}>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => onNavigate('register')}
      >
        <Text style={styles.buttonText}>🚀 Commencer maintenant</Text>
      </TouchableOpacity>
    </View>
    
    <View style={styles.footer}>
      <Text style={styles.footerText}>🇨🇫 Développé pour les agriculteurs de RCA</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#16a34a', // équivalent à bg-green-600
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    marginBottom: 32,
  },
  emoji: {
    fontSize: 100,
    marginBottom: 24,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fef3c7', // équivalent à text-yellow-100
    marginBottom: 16,
  },
  description: {
    fontSize: 20,
    color: 'white',
    opacity: 0.9,
    marginBottom: 24,
    textAlign: 'center',
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
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#16a34a',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    color: 'white',
    fontSize: 12,
    opacity: 0.7,
  },
});

export default WelcomeScreen;