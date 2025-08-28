import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';

const RegisterScreen = ({ onRegister, onNavigate, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    location: '',
    type: 'buyer' // farmer, buyer, admin
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};

    // Nom obligatoire
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est obligatoire';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Le nom doit contenir au moins 2 caractères';
    }

    // Téléphone obligatoire
    if (!formData.phone.trim()) {
      newErrors.phone = 'Le numéro de téléphone est obligatoire';
    } else if (!/^\+?[0-9]{8,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Numéro de téléphone invalide (ex: +23670123456)';
    }

    // Mot de passe obligatoire
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est obligatoire';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    // Confirmation mot de passe
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    // Localisation
    if (!formData.location.trim()) {
      newErrors.location = 'La localisation est obligatoire';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestion de l'inscription
  const handleRegister = async () => {
    if (!validateForm()) {
      Alert.alert('Erreur', 'Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('📝 Tentative d\'inscription avec:', formData);
      
      // Préparer les données pour l'API
      const registrationData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        location: formData.location.trim(),
        type: formData.type
      };

      await onRegister(registrationData);
      
      Alert.alert(
        'Succès', 
        'Compte créé avec succès !', 
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('❌ Erreur inscription:', error);
      Alert.alert(
        'Erreur d\'inscription', 
        error.message || 'Une erreur est survenue. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mise à jour des champs
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Supprimer l'erreur si le champ devient valide
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.emoji}>🌾</Text>
        <Text style={styles.title}>Créer un compte</Text>
        <Text style={styles.subtitle}>Rejoignez AgriConnect RCA</Text>
      </View>

      <View style={styles.form}>
        {/* Nom complet */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nom complet *</Text>
          <TextInput
            style={[styles.input, errors.name ? styles.inputError : null]}
            value={formData.name}
            onChangeText={(value) => updateField('name', value)}
            placeholder="Ex: Jean Bokassa"
            autoCapitalize="words"
            autoComplete="name"
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        {/* Numéro de téléphone */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Numéro de téléphone *</Text>
          <TextInput
            style={[styles.input, errors.phone ? styles.inputError : null]}
            value={formData.phone}
            onChangeText={(value) => updateField('phone', value)}
            placeholder="Ex: +23670123456"
            keyboardType="phone-pad"
            autoComplete="tel"
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
        </View>

        {/* Mot de passe */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mot de passe *</Text>
          <TextInput
            style={[styles.input, errors.password ? styles.inputError : null]}
            value={formData.password}
            onChangeText={(value) => updateField('password', value)}
            placeholder="Au moins 6 caractères"
            secureTextEntry
            autoComplete="password-new"
          />
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        </View>

        {/* Confirmation mot de passe */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirmer le mot de passe *</Text>
          <TextInput
            style={[styles.input, errors.confirmPassword ? styles.inputError : null]}
            value={formData.confirmPassword}
            onChangeText={(value) => updateField('confirmPassword', value)}
            placeholder="Retapez votre mot de passe"
            secureTextEntry
            autoComplete="password-new"
          />
          {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
        </View>

        {/* Localisation */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Localisation *</Text>
          <TextInput
            style={[styles.input, errors.location ? styles.inputError : null]}
            value={formData.location}
            onChangeText={(value) => updateField('location', value)}
            placeholder="Ex: PK5, Bangui"
            autoCapitalize="words"
          />
          {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
        </View>

        {/* Type d'utilisateur */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Type de compte</Text>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[styles.typeButton, formData.type === 'buyer' ? styles.typeButtonActive : null]}
              onPress={() => updateField('type', 'buyer')}
            >
              <Text style={[styles.typeButtonText, formData.type === 'buyer' ? styles.typeButtonTextActive : null]}>
                🛒 Acheteur
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.typeButton, formData.type === 'farmer' ? styles.typeButtonActive : null]}
              onPress={() => updateField('type', 'farmer')}
            >
              <Text style={[styles.typeButtonText, formData.type === 'farmer' ? styles.typeButtonTextActive : null]}>
                🌾 Agriculteur
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bouton d'inscription */}
        <TouchableOpacity
          style={[styles.registerButton, (isSubmitting || loading) ? styles.buttonDisabled : null]}
          onPress={handleRegister}
          disabled={isSubmitting || loading}
        >
          {isSubmitting || loading ? (
            <View style={styles.buttonContent}>
              <ActivityIndicator color="white" size="small" />
              <Text style={styles.registerButtonText}>Création en cours...</Text>
            </View>
          ) : (
            <Text style={styles.registerButtonText}>Créer mon compte</Text>
          )}
        </TouchableOpacity>

        {/* Lien vers la connexion */}
        <View style={styles.loginLink}>
          <Text style={styles.loginLinkText}>Déjà inscrit ? </Text>
          <TouchableOpacity onPress={() => onNavigate('login')}>
            <Text style={styles.loginLinkButton}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#16a34a',
  },
  emoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: 'white',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    padding: 16,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  typeButtonActive: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  typeButtonText: {
    fontSize: 16,
    color: '#6b7280',
  },
  typeButtonTextActive: {
    color: '#16a34a',
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#16a34a',
    borderRadius: 8,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginLinkText: {
    fontSize: 16,
    color: '#6b7280',
  },
  loginLinkButton: {
    fontSize: 16,
    color: '#16a34a',
    fontWeight: '600',
  },
});

export default RegisterScreen;