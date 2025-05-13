import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ENV from '../../env';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import 'react-native-get-random-values';

const ServiceProviderRegistration = ({ navigation }) => {
  const [name, setName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [location, setLocation] = useState(null);

  const handleRegister = async () => {
    try {
      if (!name || !email || !password || !contactNumber || !city || !address || !location) {
        Alert.alert('Error', 'All fields are required');
        return;
      }

      // Check if email exists
      const emailCheckResponse = await fetch(`${ENV.API_BASE_URL}/api/providers/check-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const emailCheckData = await emailCheckResponse.json();
      if (emailCheckData.exists) {
        Alert.alert('Error', 'Email already registered');
        return;
      }

      const response = await fetch(`${ENV.API_BASE_URL}/api/providers/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          contactNumber,
          city,
          address,
          location: {
            latitude: location.latitude,
            longitude: location.longitude
          },
          referralCode
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert(
          'Success',
          'Registration successful. Please check your email for the verification code.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('EmailVerificationProvider', { email })
            }
          ]
        );
      } else {
        Alert.alert('Error', data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Registration failed. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Use FlatList instead of ScrollView to avoid nesting VirtualizedLists */}
      <FlatList
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        data={[1]} // Placeholder data to make FlatList render
        renderItem={() => (
          <View style={styles.container}>
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <View style={styles.backIconContainer}>
                <Ionicons name="arrow-back" size={24} color="#0A2E47" />
              </View>
            </TouchableOpacity>

            {/* Header Icon and Title */}
            <Ionicons name="person-circle-outline" size={80} marginTop={-25} color="white" style={styles.icon} />
            <Text style={styles.title}>Create Account</Text>

            {/* Form Fields */}
            <View style={styles.formContainer}>
              <TextInput
                placeholder="Enter Name"
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholderTextColor="#AAAAAA"
              />

              <TextInput
                placeholder="0311 Contact Number"
                style={styles.input}
                value={contactNumber}
                onChangeText={setContactNumber}
                keyboardType="phone-pad"
                placeholderTextColor="#AAAAAA"
              />

              <TextInput
                placeholder="City"
                style={styles.input}
                value={city}
                onChangeText={setCity}
                placeholderTextColor="#AAAAAA"
              />

              <View style={{ width: '100%', marginBottom: 15 }}>
                <GooglePlacesAutocomplete
                  placeholder="Enter your address"
                  onPress={(data, details = null) => {
                    try {
                      if (details && details.geometry && details.geometry.location) {
                        setAddress(details.formatted_address || data.description);
                        setLocation({
                          latitude: details.geometry.location.lat,
                          longitude: details.geometry.location.lng
                        });
                      } else {
                        console.warn('Location details not found in the response');
                        Alert.alert('Error', 'Could not get location details. Please try selecting the address again.');
                      }
                    } catch (error) {
                      console.error('Error setting location:', error);
                      Alert.alert('Error', 'Failed to set location. Please try again.');
                    }
                  }}
                  query={{
                    key: ENV.GOOGLE_API_KEY,
                    language: 'en',
                  }}
                  fetchDetails={true}
                  enablePoweredByContainer={false}
                  styles={{
                    container: {
                      flex: 0,
                      marginBottom: 10,
                    },
                    textInput: {
                      height: 50,
                      borderWidth: 1,
                      borderColor: '#ddd',
                      borderRadius: 8,
                      paddingHorizontal: 15,
                      fontSize: 16,
                    },
                  }}
                />
              </View>

              <TextInput
                placeholder="Email"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor="#AAAAAA"
              />

              <View style={styles.passwordContainer}>
                <TextInput
                  placeholder="Enter Password"
                  style={styles.passwordInput}
                  secureTextEntry={!passwordVisible}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                  placeholderTextColor="#AAAAAA"
                />
                <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={styles.eyeIcon}>
                  <Ionicons name={passwordVisible ? 'eye-off' : 'eye'} size={24} color="#AAAAAA" />
                </TouchableOpacity>
              </View>

              {/* Referral Code Field */}
              <TextInput
                placeholder="Enter Referral Code"
                style={styles.input}
                value={referralCode}
                onChangeText={setReferralCode}
                placeholderTextColor="#AAAAAA"
              />

              <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
                <Text style={styles.registerButtonText}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A2E47',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  backIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 30,
  },
  formContainer: {
    width: '100%',
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333333',
  },
  eyeIcon: {
    padding: 10,
  },
  registerButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ServiceProviderRegistration;
