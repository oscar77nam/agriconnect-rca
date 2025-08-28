import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../common/Header';
import API from '../../AgriConnectRCA';

// Fallback local si l'API n'est pas dispo
const DEFAULT_CITIES = [
  'Bangui', 'Bimbo', 'Bégoua', 'Berbérati', 'Bossangoa', 'Bouar', 'Carnot',
  'Bambari', 'Bria', 'Kaga-Bandoro', 'Mbaïki', 'Sibut', 'Nola', 'Bangassou',
  'Birao', 'Paoua', 'Bozoum', 'Obo', 'Yaloké', 'Boda', 'Kouango'
];

const TypePill = ({ label, selected, onPress, icon }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.typePill,
      selected ? styles.typePillActive : styles.typePillInactive,
    ]}
  >
    <Ionicons
      name={icon}
      size={14}
      color={selected ? '#fff' : '#374151'}
      style={{ marginRight: 6 }}
    />
    <Text style={[styles.typePillText, selected && { color: '#fff' }]}>{label}</Text>
  </TouchableOpacity>
);

const RegisterScreen = ({
  onRegister,          // fournie par App -> useAgriConnect.handleRegister
  onBack,
  onHome,
  onNavigate,
  screenHistory,
  currentScreen,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationType, setLocationType] = useState('city'); // 'city' | 'village' | 'quarter'
  const [suggestions, setSuggestions] = useState([]);
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [role, setRole] = useState('buyer'); // buyer | farmer
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const inputRef = useRef(null);

  // Recherche insensible à la casse côté front + appel API quand dispo
  const fetchSuggestions = async (q) => {
    const query = (q || '').trim();
    if (!query) {
      // petit set de base
      setSuggestions(DEFAULT_CITIES.map(n => ({ id: n, name: n, type: 'city' })));
      return;
    }
    setLoadingLoc(true);
    try {
      const res = await API.searchLocations(query);
      // si l'API répond, on l’utilise
      if (Array.isArray(res?.data)) {
        setSuggestions(res.data);
      } else {
        // fallback client
        const arr = DEFAULT_CITIES
          .filter((c) => c.toLowerCase().includes(query.toLowerCase()))
          .map(n => ({ id: n, name: n, type: 'city' }));
        setSuggestions(arr);
      }
    } catch {
      // fallback client silencieux
      const arr = DEFAULT_CITIES
        .filter((c) => c.toLowerCase().includes(query.toLowerCase()))
        .map(n => ({ id: n, name: n, type: 'city' }));
      setSuggestions(arr);
    } finally {
      setLoadingLoc(false);
    }
  };

  useEffect(() => {
    fetchSuggestions(locationQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationQuery]);

  const notFound = useMemo(() => {
    const q = (locationQuery || '').trim().toLowerCase();
    if (!q) return false;
    return !(suggestions || []).some(
      (s) => (s?.name || '').toLowerCase() === q
    );
  }, [suggestions, locationQuery]);

  const pickSuggestion = (s) => {
    setSelectedLocation(s);
    setLocationQuery(s?.name || '');
    setShowDropdown(false);
  };

  const addNewLocation = async () => {
    const q = (locationQuery || '').trim();
    if (!q) {
      Alert.alert('Ville/Localité', 'Veuillez saisir un nom de localité.');
      return;
    }
    try {
      const created = await API.createLocation({
        name: q,
        type: locationType, // 'city' | 'village' | 'quarter'
      });
      // API renvoie { success, data }
      const loc = created?.data || { id: q, name: q, type: locationType };
      setSelectedLocation(loc);
      setLocationQuery(loc.name);
      setShowDropdown(false);
      Alert.alert('Localité ajoutée', `“${loc.name}” a été ajoutée avec succès.`);
    } catch (e) {
      const msg = e?.message || 'Impossible d’ajouter la localité.';
      Alert.alert('Erreur', msg);
    }
  };

  const handleSubmit = async () => {
    if (!name?.trim() || !phone?.trim() || !password?.trim() || !confirm?.trim()) {
      Alert.alert('Champs requis', 'Merci de renseigner tous les champs.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Mot de passe', 'Au moins 6 caractères.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Confirmation', 'Les mots de passe ne correspondent pas.');
      return;
    }

    const location =
      selectedLocation?.name ||
      (locationQuery?.trim() || '');

    try {
      await onRegister?.({
        name: name.trim(),
        phone: phone.trim(),
        password,
        confirmPassword: confirm,
        location,
        type: role,
      });
    } catch (e) {
      Alert.alert('Inscription', e?.message || 'Échec de l’inscription.');
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Créer un compte"
        onBack={onBack}
        onHome={onHome}
        screenHistory={screenHistory}
        currentScreen={currentScreen}
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Bienvenue 👋</Text>
        <Text style={styles.subtitle}>Rejoignez le marketplace AgriConnect RCA</Text>

        {/* Nom */}
        <View style={styles.inputGroup}>
          <Ionicons name="person" size={18} color="#9ca3af" />
          <TextInput
            placeholder="Nom complet"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
        </View>

        {/* Téléphone */}
        <View style={styles.inputGroup}>
          <Ionicons name="call" size={18} color="#9ca3af" />
          <TextInput
            placeholder="Ex: 0651890061"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={styles.input}
          />
        </View>

        {/* Ville / Localité (recherche + ajout) */}
        <View style={{ marginBottom: 8 }}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => { setShowDropdown(true); inputRef.current?.focus?.(); }}
            style={[styles.inputGroup, { borderBottomLeftRadius: showDropdown ? 0 : 12, borderBottomRightRadius: showDropdown ? 0 : 12 }]}
          >
            <Ionicons name="location" size={18} color="#9ca3af" />
            <TextInput
              ref={inputRef}
              placeholder="Votre ville / localité"
              value={locationQuery}
              onChangeText={(t) => { setLocationQuery(t); setSelectedLocation(null); }}
              onFocus={() => setShowDropdown(true)}
              style={styles.input}
            />
            <Ionicons name={showDropdown ? 'chevron-up' : 'chevron-down'} size={18} color="#9ca3af" />
          </TouchableOpacity>

          {showDropdown && (
            <View style={styles.dropdown}>
              {loadingLoc ? (
                <View style={styles.dropdownItem}>
                  <Ionicons name="sync" size={16} color="#9ca3af" />
                  <Text style={styles.dropdownText}>Recherche…</Text>
                </View>
              ) : (suggestions || []).length > 0 ? (
                <FlatList
                  keyboardShouldPersistTaps="handled"
                  data={suggestions}
                  keyExtractor={(item, idx) => item?.id || `${item?.name}-${idx}`}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => pickSuggestion(item)}
                      style={styles.dropdownItem}
                    >
                      <Ionicons name="pin" size={16} color="#16a34a" />
                      <Text style={styles.dropdownText}>{item?.name}</Text>
                      <View style={styles.badgeType}>
                        <Text style={styles.badgeTypeText}>
                          {item?.type === 'city' ? 'Ville' : item?.type === 'village' ? 'Village' : 'Quartier'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <View style={styles.dropdownItem}>
                      <Text style={styles.dropdownTextMuted}>Aucune localité</Text>
                    </View>
                  }
                />
              ) : (
                <View style={styles.dropdownItem}>
                  <Text style={styles.dropdownTextMuted}>Aucune localité</Text>
                </View>
              )}

              {/* Bloc ajout si introuvable */}
              {notFound && (
                <View style={styles.addBox}>
                  <Text style={styles.addTitle}>
                    Aucune localité trouvée pour “{locationQuery}”
                  </Text>

                  <View style={styles.typeRow}>
                    <TypePill
                      label="Ville"
                      icon="business"
                      selected={locationType === 'city'}
                      onPress={() => setLocationType('city')}
                    />
                    <TypePill
                      label="Village"
                      icon="leaf"
                      selected={locationType === 'village'}
                      onPress={() => setLocationType('village')}
                    />
                    <TypePill
                      label="Quartier"
                      icon="home"
                      selected={locationType === 'quarter'}
                      onPress={() => setLocationType('quarter')}
                    />
                  </View>

                  <TouchableOpacity style={styles.addBtn} onPress={addNewLocation}>
                    <Ionicons name="add-circle" size={18} color="#fff" />
                    <Text style={styles.addBtnText}>
                      Ajouter “{locationQuery}” ({locationType === 'city' ? 'Ville' : locationType === 'village' ? 'Village' : 'Quartier'})
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Choix de rôle */}
        <View style={styles.roleRow}>
          <TouchableOpacity
            onPress={() => setRole('buyer')}
            style={[styles.roleBtn, role === 'buyer' ? styles.roleBtnActive : styles.roleBtnInactive]}
          >
            <Ionicons name="cart" size={14} color={role === 'buyer' ? '#fff' : '#374151'} />
            <Text style={[styles.roleText, role === 'buyer' && { color: '#fff' }]}>Acheteur</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setRole('farmer')}
            style={[styles.roleBtn, role === 'farmer' ? styles.roleBtnActive : styles.roleBtnInactive]}
          >
            <Ionicons name="leaf" size={14} color={role === 'farmer' ? '#fff' : '#374151'} />
            <Text style={[styles.roleText, role === 'farmer' && { color: '#fff' }]}>Agriculteur</Text>
          </TouchableOpacity>
        </View>

        {/* Mot de passe */}
        <View style={styles.inputGroup}>
          <Ionicons name="lock-closed" size={18} color="#9ca3af" />
          <TextInput
            placeholder="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPw}
            style={styles.input}
          />
          <TouchableOpacity onPress={() => setShowPw(!showPw)}>
            <Ionicons name={showPw ? 'eye-off' : 'eye'} size={18} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Confirmation */}
        <View style={styles.inputGroup}>
          <Ionicons name="lock-closed" size={18} color="#9ca3af" />
          <TextInput
            placeholder="Confirmer le mot de passe"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry={!showConfirmPw}
            style={styles.input}
          />
          <TouchableOpacity onPress={() => setShowConfirmPw(!showConfirmPw)}>
            <Ionicons name={showConfirmPw ? 'eye-off' : 'eye'} size={18} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>Créer mon compte</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onNavigate?.('login')}
          style={{ alignSelf: 'center', marginTop: 16 }}
        >
          <Text style={{ color: '#2563eb', fontWeight: '600' }}>Déjà un compte ? Se connecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { flex: 1 },
  contentContainer: { padding: 20, paddingBottom: 100 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 4 },
  subtitle: { color: '#6b7280', marginBottom: 16 },

  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
    gap: 10,
  },
  input: { flex: 1, paddingVertical: 12, fontSize: 16 },

  dropdown: {
    backgroundColor: '#fff',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    maxHeight: 220,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  dropdownText: { color: '#111827' },
  dropdownTextMuted: { color: '#9ca3af' },

  addBox: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    padding: 12,
    backgroundColor: '#f9fafb',
  },
  addTitle: { color: '#374151', marginBottom: 8 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  typePillInactive: { backgroundColor: '#fff', borderColor: '#e5e7eb' },
  typePillActive: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  typePillText: { fontWeight: '700', color: '#374151', fontSize: 12 },

  addBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  addBtnText: { color: '#fff', fontWeight: '800' },

  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  roleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  roleBtnInactive: { backgroundColor: '#fff', borderColor: '#e5e7eb' },
  roleBtnActive: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  roleText: { fontWeight: '700', color: '#374151' },

  submitBtn: {
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  submitText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});

export default RegisterScreen;
