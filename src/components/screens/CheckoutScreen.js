// src/components/screens/CheckoutScreen.js
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../common/Header';

const n = (v) => {
  const x = typeof v === 'string' ? parseFloat(v) : Number(v);
  return Number.isFinite(x) ? x : 0;
};
const fmt = (v) => { const x = n(v); try { return x.toLocaleString('fr-FR'); } catch { return String(x); } };

export default function CheckoutScreen({
  user,
  cart = [],
  doCheckout,
  onNavigate,
  onBack,
  onHome,
  screenHistory,
  currentScreen,
}) {
  const sane = useMemo(() => (Array.isArray(cart) ? cart.filter(i => i && i.product) : []), [cart]);
  const lines = useMemo(() => sane.map(it => {
    const p = it.product || {};
    const qty = Math.max(1, n(it.quantity));
    const unitPrice = n(p.price ?? it.unit_price ?? 0);
    return { product: p, qty, unitPrice, lineTotal: unitPrice * qty };
  }), [sane]);

  const total = useMemo(() => lines.reduce((s, l) => s + l.lineTotal, 0), [lines]);
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState(user?.location || '');
  const [omPhone, setOmPhone] = useState(user?.phone || '');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const next = () => setStep((s) => Math.min(4, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const pay = async () => {
    if (!address.trim()) return Alert.alert('Adresse de livraison', 'Veuillez renseigner votre adresse.');
    if (!omPhone.trim()) return Alert.alert('Orange Money', 'Veuillez renseigner votre numéro.');

    try {
      setSubmitting(true);
      const res = await doCheckout({ address, phone: omPhone });
      setResult(res);
      setStep(4);
    } catch (e) {
      Alert.alert('Paiement refusé', e?.message || 'Une erreur est survenue.');
    } finally {
      setSubmitting(false);
    }
  };

  const header = (
    <Header
      title="🧾 Paiement & Livraison"
      user={user}
      onBack={onBack}
      onHome={onHome}
      screenHistory={screenHistory}
      currentScreen={currentScreen}
    />
  );

  if (!lines.length && step !== 4) {
    // rien dans le panier → renvoyer vers produits
    return (
      <View style={styles.container}>
        {header}
        <View style={styles.empty}>
          <Ionicons name="bag-outline" size={54} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>Votre panier est vide</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => onNavigate?.('products')}>
            <Ionicons name="pricetags" size={18} color="#fff" />
            <Text style={styles.primaryBtnText}>Voir les produits</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const Stepper = () => (
    <View style={styles.stepper}>
      {[1,2,3,4].map(s => (
        <View key={s} style={[styles.step, step >= s && styles.stepActive]}>
          <Text style={[styles.stepText, step >= s && styles.stepTextActive]}>{s}</Text>
        </View>
      ))}
    </View>
  );

  const Step1 = () => (
    <View style={styles.box}>
      <Text style={styles.boxTitle}>1. Récapitulatif</Text>
      <FlatList
        data={lines}
        keyExtractor={(it, idx) => String(it?.product?.id ?? idx)}
        renderItem={({ item }) => {
          const { product, qty, unitPrice, lineTotal } = item;
          return (
            <View style={styles.line}>
              <Text numberOfLines={1} style={styles.lineTitle}>{product.name || 'Produit'}</Text>
              <Text style={styles.lineInfo}>{fmt(unitPrice)} FCFA × {qty}</Text>
              <Text style={styles.lineTotal}>{fmt(lineTotal)} FCFA</Text>
            </View>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{fmt(total)} FCFA</Text>
      </View>

      <TouchableOpacity style={[styles.primaryBtn, { marginTop: 12 }]} onPress={next}>
        <Ionicons name="chevron-forward" size={18} color="#fff" />
        <Text style={styles.primaryBtnText}>Continuer</Text>
      </TouchableOpacity>
    </View>
  );

  const Step2 = () => (
    <View style={styles.box}>
      <Text style={styles.boxTitle}>2. Livraison</Text>

      <Text style={styles.label}>Adresse de livraison</Text>
      <TextInput
        style={styles.input}
        placeholder="Quartier, ville…"
        value={address}
        onChangeText={setAddress}
      />

      <Text style={[styles.boxTitle, { marginTop: 16 }]}>Paiement Orange Money</Text>
      <Text style={styles.label}>Téléphone Orange Money</Text>
      <TextInput
        style={styles.input}
        keyboardType="phone-pad"
        placeholder="+236xxxxxxxx"
        value={omPhone}
        onChangeText={setOmPhone}
      />

      <View style={{ flexDirection:'row', gap:8, marginTop:12 }}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={prev}>
          <Ionicons name="chevron-back" size={18} color="#1d4ed8" />
          <Text style={styles.secondaryBtnText}>Retour</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryBtn} onPress={next}>
          <Ionicons name="chevron-forward" size={18} color="#fff" />
          <Text style={styles.primaryBtnText}>Continuer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const Step3 = () => (
    <View style={styles.box}>
      <Text style={styles.boxTitle}>3. Paiement</Text>
      <Text style={{ color:'#374151', marginBottom:8 }}>
        Montant à payer : <Text style={{ fontWeight:'900', color:'#16a34a' }}>{fmt(total)} FCFA</Text>
      </Text>
      <Text style={{ color:'#6b7280' }}>
        Un push Orange Money sera simulé pour <Text style={{ fontWeight:'700' }}>{omPhone || '—'}</Text>.
      </Text>

      <TouchableOpacity style={[styles.primaryBtn, { marginTop: 16 }]} onPress={pay} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Ionicons name="card" size={18} color="#fff" />}
        <Text style={styles.primaryBtnText}>{submitting ? 'Paiement…' : 'Payer maintenant'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.secondaryBtn, { marginTop: 8 }]} onPress={prev} disabled={submitting}>
        <Ionicons name="chevron-back" size={18} color="#1d4ed8" />
        <Text style={styles.secondaryBtnText}>Retour</Text>
      </TouchableOpacity>
    </View>
  );

  const Step4 = () => (
    <View style={styles.box}>
      <Text style={styles.boxTitle}>4. Confirmation</Text>
      <Text style={{ color:'#16a34a', fontWeight:'900', fontSize:16, marginBottom:6 }}>Paiement validé ✅</Text>
      {!!result?.orders?.length && (
        <Text style={{ color:'#374151', marginBottom:8 }}>
          {result.orders.length} commande{result.orders.length>1?'s':''} créée{result.orders.length>1?'s':''}. Total payé {fmt(result.total)} FCFA.
        </Text>
      )}

      <TouchableOpacity style={[styles.primaryBtn, { marginTop: 8 }]} onPress={() => onNavigate?.('orders')}>
        <Ionicons name="receipt" size={18} color="#fff" />
        <Text style={styles.primaryBtnText}>Voir mes commandes</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.secondaryBtn, { marginTop: 8 }]} onPress={() => onNavigate?.('products')}>
        <Ionicons name="home" size={18} color="#1d4ed8" />
        <Text style={styles.secondaryBtnText}>Retour aux produits</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {header}
      <Stepper />

      {step === 1 && <Step1 />}
      {step === 2 && <Step2 />}
      {step === 3 && <Step3 />}
      {step === 4 && <Step4 />}
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:'#f9fafb', paddingBottom:24 },
  stepper:{ flexDirection:'row', justifyContent:'center', gap:8, padding:12 },
  step:{ width:28, height:28, borderRadius:14, borderColor:'#d1d5db', borderWidth:2, alignItems:'center', justifyContent:'center' },
  stepActive:{ backgroundColor:'#16a34a', borderColor:'#16a34a' },
  stepText:{ color:'#6b7280', fontWeight:'800' },
  stepTextActive:{ color:'#fff' },

  box:{ backgroundColor:'#fff', borderRadius:12, marginHorizontal:12, padding:12, borderColor:'#e5e7eb', borderWidth:1 },
  boxTitle:{ fontWeight:'900', color:'#111827', marginBottom:8 },
  line:{ flexDirection:'row', alignItems:'center', gap:8 },
  lineTitle:{ flex:1, fontWeight:'700', color:'#111827' },
  lineInfo:{ color:'#6b7280' },
  lineTotal:{ color:'#16a34a', fontWeight:'800' },

  totalRow:{ marginTop:10, flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  totalLabel:{ color:'#374151', fontWeight:'700' },
  totalValue:{ color:'#16a34a', fontWeight:'900', fontSize:18 },

  label:{ color:'#6b7280', marginBottom:4, marginTop:8 },
  input:{ backgroundColor:'#f9fafb', borderWidth:1, borderColor:'#e5e7eb', borderRadius:10, paddingHorizontal:12, paddingVertical:10 },

  primaryBtn:{ backgroundColor:'#16a34a', borderRadius:10, paddingVertical:12, alignItems:'center', flexDirection:'row', justifyContent:'center', gap:8 },
  primaryBtnText:{ color:'#fff', fontWeight:'800' },
  secondaryBtn:{ backgroundColor:'#e0ecff', borderRadius:10, paddingVertical:12, alignItems:'center', flexDirection:'row', justifyContent:'center', gap:8 },
  secondaryBtnText:{ color:'#1d4ed8', fontWeight:'800' },

  empty:{ flex:1, alignItems:'center', justifyContent:'center', padding:24, gap:10 },
  emptyTitle:{ color:'#374151', fontWeight:'800', fontSize:16 },
});
