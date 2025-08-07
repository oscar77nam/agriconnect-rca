// Villes de RCA
export const cities = [
  { id: 'tous', name: 'Toutes les villes' },
  { "id": "alindao", "name": "Alindao" },
  { "id": "baboua", "name": "Baboua" },
  { "id": "bambari", "name": "Bambari" },
  { "id": "bambio", "name": "Bambio" },
  { "id": "bamingui", "name": "Bamingui" },
  { "id": "bangassou", "name": "Bangassou" },
  { "id": "baoro", "name": "Baoro" },
  { "id": "batangafo", "name": "Batangafo" },
  { "id": "bayanga", "name": "Bayanga" },
  { "id": "berberati", "name": "Berbérati" },
  { "id": "bimbo", "name": "Bimbo" },
  { "id": "birao", "name": "Birao" },
  { "id": "bocaranga", "name": "Bocaranga" },
  { "id": "boda", "name": "Boda" },
  { "id": "bossangoa", "name": "Bossangoa" },
  { "id": "bossembele", "name": "Bossembélé" },
  { "id": "bouar", "name": "Bouar" },
  { "id": "bouca", "name": "Bouca" },
  { "id": "bozoum", "name": "Bozoum" },
  { "id": "bria", "name": "Bria" },
  { "id": "carnot", "name": "Carnot" },
  { "id": "damara", "name": "Damara" },
  { "id": "dekoa", "name": "Dékoa" },
  { "id": "fode", "name": "Fodé" },
  { "id": "gambo", "name": "Gambo" },
  { "id": "gamboula", "name": "Gamboula" },
  { "id": "grimari", "name": "Grimari" },
  { "id": "ippy", "name": "Ippy" },
  { "id": "kabo", "name": "Kabo" },
  { "id": "kaga-bandoro", "name": "Kaga-Bandoro" },
  { "id": "kembe", "name": "Kembé" },
  { "id": "kouango", "name": "Kouango" },
  { "id": "markounda", "name": "Markounda" },
  { "id": "mbaiki", "name": "Mbaïki" },
  { "id": "mobaye", "name": "Mobaye" },
  { "id": "mongoumba", "name": "Mongoumba" },
  { "id": "ndele", "name": "Ndélé" },
  { "id": "ngotto", "name": "Ngotto" },
  { "id": "nola", "name": "Nola" },
  { "id": "obo", "name": "Obo" },
  { "id": "ouadda", "name": "Ouadda" },
  { "id": "ouanda-djalle", "name": "Ouanda Djallé" },
  { "id": "ouango", "name": "Ouango" },
  { "id": "paoua", "name": "Paoua" },
  { "id": "rafai", "name": "Rafaï" },
  { "id": "sibut", "name": "Sibut" },
  { "id": "yalinga", "name": "Yalinga" },
  { "id": "yaloke", "name": "Yaloké" },
  { "id": "zemio", "name": "Zémio" }
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
  { 
    id: 2, 
    name: 'Feuilles de Manioc', 
    category: 'manioc', 
    price: 450, 
    unit: 'kg', 
    farmer_id: 2,
    farmer: 'Marie Yakoma', 
    location: 'Bégoua',
    city: 'begoua',
    phone: '+236 70 98 76 54', 
    image: '🍃', 
    rating: 4.5, 
    stock: 30,
    metadata: {
      organic: false,
      harvestDate: '2025-06-18',
      description: 'Feuilles fraîches de manioc'
    },
    reviews: 18,
    totalSold: 89
  },
  { 
    id: 3, 
    name: 'Poudre de Manioc', 
    category: 'manioc', 
    price: 850, 
    unit: 'kg', 
    farmer_id: 3,
    farmer: 'Paul Ndjeka', 
    location: 'Bimbo Centre',
    city: 'bimbo',
    phone: '+236 70 11 22 33', 
    image: '🌾', 
    rating: 4.9, 
    stock: 25,
    metadata: {
      organic: true,
      harvestDate: '2025-06-15',
      description: 'Poudre de manioc finement moulue'
    },
    reviews: 31,
    totalSold: 124
  },
  { 
    id: 4, 
    name: 'Maïs Grain', 
    category: 'cereales', 
    price: 500, 
    unit: 'kg', 
    farmer_id: 4,
    farmer: 'Sylvie Mboli', 
    location: 'Bambari',
    city: 'bambari',
    phone: '+236 70 55 66 77', 
    image: '🌽', 
    rating: 4.6, 
    stock: 80,
    metadata: {
      organic: false,
      harvestDate: '2025-06-10',
      description: 'Maïs grain sec de qualité'
    },
    reviews: 15,
    totalSold: 67
  },
  { 
    id: 5, 
    name: 'Tomates Fraîches', 
    category: 'legumes', 
    price: 700, 
    unit: 'kg', 
    farmer_id: 5,
    farmer: 'Joseph Koudou', 
    location: 'Bouar',
    city: 'bouar',
    phone: '+236 70 44 33 22', 
    image: '🍅', 
    rating: 4.3, 
    stock: 40,
    metadata: {
      organic: true,
      harvestDate: '2025-06-22',
      description: 'Tomates fraîches du jardin'
    },
    reviews: 12,
    totalSold: 45
  }
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
  },
  {
    id: 2,
    buyer_id: 11,
    product_id: 3,
    farmer_id: 3,
    buyer_name: 'Épicerie Centrale',
    farmer_name: 'Paul Ndjeka',
    product_name: 'Poudre de Manioc',
    quantity: 10,
    unit_price: 850,
    total: 8500,
    status: 'pending',
    created_at: '2025-06-26'
  },
  {
    id: 3,
    buyer_id: 12,
    product_id: 5,
    farmer_id: 5,
    buyer_name: 'Marché Central',
    farmer_name: 'Joseph Koudou',
    product_name: 'Tomates Fraîches',
    quantity: 15,
    unit_price: 700,
    total: 10500,
    status: 'delivered',
    created_at: '2025-06-24'
  }
];