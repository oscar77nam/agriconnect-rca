// Constants spécifiques aux fonctionnalités agriculteurs

// Unités de mesure disponibles
export const PRODUCT_UNITS = [
  { 
    id: 'kg', 
    name: 'Kilogramme', 
    shortName: 'kg',
    icon: '⚖️',
    description: 'Poids en kilogrammes'
  },
  { 
    id: 'piece', 
    name: 'Pièce', 
    shortName: 'pièce',
    icon: '🔢',
    description: 'Nombre d\'unités individuelles'
  },
  { 
    id: 'sac', 
    name: 'Sac', 
    shortName: 'sac',
    icon: '🎒',
    description: 'Sacs ou contenants'
  },
  { 
    id: 'litre', 
    name: 'Litre', 
    shortName: 'L',
    icon: '🥤',
    description: 'Volume en litres'
  },
  { 
    id: 'botte', 
    name: 'Botte', 
    shortName: 'botte',
    icon: '🥬',
    description: 'Botte ou bouquet'
  }
];

// Étiquettes de qualité des produits
export const PRODUCT_LABELS = [
  { 
    id: 'nouveau', 
    name: 'Nouveau', 
    emoji: '🆕',
    color: '#2563eb',
    backgroundColor: '#eff6ff',
    description: 'Produit récemment ajouté'
  },
  { 
    id: 'frais', 
    name: 'Frais', 
    emoji: '🌱',
    color: '#16a34a',
    backgroundColor: '#f0fdf4',
    description: 'Produit frais du jour'
  },
  { 
    id: 'seche', 
    name: 'Séché', 
    emoji: '☀️',
    color: '#d97706',
    backgroundColor: '#fffbeb',
    description: 'Produit séché au soleil'
  },
  { 
    id: 'fume', 
    name: 'Fumé', 
    emoji: '🔥',
    color: '#dc2626',
    backgroundColor: '#fef2f2',
    description: 'Produit fumé traditionnellement'
  },
  { 
    id: 'bio', 
    name: 'Biologique', 
    emoji: '🌿',
    color: '#059669',
    backgroundColor: '#ecfdf5',
    description: 'Produit biologique certifié'
  },
  { 
    id: 'local', 
    name: 'Local', 
    emoji: '🏠',
    color: '#7c3aed',
    backgroundColor: '#f3e8ff',
    description: 'Produit local de la région'
  }
];

// Conseils agricoles par mois (RCA)
export const MONTHLY_TIPS = {
  1: { // Janvier
    title: 'Préparation des terres',
    emoji: '🚜',
    tip: 'Préparez vos champs pour la prochaine saison. C\'est le moment de labourer et d\'aménager les parcelles.'
  },
  2: { // Février
    title: 'Semis précoces',
    emoji: '🌱',
    tip: 'Commencez les semis de légumes et préparez les pépinières pour les cultures de saison.'
  },
  3: { // Mars
    title: 'Gestion de l\'eau',
    emoji: '💧',
    tip: 'Installez ou vérifiez vos systèmes d\'irrigation avant le début de la saison des pluies.'
  },
  4: { // Avril
    title: 'Plantation principale',
    emoji: '🌾',
    tip: 'C\'est le moment optimal pour planter maïs, arachides et autres cultures principales.'
  },
  5: { // Mai
    title: 'Entretien des cultures',
    emoji: '🌿',
    tip: 'Désherbez régulièrement et surveillez l\'apparition de maladies ou parasites.'
  },
  6: { // Juin
    title: 'Protection des cultures',
    emoji: '🛡️',
    tip: 'Protégez vos cultures contre les ravageurs. Utilisez des méthodes biologiques quand c\'est possible.'
  },
  7: { // Juillet
    title: 'Fertilisation',
    emoji: '🌱',
    tip: 'Apportez les engrais organiques et minéraux selon les besoins de vos cultures.'
  },
  8: { // Août
    title: 'Surveillance sanitaire',
    emoji: '👀',
    tip: 'Surveillez attentivement l\'état sanitaire de vos cultures et traitez si nécessaire.'
  },
  9: { // Septembre
    title: 'Préparation récolte',
    emoji: '📋',
    tip: 'Préparez vos outils et espaces de stockage pour les prochaines récoltes.'
  },
  10: { // Octobre
    title: 'Récolte principale',
    emoji: '🚛',
    tip: 'Récoltez au bon moment et stockez dans de bonnes conditions pour préserver la qualité.'
  },
  11: { // Novembre
    title: 'Post-récolte',
    emoji: '🏪',
    tip: 'Transformez et commercialisez vos produits. C\'est aussi le moment de planifier la prochaine saison.'
  },
  12: { // Décembre
    title: 'Bilan et planification',
    emoji: '📊',
    tip: 'Faites le bilan de l\'année et planifiez les cultures pour la prochaine saison.'
  }
};

// Messages d'encouragement pour les agriculteurs
export const MOTIVATIONAL_MESSAGES = [
  {
    message: "L'agriculture est le fondement de la civilisation et de toute prospérité.",
    author: "Proverbe africain",
    emoji: "🌾"
  },
  {
    message: "Chaque graine plantée est un acte d'espoir pour l'avenir.",
    author: "Sagesse populaire",
    emoji: "🌱"
  },
  {
    message: "La terre ne ment jamais, elle récompense toujours le travail honnête.",
    author: "Dicton centrafricain",
    emoji: "🌍"
  },
  {
    message: "Un bon agriculteur est celui qui nourrit aujourd'hui et prépare demain.",
    author: "Sagesse locale",
    emoji: "👨‍🌾"
  }
];

// Fonctions utilitaires pour les agriculteurs
export const FARMER_UTILS = {
  // Obtenir le conseil du mois actuel
  getCurrentMonthTip: () => {
    const currentMonth = new Date().getMonth() + 1;
    return MONTHLY_TIPS[currentMonth];
  },

  // Obtenir un message motivationnel aléatoire
  getRandomMotivationalMessage: () => {
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length);
    return MOTIVATIONAL_MESSAGES[randomIndex];
  },

  // Formater la devise FCFA
  formatCurrency: (amount) => {
    return `${amount.toLocaleString()} FCFA`;
  },

  // Calculer la valeur totale du stock
  calculateStockValue: (products) => {
    return products.reduce((total, product) => {
      return total + (product.quantity * product.price);
    }, 0);
  },

  // Valider les données d'un produit
  validateProduct: (productData) => {
    const errors = {};
    
    if (!productData.title || productData.title.trim().length < 2) {
      errors.title = 'Le titre doit contenir au moins 2 caractères';
    }
    
    if (!productData.quantity || productData.quantity <= 0) {
      errors.quantity = 'La quantité doit être supérieure à 0';
    }
    
    if (!productData.price || productData.price <= 0) {
      errors.price = 'Le prix doit être supérieur à 0';
    }
    
    if (!productData.unit) {
      errors.unit = 'L\'unité est obligatoire';
    }
    
    if (!productData.location || productData.location.trim().length === 0) {
      errors.location = 'La localité est obligatoire';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};

export default {
  PRODUCT_UNITS,
  PRODUCT_LABELS,
  MONTHLY_TIPS,
  MOTIVATIONAL_MESSAGES,
  FARMER_UTILS
};