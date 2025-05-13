import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Modal, FlatList, Alert, Linking, Platform } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import ENV from '../../env';

const { width } = Dimensions.get('window');

const CustomerDashboard = ({ navigation, route }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);
  const [rejectedBookings, setRejectedBookings] = useState([]);
  const [acceptedBookings, setAcceptedBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [userName, setUserName] = useState('');
  const [notificationTab, setNotificationTab] = useState('rejected');
  const [nearbyStations, setNearbyStations] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (route?.params?.customerName) {
      setUserName(route.params.customerName);
    } else {
      AsyncStorage.getItem('customerName').then(name => setUserName(name || 'Customer'));
    }
    getCurrentLocation();
  }, [route?.params?.customerName]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow location access to find nearby stations');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location.coords);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your location. Please try again.');
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  const fetchNearbyStations = async () => {
    try {
      setLoading(true);
      // Check if we have current location
      if (!currentLocation) {
        console.log('Getting current location...');
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Please allow location access to find nearby stations');
          return;
        }
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation(location.coords);
      }

      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'Please login to view nearby stations');
        return;
      }

      const response = await fetch(`${ENV.API_BASE_URL}/api/providers/locations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stations');
      }

      const data = await response.json();
      if (!data.providers || !Array.isArray(data.providers)) {
        console.error('Invalid data structure:', data);
        setNearbyStations([]);
        return;
      }

      // Filter out providers without valid location data
      const validStations = data.providers.filter(provider =>
        provider.location &&
        provider.location.coordinates &&
        Array.isArray(provider.location.coordinates) &&
        provider.location.coordinates.length === 2
      );
      const stationsWithCoords = validStations.map(station => ({
        ...station,
        distance: calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          station.location.coordinates[1], // latitude
          station.location.coordinates[0]  // longitude
        )
      }));

      // For stations without coordinates, use Google Distance Matrix API
      const stationsWithoutCoords = data.providers.filter(provider =>
        !(
          provider.location &&
          provider.location.coordinates &&
          Array.isArray(provider.location.coordinates) &&
          provider.location.coordinates.length === 2
        ) && provider.address
      );

      const googleDistances = await Promise.all(
        stationsWithoutCoords.map(async (station) => {
          try {
            const origins = `${currentLocation.latitude},${currentLocation.longitude}`;
            const destinations = encodeURIComponent(station.address);
            const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&key=${ENV.GOOGLE_API_KEY}`;
            const res = await fetch(url);
            const result = await res.json();
            let distance = null;
            if (
              result.rows &&
              result.rows[0] &&
              result.rows[0].elements &&
              result.rows[0].elements[0] &&
              result.rows[0].elements[0].status === 'OK'
            ) {
              // distance in meters
              distance = result.rows[0].elements[0].distance.value / 1000; // convert to km
            }
            return {
              ...station,
              distance,
            };
          } catch (e) {
            return {
              ...station,
              distance: null,
            };
          }
        })
      );

      // Combine and sort all stations by distance (if available)
      const allStations = [...stationsWithCoords, ...googleDistances];
      const sortedStations = allStations.sort((a, b) => {
        if (typeof a.distance === 'number' && typeof b.distance === 'number') {
          return a.distance - b.distance;
        } else if (typeof a.distance === 'number') {
          return -1;
        } else if (typeof b.distance === 'number') {
          return 1;
        } else {
          return 0;
        }
      });
      setNearbyStations(sortedStations);
    } catch (error) {
      console.error('Error fetching nearby stations:', error);
      Alert.alert('Error', 'Failed to fetch nearby stations');
      setNearbyStations([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Rejected Bookings
  const fetchRejectedBookings = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'User token not found. Please log in again.');
        return;
      }

      const response = await fetch(`${ENV.API_BASE_URL}/api/bookings/rejected-bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response Error:', errorText);
        Alert.alert('Error', `Failed to fetch rejected bookings: ${errorText}`);
        return;
      }

      const data = await response.json();
      setRejectedBookings(data.bookings || []);
    } catch (error) {
      console.error('Error fetching rejected bookings:', error);
      Alert.alert('Error', 'Failed to fetch bookings. Please try again.');
    }
  };

  // Fetch Accepted Bookings
  const fetchAcceptedBookings = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'User token not found. Please log in again.');
        return;
      }

      const response = await fetch(`${ENV.API_BASE_URL}/api/bookings/accepted-bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response Error:', errorText);
        Alert.alert('Error', `Failed to fetch accepted bookings: ${errorText}`);
        return;
      }

      const data = await response.json();
      setAcceptedBookings(data.bookings || []);
    } catch (error) {
      console.error('Error fetching accepted bookings:', error);
      Alert.alert('Error', 'Failed to fetch bookings. Please try again.');
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

  useEffect(() => {
    fetchRejectedBookings();
    fetchAcceptedBookings();
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (currentLocation) {
      fetchNearbyStations();
    }
  }, [currentLocation]);

  const handleMenuItemPress = (screenName) => {
    setIsDrawerOpen(false);
    if (screenName === 'CustomerBookingScreen') {
      navigation.navigate(screenName, { acceptedBookings });
    } else {
      navigation.navigate(screenName);
    }
  };

  const handleHistoryPress = () => {
    // Filter only accepted bookings
    const acceptedBookingsList = acceptedBookings.filter(booking => booking.status === 'Accepted');
    navigation.navigate('MyBookingsScreen', { bookings: acceptedBookingsList });
  };

  // Helper to open Google Maps
  const openInGoogleMaps = (station) => {
    if (station.location && station.location.coordinates && station.location.coordinates.length === 2) {
      const [lng, lat] = station.location.coordinates;
      const url = Platform.select({
        ios: `maps:0,0?q=${lat},${lng}`,
        android: `geo:0,0?q=${lat},${lng}(${encodeURIComponent(station.name)})`
      });
      Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open Google Maps.'));
    } else if (station.address) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(station.address)}`;
      Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open Google Maps.'));
    } else {
      Alert.alert('No location data', 'No location or address available for this station.');
    }
  };

  const renderStationCard = (station) => (
    <TouchableOpacity 
      key={station._id}
      style={styles.stationCardEnhanced}
      activeOpacity={0.85}
      onPress={() => openInGoogleMaps(station)}
    >
      <View style={styles.stationHeaderEnhanced}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="location" size={22} color="#3993C4" style={{ marginRight: 8 }} />
            <Text style={styles.stationNameEnhanced}>{station.name}</Text>
          </View>
          <View style={styles.ratingContainerEnhanced}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingTextEnhanced}>{station.rating || 'New'}</Text>
          </View>
        </View>
        <View style={styles.mapIconContainer}>
          <Ionicons name="map" size={22} color="#3993C4" />
          <Text style={styles.mapText}>View on Map</Text>
        </View>
      </View>
      <View style={styles.stationDetailsEnhanced}>
        <View style={styles.detailRowEnhanced}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.addressTextEnhanced} numberOfLines={2}>{station.address}</Text>
        </View>
        <View style={styles.detailRowEnhanced}>
          <Ionicons name="call" size={16} color="#666" />
          <Text style={styles.contactTextEnhanced}>{station.contactNumber}</Text>
        </View>
        <View style={styles.detailRowEnhanced}>
          <Ionicons name="time" size={16} color="#666" />
          <Text style={styles.workingHoursTextEnhanced}>{station.workingHours || '24/7'}</Text>
        </View>
        {typeof station.distance === 'number' && !isNaN(station.distance) ? (
          <View style={styles.distanceContainerEnhanced}>
            <Ionicons name="walk" size={16} color="#666" />
            <Text style={styles.distanceTextEnhanced}>
              {station.distance < 1
                ? `${Math.round(station.distance * 1000)} m away`
                : `${station.distance.toFixed(1)} km away`}
            </Text>
          </View>
        ) : (
          <View style={styles.distanceContainerEnhanced}>
            <Ionicons name="walk" size={16} color="#666" />
            <Text style={styles.distanceTextEnhanced}>Distance unavailable</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#3993C4' }}>
      {/* Top Welcome Bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0A2E47', borderTopLeftRadius: 8, borderTopRightRadius: 8, paddingVertical: 16, paddingHorizontal: 18, marginTop: 33 }}>
        <Text style={{ color: 'white', fontSize: 22, fontWeight: 'bold', textAlign: 'left' }}>{userName}</Text>
        <Text style={{ color: 'white', fontSize: 22, fontWeight: 'bold', textAlign: 'right' }}>خوش آمدید !</Text>
      </View>

      {/* Burger Menu Floating */}
      <TouchableOpacity style={{ position: 'absolute', left: 18, top: 38, backgroundColor: '#fff', borderRadius: 8, padding: 7, elevation: 6, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, marginTop: 63 }} onPress={() => setIsDrawerOpen(true)}>
        <Ionicons name="menu" size={26} color="#0A2E47" />
      </TouchableOpacity>

      {/* Main Content */}
      <View style={{ flex: 1, padding: 20, marginTop: 20 }}>
        {/* Request Service Button */}
        <TouchableOpacity 
          style={styles.requestButton}
          onPress={() => navigation.navigate('ServicesScreen')}
        >
          <Text style={styles.requestButtonText}>Request a Service</Text>
        </TouchableOpacity>

        {/* Nearby Service Stations Section */}
        <Text style={styles.sectionTitle}>Nearby Service Stations</Text>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="sync" size={30} color="white" />
            <Text style={styles.loadingText}>Loading nearby stations...</Text>
          </View>
        ) : (
          <FlatList
            data={nearbyStations}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => renderStationCard(item)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 10 }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="location" size={40} color="white" />
                <Text style={styles.emptyText}>No service stations found nearby</Text>
              </View>
            }
          />
        )}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home" size={24} color="white" />
          <Text style={styles.navButtonText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('AccountScreen')}>
          <Ionicons name="person" size={24} color="white" />
          <Text style={styles.navButtonText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={handleHistoryPress}>
          <Ionicons name="time" size={24} color="white" />
          <Text style={styles.navButtonText}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => setNotificationsModalVisible(true)}>
          <Ionicons name="notifications" size={24} color="white" />
          <Text style={styles.navButtonText}>Notifications</Text>
        </TouchableOpacity>
      </View>

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

      {/* Notifications Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={notificationsModalVisible}
      >
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
              style={[styles.tabButton, notificationTab === 'rejected' && styles.activeTabButton]}
              onPress={() => setNotificationTab('rejected')}
            >
              <Text style={[styles.tabButtonText, notificationTab === 'rejected' && styles.activeTabButtonText]}>Rejected Bookings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, notificationTab === 'service' && styles.activeTabButton]}
              onPress={() => setNotificationTab('service')}
            >
              <Text style={[styles.tabButtonText, notificationTab === 'service' && styles.activeTabButtonText]}>Service Updates</Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {notificationTab === 'rejected' ? (
            <>
              <Text style={styles.sectionTitle}>Rejected Bookings</Text>
              <FlatList
                data={rejectedBookings}
                keyExtractor={(item) => item._id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.notificationCard}>
                    <Text style={styles.notificationText}>
                      <Text style={styles.label}>Service:</Text> {item.service}
                    </Text>
                    <Text style={styles.notificationText}>
                      <Text style={styles.label}>Price:</Text> {item.price}
                    </Text>
                    <Text style={styles.notificationText}>
                      <Text style={styles.label}>Status:</Text> Rejected
                    </Text>
                  </View>
                )}
              />
            </>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Service Updates</Text>
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
                        name={item.type === 'SERVICE_COMPLETED' ? 'checkmark-circle' : 'notifications'}
                        size={24}
                        color={!item.read ? '#3498DB' : '#95A5A6'}
                      />
                      <Text style={[styles.notificationTitle, !item.read && styles.unreadText]}>
                        {item.type === 'SERVICE_COMPLETED' ? 'Service Completed' : 'Notification'}
                      </Text>
                      {!item.read && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.notificationMessage}>{item.message}</Text>
                    <Text style={styles.notificationTime}>
                      {new Date(item.createdAt).toLocaleString()}
                    </Text>
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

const menuItems = [
  { label: 'Payment Method', iconComponent: MaterialCommunityIcons, iconName: 'credit-card-outline', screenName: 'PaymentMethodScreen' },
  { label: 'Feedback', iconComponent: Ionicons, iconName: 'chatbubble-outline', screenName: 'FeedbackScreen' },
  { label: 'Complaints', iconComponent: Ionicons, iconName: 'alert-circle-outline', screenName: 'ComplaintScreen' },
  { label: 'Privacy Policy', iconComponent: Ionicons, iconName: 'document-text-outline', screenName: 'PrivacyPolicyScreen' },
  { label: 'Customer Support', iconComponent: Ionicons, iconName: 'headset-outline', screenName: 'CustomerSupportScreen' },
  { label: 'Terms & condition', iconComponent: Ionicons, iconName: 'document-outline', screenName: 'TermsConditionsScreen' },
  { label: 'Settings', iconComponent: Ionicons, iconName: 'settings-outline', screenName: 'SettingsScreen' },
  { label: 'Logout', iconComponent: Ionicons, iconName: 'log-out-outline', screenName: 'Login' },
];

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  menuButton: { position: 'absolute', top: 60, left: 20, backgroundColor: '#ffffff', borderRadius: 10, padding: 8, elevation: 5 },
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
  requestButton: {
    backgroundColor: '#0A2E47',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginTop: 20,
  },
  requestButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  modalContainer: { flex: 1, backgroundColor: '#FFFFFF', padding: 20 },
  closeModal: { alignSelf: 'flex-end' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#0A2E47', marginBottom: 20 },
  notificationCard: { backgroundColor: '#F4F6F9', padding: 15, borderRadius: 10, marginBottom: 10 },
  notificationText: { fontSize: 14, color: '#34495E' },
  label: { fontWeight: 'bold', color: '#3993C4' },
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  stationCardEnhanced: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  stationHeaderEnhanced: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stationNameEnhanced: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#0A2E47',
    marginRight: 8,
  },
  ratingContainerEnhanced: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
    marginLeft: 8,
    backgroundColor: '#F7E9A0',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  ratingTextEnhanced: {
    color: '#0A2E47',
    marginLeft: 3,
    fontWeight: 'bold',
    fontSize: 14,
  },
  mapIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F0F7',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 8,
  },
  mapText: {
    color: '#3993C4',
    marginLeft: 4,
    fontSize: 13,
    fontWeight: 'bold',
  },
  stationDetailsEnhanced: {
    marginTop: 6,
  },
  detailRowEnhanced: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  addressTextEnhanced: {
    color: '#666',
    marginLeft: 10,
    fontSize: 15,
    flex: 1,
  },
  contactTextEnhanced: {
    color: '#0A2E47',
    fontSize: 15,
    marginLeft: 10,
  },
  workingHoursTextEnhanced: {
    color: '#3993C4',
    marginLeft: 10,
    fontSize: 15,
  },
  distanceContainerEnhanced: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  distanceTextEnhanced: {
    color: '#3993C4',
    marginLeft: 10,
    fontSize: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
});

export default CustomerDashboard;
