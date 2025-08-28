// src/components/screens/AdminNetworkScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../common/Header';
import API, { getBaseUrl, setBaseUrl } from '../../AgriConnectRCA';

const AdminNetworkScreen = ({
  user,
  onBack,
  onHome,
  onNavigate,
  screenHistory,
  currentScreen,
}) => {
  const [url, setUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null); // { ok:boolean, message:string }
  const [serverNow, setServerNow] = useState(null);

  const DEFAULT_BASE =
    Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

  const load = async () => {
    const u = await getBaseUrl();
    setUrl(u);
    setStatus(null);
    setServerNow(null);
  };

  useEffect(() => {
    load();
  }, []);

  const testHealth = async () => {
    try {
      setTesting(true);
      setStatus(null);
      setServerNow(null);
      const h = await API.health();
      setStatus({ ok: true, message: 'Connexion OK' });
      setServerNow(h?.now || null);
    } catch (e) {
      setStatus({ ok: false, message: e?.message || 'Échec de connexion' });
    } finally {
      setTesting(false);
    }
  };

  const save = async () => {
    if (!url || !/^https?:\/\/.+/i.test(url)) {
      Alert.alert('URL invalide', 'Exemple: http://192.168.1.10:3000');
      return;
    }
    try {
      setSaving(true);
      await setBaseUrl(url);
      await testHealth();
      Alert.alert('Succès', 'Base URL enregistrée.');
    } catch (e) {
      Alert.alert('Erreur', e?.message || 'Impossible de sauvegarder.');
    } finally {
      setSaving(false);
    }
  };

  const resetDefault = async () => {
    try {
      setSaving(true);
      await setBaseUrl(DEFAULT_BASE);
      await load();
      await testHealth();
      Alert.alert('Réinitialisé', `URL: ${DEFAULT_BASE}`);
    } catch (e) {
      Alert.alert('Erreur', e?.message || 'Impossible de réinitialiser.');
    } finally {
      setSaving(false);
    }
  };

  // Garde d’accès (UI)
  if (user?.type !== 'admin') {
    return (
      <View style={styles.container}>
        <Header
          title="🔒 Accès refusé"
          onBack={onBack}
          onHome={onHome}
          screenHistory={screenHistory}
          currentScreen={currentScreen}
          user={user}
        />
        <View style={styles.locked}>
          <Ionicons name="lock-closed" size={48} color="#dc2626" />
          <Text style={styles.lockedTitle}>Réservé aux administrateurs</Text>
          <TouchableOpacity style={styles.homeBtn} onPress={onHome}>
            <Ionicons name="home" size={18} color="#fff" />
            <Text style={styles.homeBtnText}>Retour à l’accueil</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="🌐 Paramètres réseau (Admin)"
        onBack={onBack}
        onHome={onHome}
        screenHistory={screenHistory}
        currentScreen={currentScreen}
        user={user}
      />

      <View style={styles.body}>
        <View style={styles.card}>
          <Text style={styles.label}>Base URL de l’API</Text>
          <View style={styles.inputRow}>
            <Ionicons name="globe" size={18} color="#6b7280" />
            <TextInput
              style={styles.input}
              placeholder="http://192.168.1.10:3000"
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={resetDefault} disabled={saving}>
              <Ionicons name="refresh" size={16} color="#111827" />
              <Text style={styles.secondaryBtnText}>Réinitialiser</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryBtn} onPress={save} disabled={saving}>
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="save" size={16} color="#fff" />
                  <Text style={styles.primaryBtnText}>Enregistrer</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Tester la connexion</Text>
          <TouchableOpacity style={styles.testBtn} onPress={testHealth} disabled={testing}>
            {testing ? (
              <ActivityIndicator color="#2563eb" />
            ) : (
              <>
                <Ionicons name="radio" size={18} color="#2563eb" />
                <Text style={styles.testBtnText}>Appeler /api/health</Text>
              </>
            )}
          </TouchableOpacity>

          {status && (
            <View
              style={[
                styles.statusBox,
                status.ok ? styles.statusOk : styles.statusKo,
              ]}
            >
              <Ionicons
                name={status.ok ? 'checkmark-circle' : 'close-circle'}
                size={18}
                color={status.ok ? '#065f46' : '#991b1b'}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: status.ok ? '#065f46' : '#991b1b' },
                ]}
              >
                {status.message}
              </Text>
            </View>
          )}

          {serverNow && (
            <View style={styles.serverRow}>
              <Ionicons name="time" size={16} color="#6b7280" />
              <Text style={styles.serverText}>Heure serveur: {serverNow}</Text>
            </View>
          )}
        </View>

        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>Conseils</Text>
          <Text style={styles.helpText}>
            • Sur Android émulateur, utilisez <Text style={styles.mono}>http://10.0.2.2:3000</Text>.
          </Text>
          <Text style={styles.helpText}>
            • Sur appareil physique, mettez l’IP du PC: <Text style={styles.mono}>http://192.168.x.x:3000</Text>.
          </Text>
          <Text style={styles.helpText}>
            • Après modification, testez avec “/api/health”.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  body: { padding: 16, gap: 16 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    gap: 12,
  },
  label: { fontWeight: '700', color: '#111827' },

  inputRow: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  input: { flex: 1, fontSize: 16, color: '#111827' },

  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    flex: 1,
    justifyContent: 'center',
  },
  secondaryBtnText: { color: '#111827', fontWeight: '700' },

  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#16a34a',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    flex: 1,
    justifyContent: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '700' },

  testBtn: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    backgroundColor: '#eff6ff',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    justifyContent: 'center',
  },
  testBtnText: { color: '#2563eb', fontWeight: '700' },

  statusBox: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
  },
  statusOk: { backgroundColor: '#ecfdf5', borderWidth: 1, borderColor: '#d1fae5' },
  statusKo: { backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#fecaca' },
  statusText: { fontWeight: '700' },

  serverRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  serverText: { color: '#374151' },

  helpCard: {
    backgroundColor: '#fffbeb',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    borderRadius: 10,
    padding: 14,
    gap: 6,
  },
  helpTitle: { fontWeight: '800', color: '#92400e' },
  helpText: { color: '#7c2d12' },
  mono: { fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }), color: '#7c2d12' },

  locked: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  lockedTitle: { fontWeight: '800', color: '#111827' },
  homeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  homeBtnText: { color: '#fff', fontWeight: '800' },
});

export default AdminNetworkScreen;
