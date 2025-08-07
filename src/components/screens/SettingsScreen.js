import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../common/Header';

const SettingsScreen = ({ 
  user,
  onBack,
  onHome,
  screenHistory,
  currentScreen
}) => {
  const [settings, setSettings] = useState({
    notifications: true,
    emailNotifications: false,
    darkMode: false,
    locationTracking: true,
    autoLogout: false
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const SettingItem = ({ icon, title, description, value, onToggle, color = '#6b7280' }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <View style={[styles.settingIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#d1d5db', true: color + '40' }}
        thumbColor={value ? color : '#f3f4f6'}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Header 
        title="⚙️ Paramètres"
        onBack={onBack}
        onHome={onHome}
        screenHistory={screenHistory}
        currentScreen={currentScreen}
        user={user}
      />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Section Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 Notifications</Text>
          
          <SettingItem
            icon="notifications"
            title="Notifications push"
            description="Recevoir des notifications sur votre appareil"
            value={settings.notifications}
            onToggle={() => toggleSetting('notifications')}
            color="#2563eb"
          />
          
          <SettingItem
            icon="mail"
            title="Notifications email"
            description="Recevoir des emails pour les commandes importantes"
            value={settings.emailNotifications}
            onToggle={() => toggleSetting('emailNotifications')}
            color="#16a34a"
          />
        </View>

        {/* Section Apparence */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 Apparence</Text>
          
          <SettingItem
            icon="moon"
            title="Mode sombre"
            description="Interface sombre pour vos yeux"
            value={settings.darkMode}
            onToggle={() => toggleSetting('darkMode')}
            color="#7c3aed"
          />
        </View>

        {/* Section Confidentialité */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔒 Confidentialité</Text>
          
          <SettingItem
            icon="location"
            title="Localisation"
            description="Permettre l'accès à votre position pour des recommendations"
            value={settings.locationTracking}
            onToggle={() => toggleSetting('locationTracking')}
            color="#f59e0b"
          />
          
          <SettingItem
            icon="shield-checkmark"
            title="Déconnexion automatique"
            description="Se déconnecter après 30 minutes d'inactivité"
            value={settings.autoLogout}
            onToggle={() => toggleSetting('autoLogout')}
            color="#dc2626"
          />
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛠️ Actions</Text>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="download" size={20} color="#2563eb" />
            <Text style={styles.actionText}>Exporter mes données</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="refresh" size={20} color="#16a34a" />
            <Text style={styles.actionText}>Synchroniser</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="trash" size={20} color="#dc2626" />
            <Text style={[styles.actionText, { color: '#dc2626' }]}>Supprimer le compte</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Informations */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>ℹ️ Informations</Text>
          <Text style={styles.infoText}>Version: 1.0.0</Text>
          <Text style={styles.infoText}>Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}</Text>
          <Text style={styles.infoText}>Développé avec ❤️ pour la RCA</Text>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
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
    elevation: 2,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  infoSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
    textAlign: 'center',
  },
});

export default SettingsScreen;