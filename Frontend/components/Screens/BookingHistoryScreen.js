import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import ENV from '../../env';

const BookingHistoryScreen = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = async () => {
    try {
      const response = await axios.get(`${ENV.API_BASE_URL}/api/bookings/history`);
      // Filter only accepted bookings
      const acceptedBookings = response.data.filter(booking => booking.status === 'Accepted');
      setBookings(acceptedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      alert('Failed to load booking history');
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Accepted':
        return '#4CAF50';
      case 'Pending':
        return '#FFC107';
      case 'Rejected':
        return '#F44336';
      case 'Completed':
        return '#2196F3';
      default:
        return '#757575';
    }
  };

  const renderBookingItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.bookingCard}
      onPress={() => navigation.navigate('BookingDetails', { booking: item })}
    >
      <View style={styles.bookingHeader}>
        <Text style={styles.serviceType}>{item.service}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="car" size={20} color="#05293F" />
          <Text style={styles.detailText}>{item.vehicle} - {item.vehicleModel}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="location" size={20} color="#05293F" />
          <Text style={styles.detailText}>{item.address}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="cash" size={20} color="#05293F" />
          <Text style={styles.detailText}>Rs. {item.price}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={20} color="#05293F" />
          <Text style={styles.detailText}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <View style={styles.backIconContainer}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Booking History</Text>

      {/* Bookings List */}
      <FlatList
        data={bookings}
        renderItem={renderBookingItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="time" size={50} color="#CCCCCC" />
            <Text style={styles.emptyText}>No booking history found</Text>
          </View>
        }
      />
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
    top: 40,
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
    color: '#05293F',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  listContainer: {
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
});

export default BookingHistoryScreen; 