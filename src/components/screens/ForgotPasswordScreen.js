import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../common/Header';
import API from '../../AgriConnectRCA';

const SECONDS_OTP_VALIDITY = 30 * 60; // 30 minutes
const RESEND_COOLDOWN = 60;           // 60 secondes

const pad2 = (n) => (n < 10 ? `0${n}` : `${n}`);

const ForgotPasswordScreen = ({
  user,
  onBack,
  onHome,
  onNavigate,
  screenHistory,
  currentScreen,
}) => {
  const [step, setStep] = useState(1);

  // Étape 1
  const [phone, setPhone] = useState('');

  // Étape 2
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Timers
  const [otpExpireAt, setOtpExpireAt] = useState(null); // timestamp ms
  const [resendAvailableAt, setResendAvailableAt] = useState(null); // timestamp ms
  const tickRef = useRef(null);

  const now = () => Date.now();
  const remainingOtpSec = otpExpireAt ? Math.max(0, Math.floor((otpExpireAt - now()) / 1000)) : 0;
  const remainingResendSec = resendAvailableAt ? Math.max(0, Math.floor((resendAvailableAt - now()) / 1000)) : 0;

  useEffect(() => {
    // tick chaque seconde pour rafraîchir les compteurs
    tickRef.current = setInterval(() => {
      // force render via setState noop
      // eslint-disable-next-line no-unused-expressions
      otpExpireAt && setOtpExpireAt((v) => v);
      resendAvailableAt && setResendAvailableAt((v) => v);
    }, 1000);
    return () => clearInterval(tickRef.current);
  }, [otpExpireAt, resendAvailableAt]);

  const handleRequestCode = async () => {
    const p = (phone || '').trim();
    if (!p) {
      Alert.alert('Téléphone requis', 'Veuillez saisir votre numéro de téléphone.');
      return;
    }
    try {
      const res = await API.forgotPassword(p);
      // Le backend envoie le code par SMS/WhatsApp/email selon ton implémentation
      setStep(2);
      setOtpExpireAt(Date.now() + SECONDS_OTP_VALIDITY * 1000); // 30 min
      setResendAvailableAt(Date.now() + RESEND_COOLDOWN * 1000); // 60s cooldown
      Alert.alert('Code envoyé', 'Un code à 6 chiffres vous a été envoyé.');
    } catch (e) {
      Alert.alert('Erreur', e?.message || 'Impossible d’envoyer le code.');
    }
  };

  const handleResend = async () => {
    if (remainingResendSec > 0) return;
    const p = (phone || '').trim();
    if (!p) return;
    try {
      await API.resendOtp(p);
      setResendAvailableAt(Date.now() + RESEND_COOLDOWN * 1000);
      // Optionnel : réinitialiser la fenêtre de validité du code
      setOtpExpireAt(Date.now() + SECONDS_OTP_VALIDITY * 1000);
      Alert.alert('Nouveau code', 'Un nouveau code vous a été renvoyé.');
    } catch (e) {
      Alert.alert('Erreur', e?.message || 'Impossible de renvoyer le code.');
    }
  };

  const handleReset = async () => {
    const p = (phone || '').trim();
    const c = (code || '').trim();
    const np = (newPassword || '').trim();
    const cf = (confirm || '').trim();

    if (!p || !c || !np || !cf) {
      Alert.alert('Champs requis', 'Téléphone, code, et nouveau mot de passe sont requis.');
      return;
    }
    if (c.length !== 6 || !/^\d{6}$/.test(c)) {
      Alert.alert('Code invalide', 'Le code doit contenir 6 chiffres.');
      return;
    }
    if (np.length < 6) {
      Alert.alert('Mot de passe trop court', 'Au moins 6 caractères.');
      return;
    }
    if (np !== cf) {
      Alert.alert('Confirmation', 'Les mots de passe ne correspondent pas.');
      return;
    }
    if (remainingOtpSec <= 0) {
      Alert.alert('Code expiré', 'Le code a expiré. Veuillez renvoyer un code.');
      return;
    }

    try {
      await API.resetPassword(p, c, np);
      Alert.alert('Succès', 'Votre mot de passe a été réinitialisé.', [
        {
          text: 'Se connecter',
          onPress: () => onNavigate?.('login'),
        },
      ]);
      // Optionnel : retour automatique à la connexion
      onNavigate?.('login');
    } catch (e) {
      Alert.alert('Erreur', e?.message || 'Impossible de réinitialiser le mot de passe.');
    }
  };

  const minute = Math.floor(remainingOtpSec / 60);
  const second = remainingOtpSec % 60;

  return (
    <View style={styles.container}>
      <Header
        title="🔐 Mot de passe oublié"
        onBack={onBack}
        onHome={onHome}
        screenHistory={screenHistory}
        currentScreen={currentScreen}
        user={user}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          {step === 1 ? (
            <View style={styles.card}>
              <Text style={styles.title}>Réinitialiser votre mot de passe</Text>
              <Text style={styles.sub}>
                Entrez votre numéro de téléphone pour recevoir un code à 6 chiffres.
              </Text>

              <View style={styles.inputRow}>
                <Ionicons name="call-outline" size={20} color="#9ca3af" />
                <TextInput
                  style={styles.input}
                  placeholder="Numéro de téléphone"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              <TouchableOpacity style={styles.primary} onPress={handleRequestCode}>
                <Ionicons name="send" size={18} color="#fff" />
                <Text style={styles.primaryTxt}>Envoyer le code</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.title}>Vérifier le code et définir un nouveau mot de passe</Text>
              <Text style={styles.sub}>
                Un code a été envoyé au numéro&nbsp;
                <Text style={{ fontWeight: '700' }}>{phone}</Text>
              </Text>

              {/* Compteur OTP */}
              <View style={styles.timerRow}>
                <Ionicons name="time-outline" size={18} color="#2563eb" />
                <Text style={styles.timerText}>
                  Expire dans {pad2(minute)}:{pad2(second)}
                </Text>
              </View>

              {/* Code à 6 chiffres */}
              <View style={styles.inputRow}>
                <Ionicons name="keypad-outline" size={20} color="#9ca3af" />
                <TextInput
                  style={styles.input}
                  placeholder="Code à 6 chiffres"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={code}
                  onChangeText={(t) => setCode(t.replace(/[^\d]/g, ''))}
                />
              </View>

              {/* Nouveau mot de passe */}
              <View style={styles.inputRow}>
                <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" />
                <TextInput
                  style={styles.input}
                  placeholder="Nouveau mot de passe"
                  secureTextEntry={!showNew}
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TouchableOpacity onPress={() => setShowNew((s) => !s)}>
                  <Ionicons name={showNew ? 'eye-off-outline' : 'eye-outline'} size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>

              {/* Confirmation */}
              <View style={styles.inputRow}>
                <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" />
                <TextInput
                  style={styles.input}
                  placeholder="Confirmer le mot de passe"
                  secureTextEntry={!showConfirm}
                  value={confirm}
                  onChangeText={setConfirm}
                />
                <TouchableOpacity onPress={() => setShowConfirm((s) => !s)}>
                  <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>

              {/* Actions */}
              <TouchableOpacity
                style={[styles.primary, { marginTop: 8 }]}
                onPress={handleReset}
              >
                <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                <Text style={styles.primaryTxt}>Définir le nouveau mot de passe</Text>
              </TouchableOpacity>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  disabled={remainingResendSec > 0}
                  onPress={handleResend}
                  style={[
                    styles.linkBtn,
                    remainingResendSec > 0 && styles.linkBtnDisabled,
                  ]}
                >
                  <Text style={[
                    styles.linkText,
                    remainingResendSec > 0 && styles.linkTextDisabled,
                  ]}>
                    {remainingResendSec > 0
                      ? `Renvoyer dans ${remainingResendSec}s`
                      : 'Renvoyer le code'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setStep(1)} style={styles.linkBtn}>
                  <Text style={styles.linkText}>Changer de numéro</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, paddingBottom: 120 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eef2f7',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  title: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 6 },
  sub: { color: '#6b7280', marginBottom: 12 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 10,
  },
  input: { flex: 1, fontSize: 15, color: '#111827' },
  primary: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryTxt: { color: '#fff', fontWeight: '700' },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#eff6ff',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  timerText: { color: '#2563eb', fontWeight: '700' },
  actionsRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  linkBtn: { paddingVertical: 8, paddingHorizontal: 6 },
  linkText: { color: '#2563eb', fontWeight: '700' },
  linkBtnDisabled: { opacity: 0.6 },
  linkTextDisabled: { color: '#9ca3af' },
});

export default ForgotPasswordScreen;
