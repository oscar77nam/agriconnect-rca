import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Header from '../common/Header';

const NotificationsScreen = ({ 
  notifications,
  user,
  onBack,
  onHome,
  screenHistory,
  currentScreen
}) => (
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
      <Text style={styles.headerText}>{notifications.length} notifications</Text>
    </View>
    
    <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
      {notifications.map(notification => (
        <View key={notification.id} style={styles.notificationCard}>
          <Text style={styles.notificationMessage}>{notification.message}</Text>
          <Text style={styles.notificationTime}>{notification.time}</Text>
        </View>
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#eab308',
    padding: 24,
  },
  headerText: {
    color: 'white',
    fontSize: 16,
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 100,
  },
  notificationCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  notificationMessage: {
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default NotificationsScreen;