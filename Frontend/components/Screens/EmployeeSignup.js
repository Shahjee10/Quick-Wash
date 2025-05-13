import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ENV from '../../env'; // Import the environment variables

const { width, height } = Dimensions.get('window');

const isValidPakistaniCnic = (cnic) => {
  // Accepts both with and without dashes
  return /^\d{5}-?\d{7}-?\d{1}$/.test(cnic);
};

const EmployeeSignup = ({ navigation }) => {
  const [name, setName] = useState('');
  const [cnic, setCnic] = useState('');
  const [referralCode, setReferralCode] = useState('');

  const handleRegister = async () => {
    if (!name || !cnic || !referralCode) {
      Alert.alert('Error', 'All fields are required');
      return;
    }
    if (!isValidPakistaniCnic(cnic)) {
      Alert.alert('Error', 'Please enter a valid Pakistani CNIC (e.g. 12345-1234567-1 or 1234512345671)');
      return;
    }
  
    try {
      const normalizedCnic = cnic.replace(/-/g, '');
      const response = await fetch(`${ENV.API_BASE_URL}/api/employees/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, cnic: normalizedCnic, referralCode }),
      });
  
      // Log the raw response to see what the server is returning
      const text = await response.text();
      console.log('Raw response:', text);
  
      // Try to parse the response as JSON
      const result = JSON.parse(text);
  
      if (response.ok) {
        Alert.alert('Success', 'Registration successful.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', result.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      Alert.alert('Error', 'Failed to connect to the server. Please try again later.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <View style={styles.backIconContainer}>
          <Icon name="arrow-left" size={height * 0.03} color="#0A2E47" />
        </View>
      </TouchableOpacity>

      {/* Profile Icon and Title */}
      <Icon name="account-circle" size={height * 0.1} color="#ffffff" style={styles.icon} />
      <Text style={styles.title}>Create Account</Text>

      {/* Form Fields */}
      <View style={styles.formContainer}>
        <Text style={styles.label}>NAME</Text>
        <TextInput
          style={styles.input}
          placeholder="ENTER NAME"
          placeholderTextColor="#AAAAAA"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>CNIC</Text>
        <TextInput
          style={styles.input}
          placeholder="ENTER CNIC"
          placeholderTextColor="#AAAAAA"
          keyboardType="numeric"
          value={cnic}
          onChangeText={setCnic}
        />

        <Text style={styles.label}>REFERRAL CODE</Text>
        <TextInput
          style={styles.input}
          placeholder="ENTER CODE"
          placeholderTextColor="#AAAAAA"
          value={referralCode}
          onChangeText={setReferralCode}
        />
      </View>

      {/* Register Button */}
      <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
        <Text style={styles.registerButtonText}>Register</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A2E47',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: width * 0.05,
  },
  backButton: {
    position: 'absolute',
    top: height * 0.05,
    left: width * 0.05,
  },
  backIconContainer: {
    width: height * 0.06,
    height: height * 0.06,
    borderRadius: (height * 0.06) / 2,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginTop: height * 0.08,
    marginBottom: height * 0.02,
  },
  title: {
    fontSize: height * 0.035,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: height * 0.03,
  },
  formContainer: {
    width: '100%',
    marginBottom: height * 0.03,
  },
  label: {
    color: '#ffffff',
    marginLeft: width * 0.02,
    marginBottom: height * 0.005,
    fontSize: height * 0.018,
    fontWeight: '500',
  },
  input: {
    width: '100%',
    height: height * 0.065,
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    paddingHorizontal: width * 0.04,
    marginBottom: height * 0.02,
    fontSize: height * 0.02,
    color: '#333333',
  },
  registerButton: {
    width: '100%',
    height: height * 0.065,
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: height * 0.02,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: height * 0.022,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: height * 0.02,
  },
  footerText: {
    color: '#ffffff',
    fontSize: height * 0.018,
  },
  loginText: {
    color: '#4A90E2',
    fontSize: height * 0.018,
    fontWeight: '600',
  },
});

export default EmployeeSignup;