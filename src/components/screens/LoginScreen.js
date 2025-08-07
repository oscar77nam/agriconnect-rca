import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';

const LoginScreen = ({ onLogin, onNavigate, loading }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!phone.trim()) {
      newErrors.phone = 'Le numéro de téléphone est obligatoire';
    }

    if (!password) {
      newErrors.password = 'Le mot de passe est obligatoire';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('🔐 Tentative de connexion avec:', { phone: phone });
      
      const credentials = {
        phone: phone.trim(),
        password: password
      };

      await onLogin(credentials);
      console.log('✅ Connexion réussie');
      
    } catch (error) {
      console.error('❌ Erreur connexion:', error);
      Alert.alert(
        'Erreur de connexion', 
        error.message || 'Identifiants incorrects. Veuillez réessayer.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = () => {
    Alert.alert(
      'Comptes de démonstration',
      'Choisissez un compte pour tester :',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Agriculteur',
          onPress: () => {
            setPhone('+23670123456');
            setPassword('demo123');
          }
        },
        {
          text: 'Acheteur',
          onPress: () => {
            setPhone('+23670987654');
            setPassword('demo123');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>🌾</Text>
        <Text style={styles.title}>Connexion</Text>
        <Text style={styles.subtitle}>Accédez à AgriConnect RCA</Text>
      </View>

      <View style={styles.form}>
        {/* Téléphone */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Identifiant ou numéro de téléphone *</Text>
          <TextInput
            style={[styles.input, errors.phone ? styles.inputError : null]}
            value={phone}
            onChangeText={(value) => {
              setPhone(value);
              if (errors.phone) {
                setErrors(prev => ({ ...prev, phone: null }));
              }
            }}
            placeholder="Ex: +23670123456"
            keyboardType="phone-pad"
            autoComplete="tel"
            autoCapitalize="none"
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
        </View>

        {/* Mot de passe */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mot de passe *</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.passwordInput, errors.password ? styles.inputError : null]}
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                if (errors.password) {
                  setErrors(prev => ({ ...prev, password: null }));
                }
              }}
              placeholder="Votre mot de passe"
              secureTextEntry={!showPassword}
              autoComplete="password"
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.passwordToggleText}>
                {showPassword ? '🙈' : '👁️'}
              </Text>
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        </View>

        {/* Bouton de connexion */}
        <TouchableOpacity
          style={[styles.loginButton, (isSubmitting || loading) ? styles.buttonDisabled : null]}
          onPress={handleLogin}
          disabled={isSubmitting || loading}
        >
          {isSubmitting || loading ? (
            <View style={styles.buttonContent}>
              <ActivityIndicator color="white" size="small" />
              <Text style={styles.loginButtonText}>Connexion...</Text>
            </View>
          ) : (
            <Text style={styles.loginButtonText}>Se connecter</Text>
          )}
        </TouchableOpacity>

        {/* Bouton de démonstration */}
        <TouchableOpacity
          style={styles.demoButton}
          onPress={handleDemoLogin}
        >
          <Text style={styles.demoButtonText}>🎭 Comptes de démonstration</Text>
        </TouchableOpacity>

        {/* Lien vers inscription */}
        <View style={styles.registerLink}>
          <Text style={styles.registerLinkText}>Pas encore inscrit ? </Text>
          <TouchableOpacity onPress={() => onNavigate('register')}>
            <Text style={styles.registerLinkButton}>Créer un compte</Text>
          </TouchableOpacity>
        </View>

        {/* Info développement */}
        <View style={styles.devInfo}>
          <Text style={styles.devInfoText}>
            💡 Mode développement actif
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: '#16a34a',
  },
  emoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    opacity: 0.9,
  },
  form: {
    padding: 20,
    paddingTop: 40,
  },
  inputGroup: {
    marginBottom: 24,
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: 'white',
    paddingRight: 50,
  },
  passwordToggle: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  passwordToggleText: {
    fontSize: 18,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
  },
  loginButton: {
    backgroundColor: '#16a34a',
    borderRadius: 8,
    padding: 18,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  demoButton: {
    backgroundColor: '#f59e0b',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  demoButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  registerLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  registerLinkText: {
    fontSize: 16,
    color: '#6b7280',
  },
  registerLinkButton: {
    fontSize: 16,
    color: '#16a34a',
    fontWeight: '600',
  },
  devInfo: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  devInfoText: {
    fontSize: 14,
    color: '#92400e',
    textAlign: 'center',
  },
});

export default LoginScreen;