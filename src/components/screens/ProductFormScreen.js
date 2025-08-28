// src/components/screens/ProductFormScreen.js
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Header from '../common/Header';
import API from '../../services/AgriConnectRCA';

function guessNameFromUri(uri) {
  try {
    const segs = uri.split(/[\\/]/);
    const last = segs[segs.length - 1];
    if (last) return last;
  } catch {}
  return `image_${Date.now()}.jpg`;
}

function guessMimeFromUri(uri) {
  const lower = (uri || '').toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

export default function ProductFormScreen({
  user,
  // si tu viens en mode édition, passe { product } via onNavigate('productForm', { product })
  product = null,

  // callbacks (optionnels) pour mettre à jour la liste déjà chargée côté app
  onAddProduct,     // async (payload) => créé côté store + refresh list
  onUpdateProduct,  // async (payload) => met à jour côté store + refresh list

  onBack,
  onHome,
  onNavigate,
  screenHistory,
  currentScreen,
}) {
  const isEdit = !!product?.id;

  const [name, setName] = useState(product?.name || product?.title || '');
  const [price, setPrice] = useState(String(product?.price ?? ''));
  const [unit, setUnit] = useState(product?.unit || 'kg');
  const [stock, setStock] = useState(String(product?.stock ?? product?.quantity ?? ''));
  const [category, setCategory] = useState(product?.category || 'legumes');
  const [location, setLocation] = useState(product?.location || 'Bangui');

  // image
  const [imageUrl, setImageUrl] = useState(product?.image_url || '');
  const [imageEmoji, setImageEmoji] = useState(product?.image || '🌾'); // fallback si pas d’URL
  const [uploading, setUploading] = useState(false);

  // metadata simples
  const [organic, setOrganic] = useState(!!product?.metadata?.organic);
  const [harvestDate, setHarvestDate] = useState(product?.metadata?.harvestDate || '');

  // UX
  const [saving, setSaving] = useState(false);

  const canSave = useMemo(() => {
    const p = parseInt(price, 10);
    const s = parseInt(stock, 10);
    return name.trim().length > 1 && !Number.isNaN(p) && !Number.isNaN(s);
  }, [name, price, stock]);

  const pickImage = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission requise', "Autorise l'accès à la galerie pour choisir une image.");
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
        allowsEditing: true,
      });
      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset?.uri) return;

      setUploading(true);

      const name = guessNameFromUri(asset.uri);
      const type = asset.mimeType || guessMimeFromUri(asset.uri);

      // upload immédiat à l'API
      const resp = await API.upload.image({ uri: asset.uri, name, type });
      if (!resp?.url) throw new Error("L'API upload n'a pas renvoyé d'URL");

      setImageUrl(resp.url);
      // pour l’aperçu si tu veux
      setImageEmoji('🖼️');
      Alert.alert('Image', 'Image téléchargée avec succès.');
    } catch (e) {
      console.warn('upload error', e);
      Alert.alert('Erreur upload', e?.message || 'Échec du téléchargement');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!canSave) {
      Alert.alert('Formulaire incomplet', 'Vérifie le nom, le prix et le stock.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        price: parseInt(price, 10),
        unit: unit || 'kg',
        stock: parseInt(stock, 10),
        category: category || 'legumes',
        location: location || 'Bangui',
        image_url: imageUrl || undefined,
        metadata: {
          organic: !!organic,
          harvestDate: harvestDate || undefined,
        },
      };

      if (isEdit) {
        // EDITION
        const finalId = product.id;
        if (onUpdateProduct) {
          await onUpdateProduct({ id: finalId, ...payload });
        } else {
          await API.products.update(finalId, payload);
        }
        Alert.alert('Succès', 'Produit mis à jour.');
      } else {
        // CREATION
        let created;
        if (onAddProduct) {
          created = await onAddProduct(payload);
        } else {
          created = await API.products.create(payload);
        }
        if (!created?.id) {
          // au pire, navigue quand même
          Alert.alert('Info', 'Produit créé.');
        } else {
          Alert.alert('Succès', 'Produit créé.');
        }
      }

      // Direction tableau de bord agriculteur si c’est un farmer
      if (user?.type === 'farmer') onNavigate?.('farmerProducts');
      else onNavigate?.('products');
    } catch (e) {
      console.warn('save error', e);
      Alert.alert('Erreur', e?.data?.error || e?.message || 'Impossible de sauvegarder le produit');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={isEdit ? '✏️ Modifier le produit' : '➕ Nouveau produit'}
        onBack={onBack}
        onHome={onHome}
        screenHistory={screenHistory}
        currentScreen={currentScreen}
        user={user}
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Image */}
        <View style={styles.card}>
          <Text style={styles.label}>Image du produit</Text>

          <View style={styles.imageRow}>
            <View style={styles.preview}>
              {imageUrl ? (
                // tu peux remplacer ce bloc par un <Image> si tu préfères afficher l'URL
                <Text style={styles.previewText}>Image chargée ✅</Text>
              ) : (
                <Text style={styles.previewEmoji}>{imageEmoji || '🌾'}</Text>
              )}
            </View>

            <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={pickImage} disabled={uploading}>
              {uploading ? (
                <ActivityIndicator />
              ) : (
                <>
                  <Ionicons name="image" size={18} color="#111827" />
                  <Text style={styles.btnSecondaryText}>Choisir une image</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          {!!imageUrl && <Text style={styles.hintUrl} numberOfLines={1}>{imageUrl}</Text>}
        </View>

        {/* Infos */}
        <View style={styles.card}>
          <Text style={styles.label}>Nom</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ex : Piment"
            style={styles.input}
          />

          <View style={styles.row2}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Prix (FCFA)</Text>
              <TextInput
                value={price}
                onChangeText={setPrice}
                keyboardType="number-pad"
                placeholder="Ex : 800"
                style={styles.input}
              />
            </View>
            <View style={{ width: 100 }}>
              <Text style={styles.label}>Unité</Text>
              <TextInput
                value={unit}
                onChangeText={setUnit}
                placeholder="kg"
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.row2}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Stock</Text>
              <TextInput
                value={stock}
                onChangeText={setStock}
                keyboardType="number-pad"
                placeholder="Ex : 30"
                style={styles.input}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Catégorie</Text>
              <TextInput
                value={category}
                onChangeText={setCategory}
                placeholder="legumes / fruits / cereales / tubercules"
                style={styles.input}
              />
            </View>
          </View>

          <Text style={styles.label}>Ville</Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="Bangui"
            style={styles.input}
          />
        </View>

        {/* Métadonnées */}
        <View style={styles.card}>
          <Text style={styles.label}>Métadonnées</Text>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Agriculture biologique</Text>
            <Switch value={organic} onValueChange={setOrganic} />
          </View>

          <Text style={styles.label}>Date de récolte (AAAA-MM-JJ)</Text>
          <TextInput
            value={harvestDate}
            onChangeText={setHarvestDate}
            placeholder="2025-08-01"
            style={styles.input}
          />
        </View>

        <TouchableOpacity
          style={[styles.btn, canSave ? styles.btnPrimary : styles.btnDisabled]}
          onPress={handleSave}
          disabled={!canSave || saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name={isEdit ? 'save' : 'add-circle'} size={18} color="#fff" />
              <Text style={styles.btnText}>{isEdit ? 'Sauvegarder' : 'Créer le produit'}</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:'#f9fafb' },
  content:{ flex:1 }, contentContainer:{ padding:16, paddingBottom:120, gap:12 },

  card:{ backgroundColor:'white', borderRadius:16, padding:16, gap:10,
    shadowColor:'#000', shadowOpacity:0.05, shadowRadius:3, elevation:2 },

  label:{ color:'#374151', fontWeight:'700', marginBottom:6 },
  input:{ backgroundColor:'#f3f4f6', borderRadius:12, paddingHorizontal:12, height:44 },

  row2:{ flexDirection:'row', gap:12 },

  imageRow:{ flexDirection:'row', alignItems:'center', gap:12 },
  preview:{ width:72, height:72, borderRadius:12, backgroundColor:'#f3f4f6', alignItems:'center', justifyContent:'center' },
  previewEmoji:{ fontSize:32 },
  previewText:{ color:'#16a34a', fontWeight:'700' },
  hintUrl:{ color:'#6b7280', fontSize:12 },

  switchRow:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  switchText:{ color:'#374151' },

  btn:{ flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, paddingVertical:14, borderRadius:12 },
  btnPrimary:{ backgroundColor:'#16a34a' },
  btnSecondary:{ backgroundColor:'#e5e7eb' },
  btnDisabled:{ backgroundColor:'#9ca3af' },
  btnText:{ color:'white', fontWeight:'700' },
  btnSecondaryText:{ color:'#111827', fontWeight:'700' },
});
