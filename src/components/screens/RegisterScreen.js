import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Header from '../common/Header';
import { cities } from '../../data/constants';

const RegisterScreen = ({ 
  onRegister, 
  onBack, 
  onHome, 
  onNavigate,
  screenHistory, 
  currentScreen, 
  user,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    type: ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est obligatoire';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Le nom doit contenir au moins 2 caractères';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Le numéro de téléphone est obligatoire';
    } else if (!/^\+236\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Format: +236 70 12 34 56';
    }
    
    if (!formData.location) {
      newErrors.location = 'Veuillez sélectionner une ville';
    }
    
    if (!formData.type) {
      newErrors.type = 'Veuillez sélectionner votre profil';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        await onRegister(formData);
      } catch (error) {
        Alert.alert('Erreur', 'Impossible de créer le compte');
      }
    } else {
      Alert.alert('Erreur', 'Veuillez corriger les erreurs dans le formulaire');
    }
  };

  const formatPhoneNumber = (text) => {
    // Auto-format phone number
    let cleaned = text.replace(/\D/g, '');
    if (cleaned.startsWith('236')) {
      cleaned = '+' + cleaned;
    } else if (!cleaned.startsWith('+236') && cleaned.length > 0) {
      cleaned = '+236' + cleaned;
    }
    
    // Format: +236 70 12 34 56
    if (cleaned.length > 4) {
      cleaned = cleaned.slice(0, 4) + ' ' + cleaned.slice(4);
    }
    if (cleaned.length > 7) {
      cleaned = cleaned.slice(0, 7) + ' ' + cleaned.slice(7);
    }
    if (cleaned.length > 10) {
      cleaned = cleaned.slice(0, 10) + ' ' + cleaned.slice(10);
    }
    if (cleaned.length > 13) {
      cleaned = cleaned.slice(0, 13) + ' ' + cleaned.slice(13);
    }
    
    return cleaned;
  };

  const handlePhoneChange = (text) => {
    const formatted = formatPhoneNumber(text);
    setFormData({...formData, phone: formatted});
    if (errors.phone) {
      setErrors(prev => ({...prev, phone: null}));
    }
  };

  return (
    <View style={styles.container}>
      <Header 
        title="📱 Inscription"
        onBack={() => onNavigate('welcome')}
        onHome={() => onNavigate('welcome')}
        screenHistory={screenHistory}
        currentScreen={currentScreen}
        user={user}
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.emoji}>🌾</Text>
          <Text style={styles.title}>Rejoignez AgriConnect</Text>
          <Text style={styles.subtitle}>La plateforme agricole de RCA</Text>
        </View>

        <View style={styles.form}>
          {/* Sélection du profil */}
          <View style={styles.section}>
            <Text style={styles.label}>Je suis...</Text>
            
            <TouchableOpacity
              onPress={() => {
                setFormData({...formData, type: 'farmer'});
                if (errors.type) setErrors(prev => ({...prev, type: null}));
              }}
              style={[
                styles.profileButton,
                formData.type === 'farmer' && styles.profileButtonActive,
                errors.type && !formData.type && styles.profileButtonError
              ]}
            >
              <Text style={styles.profileEmoji}>👨‍🌾</Text>
              <View style={styles.profileContent}>
                <Text style={[
                  styles.profileTitle,
                  formData.type === 'farmer' && styles.profileTitleActive
                ]}>
                  Agriculteur
                </Text>
                <Text style={styles.profileDescription}>
                  Je vends mes produits agricoles
                </Text>
                <Text style={styles.profileSango}>⭐ Mbi ka kobe ⭐</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setFormData({...formData, type: 'buyer'});
                if (errors.type) setErrors(prev => ({...prev, type: null}));
              }}
              style={[
                styles.profileButton,
                formData.type === 'buyer' && styles.profileButtonActiveBuyer,
                errors.type && !formData.type && styles.profileButtonError
              ]}
            >
              <Text style={styles.profileEmoji}>🛒</Text>
              <View style={styles.profileContent}>
                <Text style={[
                  styles.profileTitle,
                  formData.type === 'buyer' && styles.profileTitleActiveBuyer
                ]}>
                  Acheteur
                </Text>
                <Text style={styles.profileDescription}>
                  J'achète des produits frais
                </Text>
                <Text style={styles.profileSango}>⭐ Mbi vo kobe ⭐</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setFormData({...formData, type: 'admin'});
                if (errors.type) setErrors(prev => ({...prev, type: null}));
              }}
              style={[
                styles.profileButton,
                formData.type === 'admin' && styles.profileButtonActiveAdmin,
                errors.type && !formData.type && styles.profileButtonError
              ]}
            >
              <Text style={styles.profileEmoji}>👑</Text>
              <View style={styles.profileContent}>
                <Text style={[
                  styles.profileTitle,
                  formData.type === 'admin' && styles.profileTitleActiveAdmin
                ]}>
                  Administrateur
                </Text>
                <Text style={styles.profileDescription}>
                  Je gère la plateforme
                </Text>
                <Text style={styles.profileSango}>⭐ Mbi bembe ndo ⭐</Text>
              </View>
            </TouchableOpacity>
            
            {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}
          </View>

          {/* Informations personnelles */}
          <View style={styles.inputSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nom complet *</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="Entrez votre nom complet"
                value={formData.name}
                onChangeText={(text) => {
                  setFormData({...formData, name: text});
                  if (errors.name) {
                    setErrors(prev => ({...prev, name: null}));
                  }
                }}
                autoCapitalize="words"
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Numéro de téléphone *</Text>
              <TextInput
                style={[styles.input, errors.phone && styles.inputError]}
                placeholder="+236 70 12 34 56"
                value={formData.phone}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                maxLength={16}
              />
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ville de résidence *</Text>
              <View style={[styles.pickerContainer, errors.location && styles.inputError]}>
                <Picker
                  selectedValue={formData.location}
                  onValueChange={(value) => {
                    setFormData({...formData, location: value});
                    if (errors.location) {
                      setErrors(prev => ({...prev, location: null}));
                    }
                  }}
                  style={styles.picker}
                >
                  <Picker.Item label="Choisir une ville..." value="" />
                  {cities.slice(1).map(city => (
                    <Picker.Item key={city.id} label={city.name} value={city.name} />
                  ))}
                </Picker>
              </View>
              {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            style={styles.submitButton}
          >
            <Text style={styles.submitButtonText}>🚀 Créer mon compte</Text>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
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
    marginBottom: 32,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    textAlign: 'center',
  },
  profileButton: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    marginBottom: 16,
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
  profileButtonError: {
    borderColor: '#dc2626',
  },
  profileEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  profileContent: {
    flex: 1,
  },
  profileTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
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
  profileDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  profileSango: {
    fontSize: 12,
    fontWeight: '500',
    color: '#d97706',
  },
  inputSection: {
    gap: 20,
    marginBottom: 32,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  inputError: {
    borderColor: '#dc2626',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
  },
  picker: {
    height: 50,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#16a34a',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#16a34a',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
    submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  loginSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  loginLink: {
    paddingVertical: 8,
  },
  loginLinkText: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  }
});

export default RegisterScreen;