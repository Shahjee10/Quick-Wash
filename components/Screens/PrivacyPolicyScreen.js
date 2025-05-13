import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PrivacyPolicyScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Header Icon */}
      <View style={styles.iconContainer}>
        <Image source={require('../../assets/policy.png')} style={styles.headerIcon} />
      </View>

      {/* Title */}
      <Text style={styles.title}>Privacy Policy</Text>

      {/* Content Card */}
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.card}>
          <Text style={styles.updatedText}>Last updated: 01-01-2025</Text>
          <Text style={styles.contentText}>
            At Quick Wash, we value your privacy. We collect limited information such as personal details (e.g., name, email), usage data, and, with your permission, location data. 
            This information helps us improve our services, communicate with you, and enhance your experience. 
            We do not share your information with third parties except for essential services or when required by law. 
            You have control over your data and can contact us to modify or delete it.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9', // Light background color
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: '#05293F', // Dark background for the back button
    borderRadius: 20,
    padding: 8,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIcon: {
    width: 100, // Adjust width as needed
    height: 100, // Adjust height as needed
  },
  title: {
    fontSize: 28,
    color: '#05293F', // Dark blue for the title
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollView: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#E3E8EB', // Light gray background for the card
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  updatedText: {
    color: '#05293F', // Dark blue for the updated text
    marginBottom: 10,
    fontWeight: 'bold',
  },
  contentText: {
    color: '#05293F', // Dark blue for the content text
    lineHeight: 20,
  },
});

export default PrivacyPolicyScreen;
