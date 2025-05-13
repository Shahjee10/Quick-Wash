import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Modal, FlatList, Alert } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Circle } from 'react-native-maps';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import ENV from '../../env';

const { width } = Dimensions.get('window');

const ProviderDashboard = ({ navigation, route }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [providers, setProviders] = useState([]);
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [providerName, setProviderName] = useState('');
  const [notificationTab, setNotificationTab] = useState('requests'); // 'requests' or 'updates'

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to show your position on the map.');
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High
        });
        const { latitude, longitude } = location.coords;
        setCurrentLocation({ latitude, longitude });
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });

        // Start watching position
        const locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 10
          },
          (newLocation) => {
            const { latitude, longitude } = newLocation.coords;
            setCurrentLocation({ latitude, longitude });
          }
        );

        // Cleanup subscription on unmount
        return () => {
          if (locationSubscription) {
            locationSubscription.remove();
          }
        };
      } catch (error) {
        console.error('Error getting location:', error);
        Alert.alert('Error', 'Failed to get your current location.');
      }
    })();

    fetchProviders();
    // Fetch provider name from AsyncStorage or route param
    if (route?.params?.providerName) {
      setProviderName(route.params.providerName);
    } else {
      AsyncStorage.getItem('providerName').then(name => setProviderName(name || 'Provider'));
    }
  }, [route?.params?.providerName]);

  const fetchProviders = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'User token not found. Please log in again.');
        return;
      }

      const response = await fetch(`${ENV.API_BASE_URL}/api/providers/locations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response Error:', errorText);
        return;
      }

      const data = await response.json();
      setProviders(data.providers || []);
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const fetchBookingRequests = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'User token not found. Please log in again.');
        return;
      }

      const response = await fetch(`${ENV.API_BASE_URL}/api/bookings/pending-bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response Error:', errorText);
        Alert.alert('Error', `Failed to fetch bookings: ${errorText}`);
        return;
      }

      const data = await response.json();
      setBookingRequests(data.bookings || []);
    } catch (error) {
      console.error('Error fetching booking requests:', error);
      Alert.alert('Error', 'Failed to fetch booking requests. Please try again.');
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'User token not found. Please log in again.');
        return;
      }

      const response = await fetch(`${ENV.API_BASE_URL}/api/bookings/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response Error:', errorText);
        Alert.alert('Error', `Failed to fetch notifications: ${errorText}`);
        return;
      }

      const data = await response.json();
      if (data.notifications) {
        setNotifications(data.notifications);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Alert.alert('Error', 'Failed to fetch notifications. Please try again.');
    }
  };

  const handleAccept = async (bookingId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${ENV.API_BASE_URL}/api/bookings/booking-status`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId, status: 'Accepted' }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Booking accepted.');
        setBookingRequests((prevRequests) => prevRequests.filter((req) => req._id !== bookingId));
      } else {
        Alert.alert('Error', data.message || 'Failed to accept booking.');
      }
    } catch (error) {
      console.error('Error accepting booking:', error);
      Alert.alert('Error', 'Failed to accept booking. Please try again.');
    }
  };

  const handleDecline = async (bookingId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${ENV.API_BASE_URL}/api/bookings/booking-status`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId, status: 'Rejected' }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Booking declined.');
        setBookingRequests((prevRequests) => prevRequests.filter((req) => req._id !== bookingId));
      } else {
        Alert.alert('Error', data.message || 'Failed to decline booking.');
      }
    } catch (error) {
      console.error('Error declining booking:', error);
      Alert.alert('Error', 'Failed to decline booking. Please try again.');
    }
  };

  const handleMarkNotificationAsRead = async (notificationId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${ENV.API_BASE_URL}/api/bookings/notifications/mark-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      // Remove the notification from the list
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification._id !== notificationId)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      Alert.alert('Error', 'Failed to mark notification as read. Please try again.');
    }
  };

  const menuItems = [
    
  
    { label: 'Privacy Policy', iconComponent: Ionicons, iconName: 'document-text-outline', screenName: 'PrivacyPolicyScreen' },
    { label: 'Contact Us', iconComponent: Ionicons, iconName: 'headset-outline', screenName: 'ContactUsScreen' },
    { label: 'Terms & Conditions', iconComponent: Ionicons, iconName: 'document-outline', screenName: 'TermsConditionsScreen' },
    { label: 'Referral Code', iconComponent: Ionicons, iconName: 'share-social-outline', screenName: 'ReferralCodeScreen' },
   
    { label: 'Logout', iconComponent: Ionicons, iconName: 'log-out-outline', screenName: 'Login' },
  ];
  

  const handleMenuItemPress = (screenName) => {
    setIsDrawerOpen(false);
    if (screenName) {
      navigation.navigate(screenName);
    }
  };

  useEffect(() => {
    if (notificationsModalVisible) {
      fetchBookingRequests();
      fetchNotifications();
    }
  }, [notificationsModalVisible]);

  return (
    <View style={{ flex: 1, backgroundColor: '#3993C4' }}>
      {/* Top Welcome Bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0A2E47', borderTopLeftRadius: 8, borderTopRightRadius: 8, paddingVertical: 16, paddingHorizontal: 18, marginTop: 33 }}>
        <Text style={{ color: 'white', fontSize: 22, fontWeight: 'bold', textAlign: 'left' }}>{providerName}</Text>
        <Text style={{ color: 'white', fontSize: 22, fontWeight: 'bold', textAlign: 'right' }}>خوش آمدید !</Text>
      </View>

      {/* Burger Menu Floating */}
      <TouchableOpacity style={{ position: 'absolute', left: 18, top: 38, backgroundColor: '#fff', borderRadius: 8, padding: 7, elevation: 6, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, marginTop: 63 }} onPress={() => setIsDrawerOpen(true)}>
        <Ionicons name="menu" size={26} color="#0A2E47" />
      </TouchableOpacity>

      {/* Drawer Menu */}
      <Modal
        visible={isDrawerOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsDrawerOpen(false)}
      >
        <View style={styles.drawerContainer}>
          <View style={styles.drawerContent}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Menu</Text>
              <TouchableOpacity onPress={() => setIsDrawerOpen(false)}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={menuItems}
              keyExtractor={(item) => item.label}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.drawerItem}
                  onPress={() => {
                    setIsDrawerOpen(false);
                    navigation.navigate(item.screenName);
                  }}
                >
                  <item.iconComponent name={item.iconName} size={24} color="white" />
                  <Text style={styles.drawerItemText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Main Buttons */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 }}>
        <TouchableOpacity style={styles.mainButton} onPress={() => navigation.navigate('MyBookingsScreen')}>
          <Text style={styles.buttonText}>My Bookings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.mainButton} onPress={() => navigation.navigate('VerifyEmployeeScreen')}>
          <Text style={styles.buttonText}>Verify Employee</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.mainButton} onPress={() => navigation.navigate('FeedbackScreen')}>
          <Text style={styles.buttonText}>Customer feedback</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.mainButton} onPress={() => navigation.navigate('ProviderComplaintsScreen')}>
          <Text style={styles.buttonText}>Complaints</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('ProviderDashboard')}>
          <Ionicons name="home" size={24} color="white" />
          <Text style={styles.navButtonText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('AssignTaskScreen')}>
          <Ionicons name="people" size={24} color="white" />
          <Text style={styles.navButtonText}>Assign Task</Text>
        </TouchableOpacity>
       
        <TouchableOpacity style={styles.navButton} onPress={() => setNotificationsModalVisible(true)}>
          <Ionicons name="notifications" size={24} color="white" />
          <Text style={styles.navButtonText}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('AccountScreen')}>
          <Ionicons name="person" size={24} color="white" />
          <Text style={styles.navButtonText}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Notifications Modal */}
      <Modal animationType="slide" transparent={true} visible={notificationsModalVisible}>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeModal}
            onPress={() => setNotificationsModalVisible(false)}
          >
            <Ionicons name="close" size={30} color="#0A2E47" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Notifications</Text>

          {/* Tab Bar */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabButton, notificationTab === 'requests' && styles.activeTabButton]}
              onPress={() => setNotificationTab('requests')}
            >
              <Text style={[styles.tabButtonText, notificationTab === 'requests' && styles.activeTabButtonText]}>Booking Requests</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, notificationTab === 'updates' && styles.activeTabButton]}
              onPress={() => setNotificationTab('updates')}
            >
              <Text style={[styles.tabButtonText, notificationTab === 'updates' && styles.activeTabButtonText]}>Task Updates</Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {notificationTab === 'requests' ? (
            <>
              <Text style={styles.sectionTitle}>Booking Requests</Text>
              <FlatList
                data={bookingRequests}
                keyExtractor={(item) => item._id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.requestCard}>
                    <Text style={styles.serviceTitle}>{item.service}</Text>
                    <Text style={styles.requestDetails}>Price: {item.price}</Text>
                    <Text style={styles.requestDetails}>Customer: {item.user.name}</Text>
                    <Text style={styles.requestDetails}>Email: {item.user.email}</Text>
                    <Text style={styles.requestDetails}>Address: {item.address}</Text>
                    <Text style={styles.requestDetails}>Vehicle: {item.vehicle} ({item.vehicleModel})</Text>
                    <Text style={styles.requestDetails}>Preferences: {item.preferences}</Text>
                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() => handleAccept(item._id)}
                      >
                        <Text style={styles.buttonText}>Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.declineButton}
                        onPress={() => handleDecline(item._id)}
                      >
                        <Text style={styles.buttonText}>Decline</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
            </>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Task Updates</Text>
              <FlatList
                data={notifications}
                keyExtractor={(item) => item._id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.notificationCard}
                    onPress={() => handleMarkNotificationAsRead(item._id)}
                  >
                    <View style={styles.notificationHeader}>
                      <Ionicons
                        name={item.type === 'TASK_COMPLETED' ? 'checkmark-circle' : 'notifications'}
                        size={24}
                        color={!item.read ? '#3498DB' : '#95A5A6'}
                      />
                      <Text style={[styles.notificationTitle, !item.read && styles.unreadText]}>
                        {item.type === 'TASK_COMPLETED' ? 'Task Completed' : 'Notification'}
                      </Text>
                      {!item.read && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.notificationMessage}>{item.message}</Text>
                    {item.bookingId && (
                      <View style={styles.bookingDetails}>
                        <Text style={styles.detailText}>
                          <Text style={styles.label}>Service:</Text> {item.bookingId.service}
                        </Text>
                        <Text style={styles.detailText}>
                          <Text style={styles.label}>Completed at:</Text> {new Date(item.createdAt).toLocaleString()}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )}
              />
            </>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  mainButton: {
    backgroundColor: '#1B263B',
    borderRadius: 18,
    width: width * 0.8,
    paddingVertical: 22,
    marginVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  bottomNavigation: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0A2E47',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 8,
    elevation: 10,
  },
  navButton: { alignItems: 'center', flex: 1 },
  navButtonText: { color: 'white', fontSize: 12, marginTop: 5 },
  modalContainer: { flex: 1, backgroundColor: '#FFFFFF', padding: 20 },
  closeModal: { alignSelf: 'flex-end' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#0A2E47', marginBottom: 20 },
  requestCard: {
    backgroundColor: '#F4F6F9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  serviceTitle: { fontSize: 18, fontWeight: 'bold', color: '#3993C4', marginBottom: 10 },
  requestDetails: { fontSize: 14, color: '#34495E', marginBottom: 5 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  acceptButton: { backgroundColor: '#27AE60', padding: 10, borderRadius: 5 },
  declineButton: { backgroundColor: '#E74C3C', padding: 10, borderRadius: 5 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A2E47',
    marginTop: 20,
    marginBottom: 10,
  },
  notificationCard: {
    backgroundColor: '#F4F6F9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#95A5A6',
    marginLeft: 8,
    flex: 1,
  },
  unreadText: {
    color: '#3498DB',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#34495E',
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#95A5A6',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3498DB',
  },
  bookingDetails: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  detailText: {
    fontSize: 14,
    color: '#34495E',
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
    color: '#3993C4',
  },
  drawerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawerContent: {
    flex: 1,
    backgroundColor: '#0A2E47',
    width: '80%',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    padding: 20,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  drawerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  drawerItemText: {
    fontSize: 16,
    color: 'white',
    marginLeft: 15,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F4F6F9',
    borderRadius: 10,
    marginBottom: 10,
    marginTop: 10,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#F4F6F9',
  },
  activeTabButton: {
    backgroundColor: '#0A2E47',
  },
  tabButtonText: {
    color: '#0A2E47',
    fontWeight: 'bold',
    fontSize: 16,
  },
  activeTabButtonText: {
    color: 'white',
  },
});

export default ProviderDashboard;
