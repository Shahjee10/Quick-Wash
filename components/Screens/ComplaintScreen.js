import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ENV from '../../env';

const ComplaintScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!contact.trim()) {
      Alert.alert('Error', 'Please enter your email or number');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter description');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        Alert.alert('Error', 'Please login to submit a complaint');
        return;
      }

      const response = await fetch(`${ENV.API_BASE_URL}/api/complaints/create`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: name.trim(),
          description: description.trim(),
          serviceType: 'Car Wash', // Default service type
          dateOfService: new Date().toISOString(),
          status: 'Pending'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error('Server returned an error');
      }

      const data = await response.json();
      
      Alert.alert(
        'Success',
        'Your complaint has been submitted successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );

      setName('');
      setContact('');
      setDescription('');

    } catch (error) {
      console.error('Complaint submission error:', error);
      Alert.alert(
        'Error',
        'Unable to submit complaint. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={styles.contentContainer}>
        {/* Header with Icon */}
        <View style={styles.headerContainer}>
          <Ionicons name="warning-outline" size={40} color="#000" />
          <Text style={styles.headerText}>Complaint</Text>
        </View>

        {/* Form Fields */}
        <TextInput
          style={styles.input}
          placeholder="Enter Name"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Enter Email or Number"
          placeholderTextColor="#999"
          value={contact}
          onChangeText={setContact}
          keyboardType="email-address"
        />

        <TextInput
          style={[styles.input, styles.descriptionInput]}
          placeholder="Description"
          placeholderTextColor="#999"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Submit Button */}
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3498DB',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
    padding: 8,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  headerText: {
    fontSize: 24,
    color: '#000',
    marginTop: 10,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  descriptionInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#002347',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ComplaintScreen;
