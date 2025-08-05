import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Header from '../common/Header';
import { cities } from '../../data/constants';

const RegisterScreen = ({ 
  onRegister, 
  onBack, 
  onHome, 
  screenHistory, 
  currentScreen, 
  user 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    type: ''
  });

  const handleSubmit = () => {
    if (formData.name && formData.phone && formData.location && formData.type) {
      onRegister(formData);
    }
  };

  return (
    <View style={styles.container}>
      <Header 
        title="📱 Inscription"
        onBack={onBack}
        onHome={onHome}
        screenHistory={screenHistory}
        currentScreen={currentScreen}
        user={user}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.emoji}>📱</Text>
          <Text style={styles.title}>Inscription</Text>
          <Text style={styles.subtitle}>Rejoignez AgriConnect RCA</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.section}>
            <Text style={styles.label}>Je suis...</Text>
            
            <TouchableOpacity
              onPress={() => setFormData({...formData, type: 'farmer'})}
              style={[
                styles.profileButton,
                formData.type === 'farmer' && styles.profileButtonActive
              ]}
            >
              <Text style={styles.profileEmoji}>👨‍🌾</Text>
              <Text style={[
                styles.profileTitle,
                formData.type === 'farmer' && styles.profileTitleActive
              ]}>
                Agriculteur
              </Text>
              <Text style={styles.profileSango}>⭐ Mbi ka kobe ⭐</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFormData({...formData, type: 'buyer'})}
              style={[
                styles.profileButton,
                formData.type === 'buyer' && styles.profileButtonActiveBuyer
              ]}
            >
              <Text style={styles.profileEmoji}>🛒</Text>
              <Text style={[
                styles.profileTitle,
                formData.type === 'buyer' && styles.profileTitleActiveBuyer
              ]}>
                Acheteur
              </Text>
              <Text style={styles.profileSango}>⭐ Mbi vo kobe ⭐</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFormData({...formData, type: 'admin'})}
              style={[
                styles.profileButton,
                formData.type === 'admin' && styles.profileButtonActiveAdmin
              ]}
            >
              <Text style={styles.profileEmoji}>👑</Text>
              <Text style={[
                styles.profileTitle,
                formData.type === 'admin' && styles.profileTitleActiveAdmin
              ]}>
                Administrateur
              </Text>
              <Text style={styles.profileSango}>⭐ Mbi bembe ndo ⭐</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputSection}>
            <TextInput
              style={styles.input}
              placeholder="⭐ Nom complet ou iri ti mbi ⭐"
              value={formData.name}
              onChangeText={(text) => setFormData({...formData, name: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="+236 70 12 34 56"
              value={formData.phone}
              onChangeText={(text) => setFormData({...formData, phone: text})}
              keyboardType="phone-pad"
            />

            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.location}
                onValueChange={(value) => setFormData({...formData, location: value})}
                style={styles.picker}
              >
                <Picker.Item label="⭐ Choisir une ville ou kodro ti mbi ⭐" value="" />
                {cities.slice(1).map(city => (
                  <Picker.Item key={city.id} label={city.name} value={city.name} />
                ))}
              </Picker>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            style={styles.submitButton}
          >
            <Text style={styles.submitButtonText}>Créer mon compte</Text>
          </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  emoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  profileButton: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'white',
  },
  profileButtonActive: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  profileButtonActiveBuyer: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  profileButtonActiveAdmin: {
    borderColor: '#7c3aed',
    backgroundColor: '#f3e8ff',
  },
  profileEmoji: {
    fontSize: 30,
    marginBottom: 8,
  },
  profileTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  profileTitleActive: {
    color: '#16a34a',
  },
  profileTitleActiveBuyer: {
    color: '#2563eb',
  },
  profileTitleActiveAdmin: {
    color: '#7c3aed',
  },
  profileSango: {
    fontSize: 12,
    fontWeight: '500',
    color: '#d97706',
    marginTop: 4,
  },
  inputSection: {
    marginBottom: 24,
  },
  input: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: 'white',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: 'white',
  },
  picker: {
    height: 50,
  },
  submitButton: {
    backgroundColor: '#16a34a',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;