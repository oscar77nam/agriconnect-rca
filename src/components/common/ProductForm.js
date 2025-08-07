import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal
} from 'react-native';

const ProductForm = ({ product = null, onSubmit, onCancel }) => {
  const isEditing = !!product;
  
  const [formData, setFormData] = useState({
    name: product?.name || '',
    category: product?.category || '',
    price: product?.price?.toString() || '',
    stock: product?.stock?.toString() || product?.quantity?.toString() || '',
    unit: product?.unit || 'kg',
    description: product?.description || product?.metadata?.description || '',
    organic: product?.organic || product?.metadata?.organic || false,
    harvest_date: product?.harvest_date || product?.metadata?.harvestDate || new Date().toISOString().split('T')[0],
    image_url: product?.image_url || ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Catégories prédéfinies
  const categories = [
    'Manioc', 'Banane', 'Maïs', 'Riz', 'Arachide', 
    'Tomate', 'Oignon', 'Piment', 'Légumes', 'Fruits',
    'Épices', 'Tubercules', 'Céréales', 'Légumineuses'
  ];

  // Unités prédéfinies
  const units = ['kg', 'g', 'sac', 'paquet', 'pièce', 'litre', 'tonne'];

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};

    // Nom obligatoire
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom du produit est obligatoire';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Le nom doit contenir au moins 2 caractères';
    }

    // Catégorie obligatoire
    if (!formData.category.trim()) {
      newErrors.category = 'La catégorie est obligatoire';
    }

    // Prix obligatoire et valide
    if (!formData.price.trim()) {
      newErrors.price = 'Le prix est obligatoire';
    } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Le prix doit être un nombre positif';
    }

    // Stock obligatoire et valide
    if (!formData.stock.trim()) {
      newErrors.stock = 'La quantité en stock est obligatoire';
    } else if (isNaN(parseInt(formData.stock)) || parseInt(formData.stock) <= 0) {
      newErrors.stock = 'La quantité doit être un nombre entier positif';
    }

    // Validation de la date de récolte
    if (formData.harvest_date) {
      const harvestDate = new Date(formData.harvest_date);
      const today = new Date();
      const oneYearFromNow = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
      
      if (harvestDate > oneYearFromNow) {
        newErrors.harvest_date = 'La date de récolte ne peut pas être dans plus d\'un an';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestion de la soumission
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Erreur', 'Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('📝 Soumission produit:', formData);
      
      // Préparer les données pour l'API
      const productData = {
        name: formData.name.trim(),
        category: formData.category.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        unit: formData.unit,
        description: formData.description.trim(),
        organic: formData.organic,
        harvest_date: formData.harvest_date,
        image_url: formData.image_url.trim() || null
      };

      await onSubmit(productData);
      
      Alert.alert(
        'Succès', 
        isEditing ? 'Produit modifié avec succès !' : 'Produit ajouté avec succès !',
        [{ text: 'OK', onPress: onCancel }]
      );
      
    } catch (error) {
      console.error('❌ Erreur soumission produit:', error);
      Alert.alert(
        'Erreur', 
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

  // Sélection de catégorie
  const selectCategory = (category) => {
    updateField('category', category);
  };

  // Sélection d'unité
  const selectUnit = (unit) => {
    updateField('unit', unit);
  };

  return (
    <Modal visible={true} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {isEditing ? '✏️ Modifier le produit' : '➕ Ajouter un produit'}
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
          {/* Nom du produit */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom du produit *</Text>
            <TextInput
              style={[styles.input, errors.name ? styles.inputError : null]}
              value={formData.name}
              onChangeText={(value) => updateField('name', value)}
              placeholder="Ex: Manioc frais"
              autoCapitalize="words"
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Catégorie */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Catégorie *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    formData.category === category ? styles.categoryButtonActive : null
                  ]}
                  onPress={() => selectCategory(category)}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    formData.category === category ? styles.categoryButtonTextActive : null
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {/* Input personnalisé pour autres catégories */}
            <TextInput
              style={[styles.input, { marginTop: 8 }, errors.category ? styles.inputError : null]}
              value={formData.category}
              onChangeText={(value) => updateField('category', value)}
              placeholder="Ou tapez une catégorie personnalisée"
              autoCapitalize="words"
            />
            {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
          </View>

          {/* Prix et Unité */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 2 }]}>
              <Text style={styles.label}>Prix *</Text>
              <TextInput
                style={[styles.input, errors.price ? styles.inputError : null]}
                value={formData.price}
                onChangeText={(value) => updateField('price', value)}
                placeholder="1000"
                keyboardType="numeric"
              />
              {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
              <Text style={styles.label}>Unité</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitScroll}>
                {units.map((unit) => (
                  <TouchableOpacity
                    key={unit}
                    style={[
                      styles.unitButton,
                      formData.unit === unit ? styles.unitButtonActive : null
                    ]}
                    onPress={() => selectUnit(unit)}
                  >
                    <Text style={[
                      styles.unitButtonText,
                      formData.unit === unit ? styles.unitButtonTextActive : null
                    ]}>
                      {unit}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Quantité en stock */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Quantité en stock *</Text>
            <TextInput
              style={[styles.input, errors.stock ? styles.inputError : null]}
              value={formData.stock}
              onChangeText={(value) => updateField('stock', value)}
              placeholder="50"
              keyboardType="numeric"
            />
            {errors.stock && <Text style={styles.errorText}>{errors.stock}</Text>}
          </View>

          {/* Date de récolte */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date de récolte</Text>
            <TextInput
              style={[styles.input, errors.harvest_date ? styles.inputError : null]}
              value={formData.harvest_date}
              onChangeText={(value) => updateField('harvest_date', value)}
              placeholder="2024-12-25"
            />
            {errors.harvest_date && <Text style={styles.errorText}>{errors.harvest_date}</Text>}
            <Text style={styles.helpText}>Format: AAAA-MM-JJ</Text>
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.textArea, errors.description ? styles.inputError : null]}
              value={formData.description}
              onChangeText={(value) => updateField('description', value)}
              placeholder="Description du produit, qualité, origine..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          </View>

          {/* URL de l'image */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>URL de l'image (optionnel)</Text>
            <TextInput
              style={[styles.input, errors.image_url ? styles.inputError : null]}
              value={formData.image_url}
              onChangeText={(value) => updateField('image_url', value)}
              placeholder="https://example.com/image.jpg"
              autoCapitalize="none"
              keyboardType="url"
            />
            {errors.image_url && <Text style={styles.errorText}>{errors.image_url}</Text>}
          </View>

          {/* Produit bio */}
          <View style={styles.inputGroup}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => updateField('organic', !formData.organic)}
            >
              <View style={[styles.checkbox, formData.organic ? styles.checkboxChecked : null]}>
                {formData.organic && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>🌱 Produit biologique</Text>
            </TouchableOpacity>
          </View>

          {/* Boutons */}
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitButton, isSubmitting ? styles.buttonDisabled : null]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <View style={styles.buttonContent}>
                  <ActivityIndicator color="white" size="small" />
                  <Text style={styles.submitButtonText}>
                    {isEditing ? 'Modification...' : 'Ajout...'}
                  </Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>
                  {isEditing ? 'Modifier' : 'Ajouter'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Espace en bas pour le scroll */}
          <View style={styles.bottomSpace} />
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#16a34a',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  form: {
    flex: 1,
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
  textArea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: 'white',
    minHeight: 100,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
  },
  helpText: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  categoryScroll: {
    marginBottom: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  categoryButtonActive: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#6b7280',
  },
  categoryButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  unitScroll: {
    marginTop: 8,
  },
  unitButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 4,
    borderRadius: 4,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  unitButtonActive: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  unitButtonText: {
    fontSize: 12,
    color: '#6b7280',
  },
  unitButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  checkboxChecked: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#374151',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6b7280',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#16a34a',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpace: {
    height: 50,
  },
});

export default ProductForm;