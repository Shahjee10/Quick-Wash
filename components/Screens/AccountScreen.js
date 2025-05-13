import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import ENV from '../../env';

const AccountScreen = ({ navigation }) => {
  const [userType, setUserType] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the user type from AsyncStorage
    const fetchUserTypeAndData = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const userTypeFromStorage = await AsyncStorage.getItem('userType');

        if (!token || !userTypeFromStorage) {
          Alert.alert('Error', 'No token or user type found');
          return;
        }

        setUserType(userTypeFromStorage);

        // Determine the endpoint based on the user type
        const endpoint =
          userTypeFromStorage === 'customer'
            ? `${ENV.API_BASE_URL}/api/auth/me`
            : `${ENV.API_BASE_URL}/api/providers/me`;

        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();
        if (response.ok) {
          setName(result.name);
          setEmail(result.email);

          // Additional fields for provider
          if (userTypeFromStorage === 'provider') {
            setContactNumber(result.contactNumber);
            setCity(result.city);
            setAddress(result.address);
          }
        } else {
          Alert.alert('Error', result.message || 'Failed to fetch account data');
        }
      } catch (error) {
        console.error('Error fetching account data:', error);
        Alert.alert('Error', 'Failed to connect to the server. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserTypeAndData();
  }, []); // Run once when the screen loads

  const handleUpdate = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'No token found');
        return;
      }

      const endpoint =
        userType === 'customer'
          ? `${ENV.API_BASE_URL}/api/auth/update`
          : `${ENV.API_BASE_URL}/api/providers/update`;

      const body =
        userType === 'customer'
          ? { name, email }
          : { name, email, contactNumber, city, address };

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Account data updated successfully');
      } else {
        Alert.alert('Error', result.message || 'Failed to update account data');
      }
    } catch (error) {
      console.error('Error updating account data:', error);
      Alert.alert('Error', 'Failed to connect to the server. Please try again later.');
    }
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <View style={styles.backIconContainer}>
          <Ionicons name="arrow-back" size={24} color="#0A2E47" />
        </View>
      </TouchableOpacity>

      {/* Profile Icon and Title */}
      <Ionicons name="person-circle-outline" size={80} color="white" style={styles.icon} />
      <Text style={styles.title}>Account</Text>

      {/* Form Fields */}
      <View style={styles.formContainer}>
        <Text style={styles.label}>NAME</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter Name"
          placeholderTextColor="#AAAAAA"
        />

        <Text style={styles.label}>EMAIL</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter Email"
          placeholderTextColor="#AAAAAA"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {userType === 'provider' && (
          <>
            <Text style={styles.label}>CONTACT NUMBER</Text>
            <TextInput
              style={styles.input}
              value={contactNumber}
              onChangeText={setContactNumber}
              placeholder="Enter Contact Number"
              placeholderTextColor="#AAAAAA"
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>CITY</Text>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder="Enter City"
              placeholderTextColor="#AAAAAA"
            />

            <Text style={styles.label}>ADDRESS</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="Enter Address"
              placeholderTextColor="#AAAAAA"
            />
          </>
        )}

        <TouchableOpacity style={styles.button} onPress={handleUpdate}>
          <Text style={styles.buttonText}>Update</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0A2E47',
    marginTop: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  backIconContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 8,
    elevation: 5,
  },
  icon: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  pickerContainer: {
    width: '100%',
    marginBottom: 20,
  },
  picker: {
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
    height: 50,
    color: '#333333',
  },
  formContainer: {
    width: '100%',
  },
  label: {
    color: '#ffffff',
    marginBottom: 5,
    marginLeft: 5,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#333333',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AccountScreen;
