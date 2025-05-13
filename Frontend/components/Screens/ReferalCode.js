import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import ENV from '../../env'; // Importing environment variables

const ReferralCodeScreen = ({ navigation }) => {
  const [referralCode, setReferralCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const fetchReferralCode = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const userTypeFromStorage = await AsyncStorage.getItem('userType');

        if (!token || !userTypeFromStorage) {
          Alert.alert('Error', 'No token or user type found');
          return;
        }

        setUserType(userTypeFromStorage);

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
          setReferralCode(result.referralCode); // Replace with actual field name for referral code
        } else {
          Alert.alert('Error', result.message || 'Failed to fetch referral code');
        }
      } catch (error) {
        console.error('Error fetching referral code:', error);
        Alert.alert('Error', 'Failed to connect to the server. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchReferralCode();
  }, []);

  const shareReferralCode = () => {
    if (referralCode) {
      const message = `Hello, \nI am sharing my referral code for Quickwash app. Use this code to get started: ${referralCode}.\n\nQuickwash.`;
      const url = `whatsapp://send?text=${message}`;

      Linking.openURL(url).catch((err) => console.error('Error sharing:', err));
    } else {
      Alert.alert('Error', 'Referral code is not available.');
    }
  };

  const copyToClipboard = () => {
    if (referralCode) {
      Linking.openURL(`sms:&body=${referralCode}`)
        .catch((err) => console.error('Error copying:', err));
      Alert.alert('Copied to Clipboard', `Referral Code: ${referralCode}`);
    }
  };

  if (loading) {
    return <Text style={styles.loadingText}>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#0A2E47" />
      </TouchableOpacity>

      {/* Referral Code Display */}
      <Text style={styles.title}>Your Referral Code</Text>
      <Text style={styles.referralCode}>{referralCode}</Text>

      {/* Buttons to share or copy referral code */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={shareReferralCode}>
          <Ionicons name="logo-whatsapp" size={30} color="#fff" />
          <Text style={styles.buttonText}>Share via WhatsApp</Text>
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
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 70,
    letterSpacing: 1.5,
  },
  referralCode: {
    fontSize: 36,
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    paddingVertical: 10,
    backgroundColor: '#ff9f00',
    borderRadius: 10,
    marginHorizontal: 30,
    elevation: 5,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    justifyContent: 'center',
    marginTop: 30,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#25D366', // WhatsApp green color
    padding: 12,
    borderRadius: 10,
    width: '45%',
    justifyContent: 'center',
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 20,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ReferralCodeScreen;
