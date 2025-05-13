import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

const ServiceBookingScreen = ({ route, navigation }) => {
  const { selectedService, userToken } = route.params;
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format time for display
  const formatTime = (time) => {
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const onTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || time;
    setShowTimePicker(Platform.OS === 'ios');
    setTime(currentTime);
  };

  const handleBooking = async () => {
    try {
      setIsSubmitting(true);

      // Validate selected date and time
      const now = new Date();
      if (date < now) {
        Alert.alert('Invalid Date', 'Please select a future date');
        return;
      }

      // Combine date and time
      const bookingDateTime = new Date(date);
      bookingDateTime.setHours(time.getHours());
      bookingDateTime.setMinutes(time.getMinutes());

      const response = await fetch('http://192.168.100.27:5000/api/bookings/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service: selectedService.name,
          price: selectedService.price,
          bookingDate: bookingDateTime.toISOString().split('T')[0],
          bookingTime: formatTime(time),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Success',
          'Your booking request has been sent successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('CustomerHomeScreen'),
            },
          ]
        );
      } else {
        throw new Error(data.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      Alert.alert('Error', error.message || 'Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Service</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Service Details */}
        <View style={styles.serviceCard}>
          <Text style={styles.serviceTitle}>{selectedService.name}</Text>
          <Text style={styles.servicePrice}>{selectedService.price}</Text>
          <Text style={styles.serviceDescription}>{selectedService.description}</Text>
        </View>

        {/* Date Selection */}
        <View style={styles.selectionCard}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <TouchableOpacity
            style={styles.selectionButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar" size={24} color="#3498DB" />
            <Text style={styles.selectionText}>{formatDate(date)}</Text>
          </TouchableOpacity>
        </View>

        {/* Time Selection */}
        <View style={styles.selectionCard}>
          <Text style={styles.sectionTitle}>Select Time</Text>
          <TouchableOpacity
            style={styles.selectionButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Ionicons name="time" size={24} color="#3498DB" />
            <Text style={styles.selectionText}>{formatTime(time)}</Text>
          </TouchableOpacity>
        </View>

        {/* Book Now Button */}
        <TouchableOpacity
          style={[styles.bookButton, isSubmitting && styles.disabledButton]}
          onPress={handleBooking}
          disabled={isSubmitting}
        >
          <Text style={styles.bookButtonText}>
            {isSubmitting ? 'Booking...' : 'Book Now'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#002347',
    paddingVertical: 15,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 15,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginRight: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  serviceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#002347',
    marginBottom: 8,
  },
  servicePrice: {
    fontSize: 20,
    color: '#3498DB',
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  selectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#002347',
    marginBottom: 12,
  },
  selectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectionText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  bookButton: {
    backgroundColor: '#3498DB',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  disabledButton: {
    backgroundColor: '#B2D6F0',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ServiceBookingScreen;