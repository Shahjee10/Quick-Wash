import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ENV from '../../env';

const BookingScreen = ({ route, navigation }) => {
  const { serviceTitle, servicePrice } = route.params;

  const [address, setAddress] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [preferences, setPreferences] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const fetchAddressSuggestions = async (query) => {
    if (query.length > 2) {
      const API_KEY = ENV.GOOGLE_API_KEY;
      const endpoint = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${query}&key=${API_KEY}`;
      try {
        const response = await fetch(endpoint);
        const data = await response.json();
        if (data.status === 'OK') {
          setSuggestions(data.predictions);
        } else {
          console.error('Error fetching address suggestions:', data.error_message);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleAddressSelect = (description) => {
    setAddress(description);
    setSuggestions([]);
  };

  const handleSendBid = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken'); // Get user token for authentication

      const response = await fetch(`${ENV.API_BASE_URL}/api/bookings/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          service: serviceTitle,
          price: servicePrice,
          address,
          vehicle,
          vehicleModel,
          preferences,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Booking Request sent to Provider!');
        navigation.goBack(); // Redirect back to services or home
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while booking the service. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.innerContainer}>
        <Text style={styles.header}>Enter Booking Details</Text>
        <View style={styles.card}>
          <Text style={styles.serviceTitle}>{serviceTitle}</Text>
          <Text style={styles.priceText}>{servicePrice}</Text>
        </View>

        <View style={{ position: 'relative', width: '100%' }}>
          <TextInput
            style={styles.input}
            placeholder="Address"
            value={address}
            onChangeText={(text) => {
              setAddress(text);
              fetchAddressSuggestions(text);
            }}
            placeholderTextColor="#AAAAAA"
          />
          {suggestions.length > 0 && (
            <FlatList
              data={suggestions}
              keyExtractor={(item) => item.place_id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestionItem}
                  onPress={() => handleAddressSelect(item.description)}
                >
                  <Text style={styles.suggestionText}>{item.description}</Text>
                </TouchableOpacity>
              )}
              style={styles.suggestionsContainer}
            />
          )}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Vehicle"
          value={vehicle}
          onChangeText={setVehicle}
          placeholderTextColor="#AAAAAA"
        />

        <TextInput
          style={styles.input}
          placeholder="Vehicle Model"
          value={vehicleModel}
          onChangeText={setVehicleModel}
          placeholderTextColor="#AAAAAA"
        />

        <TextInput
          style={styles.input}
          placeholder="Specific preferences"
          value={preferences}
          onChangeText={setPreferences}
          placeholderTextColor="#AAAAAA"
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSendBid}>
          <Text style={styles.buttonText}>Send Request</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F6F9',
  },
  innerContainer: {
    width: '90%',
    alignItems: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#05293F',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3993C4',
    marginBottom: 5,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27AE60',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#333333',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 60, // Positioned right below the address input
    left: 0,
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    maxHeight: 150,
    overflow: 'hidden',
    elevation: 3,
    zIndex: 1000, // Ensure it's above other elements
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#3993C4',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BookingScreen;
