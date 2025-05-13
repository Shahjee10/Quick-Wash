import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ENV from '../../env';

const CustomerBookingScreen = ({ navigation }) => {
  const [acceptedBookings, setAcceptedBookings] = useState([]);

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

  useEffect(() => {
    fetchAcceptedBookings();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Accepted Bookings</Text>
      <ScrollView contentContainerStyle={styles.scrollView}>
        {acceptedBookings.map((booking, index) => (
          <View key={index} style={styles.bookingCard}>
            <Text style={styles.bookingText}>
              <Text style={styles.label}>Service: </Text>{booking.service}
            </Text>
            <Text style={styles.bookingText}>
              <Text style={styles.label}>Price: </Text>{booking.price}
            </Text>
            <Text style={styles.bookingText}>
              <Text style={styles.label}>Address: </Text>{booking.address}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F4F6F9' },
  title: { marginTop:25,fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  scrollView: { paddingBottom: 20 },
  bookingCard: { backgroundColor: '#fff', padding: 15, marginBottom: 15, borderRadius: 10 },
  bookingText: { fontSize: 16, marginBottom: 5 },
  label: { fontWeight: 'bold' },
});

export default CustomerBookingScreen;
