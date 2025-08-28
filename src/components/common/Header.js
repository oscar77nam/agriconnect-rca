// src/components/common/Header.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Header = ({ 
  title, 
  onBack, 
  onHome, 
  onNext, 
  onLogout 
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.row}>
        {/* Bouton Accueil */}
        <TouchableOpacity onPress={onHome} style={styles.btn}>
          <Ionicons name="home" size={20} color="#fff" />
          <Text style={styles.btnText}>Accueil</Text>
        </TouchableOpacity>

        {/* Bouton Précédent */}
        <TouchableOpacity onPress={onBack} style={styles.btn}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
          <Text style={styles.btnText}>Précédent</Text>
        </TouchableOpacity>

        {/* Bouton Suivant */}
        <TouchableOpacity onPress={onNext} style={styles.btn}>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
          <Text style={styles.btnText}>Suivant</Text>
        </TouchableOpacity>

        {/* Bouton Déconnexion */}
        <TouchableOpacity onPress={onLogout} style={styles.btn}>
          <Ionicons name="log-out" size={20} color="#fff" />
          <Text style={styles.btnText}>Déconnexion</Text>
        </TouchableOpacity>
      </View>

      {title && <Text style={styles.title}>{title}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#2563eb',
    paddingTop: 40,   // <-- espace pour descendre sous la barre de statut
    paddingBottom: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e40af',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 6,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e40af',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  btnText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 12,
  },
  title: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default Header;
