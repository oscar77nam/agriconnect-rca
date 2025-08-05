import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { maniacTypes } from '../../data/constants';

const ProductForm = ({ product = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    category: product?.category || 'manioc',
    type: product?.type || 'tubercule',
    price: product?.price?.toString() || '',
    unit: 'kg',
    quantity: product?.stock?.toString() || '',
    organic: product?.metadata?.organic || false,
    harvestDate: product?.metadata?.harvestDate || new Date().toISOString().split('T')[0],
    description: product?.metadata?.description || ''
  });

  const handleSubmit = () => {
    if (!formData.price || !formData.quantity) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    let finalData = { ...formData };

    if (formData.category === 'manioc') {
      const maniacType = maniacTypes.find(t => t.id === formData.type);
      finalData.name = maniacType ? maniacType.name : formData.name;
      finalData.image = maniacType ? maniacType.icon : '🥔';
    }

    onSubmit(finalData);
  };

  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {product ? '✏️ Modifier le produit' : '➕ Ajouter un produit'}
          </Text>
          <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
            <Ionicons name="close" size={20} color="#374151" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Catégorie *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.category}
                  onValueChange={(value) => setFormData({...formData, category: value})}
                  style={styles.picker}
                >
                  <Picker.Item label="🥔 Manioc" value="manioc" />
                  <Picker.Item label="🌾 Céréales" value="cereales" />
                  <Picker.Item label="🥬 Légumes" value="legumes" />
                  <Picker.Item label="🥭 Fruits" value="fruits" />
                </Picker>
              </View>
            </View>

            {formData.category === 'manioc' && (
              <View style={styles.field}>
                <Text style={styles.label}>Type de manioc *</Text>
                <View style={styles.typeContainer}>
                  {maniacTypes.map(type => (
                    <TouchableOpacity
                      key={type.id}
                      onPress={() => setFormData({...formData, type: type.id})}
                      style={[
                        styles.typeButton,
                        formData.type === type.id && styles.typeButtonActive
                      ]}
                    >
                      <Text style={styles.typeEmoji}>{type.icon}</Text>
                      <Text style={[
                        styles.typeText,
                        formData.type === type.id && styles.typeTextActive
                      ]}>
                        {type.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {formData.category !== 'manioc' && (
              <View style={styles.field}>
                <Text style={styles.label}>Nom du produit *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Tomates fraîches"
                  value={formData.name}
                  onChangeText={(text) => setFormData({...formData, name: text})}
                />
              </View>
            )}

            <View style={styles.field}>
              <Text style={styles.label}>Prix par kg (FCFA) *</Text>
              <TextInput
                style={styles.input}
                placeholder="650"
                value={formData.price}
                onChangeText={(text) => setFormData({...formData, price: text})}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Quantité disponible (kg) *</Text>
              <TextInput
                style={styles.input}
                placeholder="50"
                value={formData.quantity}
                onChangeText={(text) => setFormData({...formData, quantity: text})}
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity
              onPress={() => setFormData({...formData, organic: !formData.organic})}
              style={styles.checkboxContainer}
            >
              <View style={[styles.checkbox, formData.organic && styles.checkboxActive]}>
                {formData.organic && <Ionicons name="checkmark" size={16} color="white" />}
              </View>
              <Text style={styles.checkboxLabel}>🌿 Produit biologique</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            onPress={onCancel}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSubmit}
            style={styles.submitButton}
          >
            <Text style={styles.submitButtonText}>
              {product ? 'Modifier' : 'Ajouter'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  form: {
    gap: 20,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
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
  typeContainer: {
    gap: 8,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: 'white',
  },
  typeButtonActive: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  typeEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  typeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  typeTextActive: {
    color: '#16a34a',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  footer: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#16a34a',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default ProductForm;