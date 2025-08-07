import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../common/Header';

const NotificationsScreen = ({ 
  notifications,
  user,
  onBack,
  onHome,
  screenHistory,
  currentScreen,
  clearAllNotifications
}) => {
  const getNotificationIcon = (message) => {
    if (message.includes('🌾') || message.includes('nouveau')) return 'leaf';
    if (message.includes('📦') || message.includes('commande')) return 'cube';
    if (message.includes('💰') || message.includes('prix')) return 'cash';
    if (message.includes('🎉') || message.includes('bienvenue')) return 'gift';
    if (message.includes('✅')) return 'checkmark-circle';
    if (message.includes('❤️')) return 'heart';
    if (message.includes('🛒')) return 'bag';
    return 'notifications';
  };

  const getNotificationColor = (message) => {
    if (message.includes('🌾') || message.includes('nouveau')) return '#16a34a';
    if (message.includes('📦') || message.includes('commande')) return '#2563eb';
    if (message.includes('💰') || message.includes('prix')) return '#f59e0b';
    if (message.includes('🎉') || message.includes('bienvenue')) return '#7c3aed';
    if (message.includes('✅')) return '#16a34a';
    if (message.includes('❤️')) return '#dc2626';
    if (message.includes('🛒')) return '#2563eb';
    return '#6b7280';
  };

  const isRecentNotification = (time) => {
    const now = new Date();
    const [hours, minutes] = time.split(':');
    const notifTime = new Date();
    notifTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    // Considérer comme récent si moins de 2 heures
    return (now - notifTime) < (2 * 60 * 60 * 1000);
  };

  return (
    <View style={styles.container}>
      <Header 
        title="🔔 Notifications"
        onBack={onBack}
        onHome={onHome}
        screenHistory={screenHistory}
        currentScreen={currentScreen}
        user={user}
      />
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerText}>
            {notifications.length} notification{notifications.length > 1 ? 's' : ''}
          </Text>
          <Text style={styles.headerSubtext}>
            Restez informé de votre activité
          </Text>
        </View>
        
        {notifications.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={clearAllNotifications}
          >
            <Ionicons name="trash-outline" size={16} color="white" />
            <Text style={styles.clearButtonText}>Tout effacer</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={80} color="#d1d5db" />
            <Text style={styles.emptyTitle}>Aucune notification</Text>
            <Text style={styles.emptySubtext}>
              Vos notifications apparaîtront ici
            </Text>
          </View>
        ) : (
          <View>
            {notifications.map(notification => (
              <TouchableOpacity 
                key={notification.id} 
                style={[
                  styles.notificationCard,
                  isRecentNotification(notification.time) && styles.recentNotification
                ]}
              >
                <View style={styles.notificationContent}>
                  <View style={[
                    styles.iconContainer,
                    { backgroundColor: getNotificationColor(notification.message) + '20' }
                  ]}>
                    <Ionicons 
                      name={getNotificationIcon(notification.message)} 
                      size={20} 
                      color={getNotificationColor(notification.message)} 
                    />
                  </View>
                  
                  <View style={styles.textContent}>
                    <Text style={styles.notificationMessage}>
                      {notification.message}
                    </Text>
                    <View style={styles.timeContainer}>
                      <Ionicons name="time" size={12} color="#9ca3af" />
                      <Text style={styles.notificationTime}>
                        {notification.time}
                      </Text>
                    </View>
                  </View>
                  
                  {isRecentNotification(notification.time) && (
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>Nouveau</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
            
            {/* Notifications d'exemple supplémentaires pour la démonstration */}
            <View style={styles.olderSection}>
              <Text style={styles.sectionTitle}>Plus anciennes</Text>
              
              <TouchableOpacity style={styles.notificationCard}>
                <View style={styles.notificationContent}>
                  <View style={[styles.iconContainer, { backgroundColor: '#16a34a20' }]}>
                    <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
                  </View>
                  <View style={styles.textContent}>
                    <Text style={styles.notificationMessage}>
                      ✅ Votre produit "Manioc Tubercule" a été ajouté avec succès
                    </Text>
                    <View style={styles.timeContainer}>
                      <Ionicons name="time" size={12} color="#9ca3af" />
                      <Text style={styles.notificationTime}>Hier 16:30</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.notificationCard}>
                <View style={styles.notificationContent}>
                  <View style={[styles.iconContainer, { backgroundColor: '#f59e0b20' }]}>
                    <Ionicons name="trending-up" size={20} color="#f59e0b" />
                  </View>
                  <View style={styles.textContent}>
                    <Text style={styles.notificationMessage}>
                      📈 Vos ventes ont augmenté de 15% cette semaine
                    </Text>
                    <View style={styles.timeContainer}>
                      <Ionicons name="time" size={12} color="#9ca3af" />
                      <Text style={styles.notificationTime}>Il y a 2 jours</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#eab308',
    padding: 24,
  },
  headerContent: {
    marginBottom: 16,
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtext: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  notificationCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recentNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#eab308',
    backgroundColor: '#fffbeb',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 15,
    color: '#1f2937',
    marginBottom: 6,
    lineHeight: 22,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  newBadge: {
    backgroundColor: '#eab308',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  olderSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 16,
  },
});

export default NotificationsScreen;