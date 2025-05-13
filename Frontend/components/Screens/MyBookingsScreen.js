import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ENV from '../../env';

const MyBookingsScreen = ({ navigation, route }) => {
  const [bookings, setBookings] = useState([]);
  const [isProvider, setIsProvider] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserType();
  }, []);

  const checkUserType = async () => {
    try {
      const userType = await AsyncStorage.getItem('userType');
      setIsProvider(userType === 'provider');
      if (userType === 'provider') {
        fetchProviderBookings();
      } else {
        const { bookings: customerBookings } = route.params || { bookings: [] };
        setBookings(customerBookings);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking user type:', error);
      Alert.alert('Error', 'Failed to load bookings. Please try again.');
    }
  };

  const fetchProviderBookings = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'User token not found. Please log in again.');
        return;
      }

      const response = await fetch(`${ENV.API_BASE_URL}/api/bookings/provider-accepted-bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Error fetching provider bookings:', error);
      Alert.alert('Error', 'Failed to fetch bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsCompleted = async (bookingId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${ENV.API_BASE_URL}/api/bookings/booking-status`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId, status: 'Completed' }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark booking as completed');
      }

      // Update local state
      setBookings(bookings.filter(booking => booking._id !== bookingId));
      Alert.alert('Success', 'Booking marked as completed');
    } catch (error) {
      console.error('Error marking booking as completed:', error);
      Alert.alert('Error', 'Failed to mark booking as completed. Please try again.');
    }
  };

  const openInMap = (address) => {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    Linking.openURL(url).catch((err) => console.error('Error opening map:', err));
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <View style={styles.backIconContainer}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>
        {isProvider ? 'Provider Bookings' : 'Your Accepted Bookings'}
      </Text>

      {/* Bookings List */}
      <ScrollView contentContainerStyle={styles.scrollView}>
        {loading ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="sync" size={50} color="#CCCCCC" />
            <Text style={styles.emptyText}>Loading bookings...</Text>
          </View>
        ) : bookings.length > 0 ? (
          bookings.map((booking) => (
            <View key={booking._id} style={styles.bookingCard}>
              <View style={styles.bookingHeader}>
                <Text style={styles.serviceType}>{booking.service}</Text>
                <View style={[styles.statusBadge, { backgroundColor: '#4CAF50' }]}>
                  <Text style={styles.statusText}>Accepted</Text>
                </View>
              </View>

              <View style={styles.bookingDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="car" size={20} color="#05293F" />
                  <Text style={styles.detailText}>{booking.vehicle} - {booking.vehicleModel}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="location" size={20} color="#05293F" />
                  <TouchableOpacity onPress={() => openInMap(booking.address)}>
                    <Text style={[styles.detailText, styles.linkText]}>{booking.address}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="cash" size={20} color="#05293F" />
                  <Text style={styles.detailText}>Rs. {booking.price}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="calendar" size={20} color="#05293F" />
                  <Text style={styles.detailText}>
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </Text>
                </View>

                {booking.preferences && (
                  <View style={styles.detailRow}>
                    <Ionicons name="options" size={20} color="#05293F" />
                    <Text style={styles.detailText}>{booking.preferences}</Text>
                  </View>
                )}

                {isProvider && (
                  <View style={styles.detailRow}>
                    <Ionicons name="person" size={20} color="#05293F" />
                    <Text style={styles.detailText}>
                      Customer: {booking.user?.name || 'N/A'}
                    </Text>
                  </View>
                )}

                {isProvider && (
                  <TouchableOpacity
                    style={styles.completeButton}
                    onPress={() => handleMarkAsCompleted(booking._id)}
                  >
                    <Text style={styles.completeButtonText}>Mark as Completed</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="time" size={50} color="#CCCCCC" />
            <Text style={styles.emptyText}>No accepted bookings found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9',
    paddingTop: 60,
  },
  backButton: {
    position: 'absolute',
    top: 43,
    left: 20,
    zIndex: 1,
  },
  backIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#05293F',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  title: {
    fontSize: 28,
    top: 25,
    color: '#05293F',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollView: {
    padding: 16,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#05293F',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bookingDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 16,
    color: '#333333',
  },
  linkText: {
    color: '#3993C4',
    textDecorationLine: 'underline',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 10,
  },
  completeButton: {
    backgroundColor: '#27AE60',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MyBookingsScreen;
