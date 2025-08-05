// Villes de RCA
export const cities = [
  { id: 'tous', name: 'Toutes les villes' },
  { id: 'bangui', name: 'Bangui' },
  { id: 'bimbo', name: 'Bimbo' },
  { id: 'begoua', name: 'Bégoua' },
  { id: 'bambari', name: 'Bambari' },
  { id: 'bouar', name: 'Bouar' }
];

// Catégories
export const categories = [
  { id: 'tous', name: 'Tous' },
  { id: 'cereales', name: 'Céréales' },
  { id: 'legumes', name: 'Légumes' },
  { id: 'fruits', name: 'Fruits' },
  { id: 'manioc', name: 'Manioc' }
];

// Types de manioc
export const maniacTypes = [
  { id: 'tubercule', name: 'Manioc Tubercule', icon: '🥔' },
  { id: 'feuilles', name: 'Feuilles de Manioc', icon: '🍃' },
  { id: 'poudre', name: 'Poudre de Manioc', icon: '🌾' }
];

// Produits initiaux
export const initialProducts = [
  { 
    id: 1, 
    name: 'Manioc Tubercule Bio', 
    category: 'manioc', 
    price: 650, 
    unit: 'kg', 
    farmer_id: 1,
    farmer: 'Jean Bokassa', 
    location: 'PK5, Bangui',
    city: 'bangui',
    phone: '+236 70 12 34 56', 
    image: '🥔', 
    rating: 4.8, 
    stock: 50,
    metadata: {
      organic: true,
      harvestDate: '2025-06-20',
      description: 'Manioc tubercule bio de première qualité'
    },
    reviews: 23,
    totalSold: 156
  },
  // ... autres produits
];

// Commandes initiales
export const initialOrders = [
  {
    id: 1,
    buyer_id: 10,
    product_id: 1,
    farmer_id: 1,
    buyer_name: 'Restaurant Le Baobab',
    farmer_name: 'Jean Bokassa',
    product_name: 'Manioc Tubercule Bio',
    quantity: 25,
    unit_price: 650,
    total: 16250,
    status: 'confirmed',
    created_at: '2025-06-25'
  }
];