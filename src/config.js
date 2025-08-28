// src/config.js
import { Platform } from 'react-native';
import * as Device from 'expo-device';

// Configuration du backend
const getBaseUrl = () => {
  // En développement
  if (__DEV__) {
    if (Platform.OS === 'android') {
      // Émulateur Android
      if (Device.isDevice) {
        // Appareil physique Android - remplacez par l'IP de votre machine
        return 'http://192.168.1.100:3000'; // ⚠️ CHANGEZ CETTE IP
      }
      // Émulateur Android
      return 'http://10.0.2.2:3000';
    } else if (Platform.OS === 'ios') {
      // Simulateur iOS ou appareil physique iOS
      if (Device.isDevice) {
        // Appareil physique iOS - remplacez par l'IP de votre machine
        return 'http://192.168.1.100:3000'; // ⚠️ CHANGEZ CETTE IP
      }
      // Simulateur iOS
      return 'http://localhost:3000';
    }
    // Web
    return 'http://localhost:3000';
  }
  
  // En production - remplacez par votre URL de production
  return 'https://api.agriconnect-rca.com';
};

// Mock data pour tester sans backend
export const MOCK_MODE = false; // Mettez à true pour utiliser les données mock

export const MOCK_USERS = [
  {
    id: '1',
    name: 'Jean Agriculteur',
    phone: '0651890061',
    password: '123456',
    type: 'farmer',
    location: 'Bangui'
  },
  {
    id: '2',
    name: 'Marie Acheteuse',
    phone: '0651890062',
    password: '123456',
    type: 'buyer',
    location: 'Bimbo'
  }
];

export const MOCK_PRODUCTS = [
  { 
    id: 1, 
    name: 'Manioc frais', 
    price: 500, 
    location: 'Bangui', 
    category: 'tubercules', 
    emoji: '🥔',
    farmer_name: 'Jean Agriculteur',
    quantity: 100,
    unit: 'kg'
  },
  { 
    id: 2, 
    name: 'Bananes plantains', 
    price: 300, 
    location: 'Bimbo', 
    category: 'fruits', 
    emoji: '🍌',
    farmer_name: 'Paul Producteur',
    quantity: 50,
    unit: 'régimes'
  },
  { 
    id: 3, 
    name: 'Maïs', 
    price: 400, 
    location: 'Berbérati', 
    category: 'cereales', 
    emoji: '🌽',
    farmer_name: 'Pierre Cultivateur',
    quantity: 200,
    unit: 'kg'
  },
  { 
    id: 4, 
    name: 'Tomates fraîches', 
    price: 250, 
    location: 'Bangui', 
    category: 'legumes', 
    emoji: '🍅',
    farmer_name: 'Marie Jardinière',
    quantity: 30,
    unit: 'caisses'
  },
  { 
    id: 5, 
    name: 'Arachides', 
    price: 600, 
    location: 'Carnot', 
    category: 'cereales', 
    emoji: '🥜',
    farmer_name: 'Joseph Fermier',
    quantity: 150,
    unit: 'kg'
  },
];

const config = {
  API_BASE_URL: getBaseUrl(),
  MOCK_MODE,
  MOCK_USERS,
  MOCK_PRODUCTS,
  
  // Autres configurations
  DEFAULT_TIMEOUT: 30000, // 30 secondes
  MAX_RETRY_ATTEMPTS: 3,
  
  // Messages d'erreur
  ERRORS: {
    NETWORK: 'Problème de connexion. Vérifiez votre connexion internet et réessayez.',
    SERVER: 'Le serveur est momentanément indisponible. Veuillez réessayer plus tard.',
    AUTH: 'Identifiants incorrects. Veuillez vérifier et réessayer.',
    GENERIC: 'Une erreur est survenue. Veuillez réessayer.',
  }
};

export default config;