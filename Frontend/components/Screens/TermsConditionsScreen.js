import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TermsConditionsScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <View style={styles.backIconContainer}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      {/* Header Icon */}
      <View style={styles.iconContainer}>
        <Image source={require('../../assets/t&C.png')} style={styles.headerIcon} />
      </View>

      {/* Title */}
      <Text style={styles.title}>Terms & Conditions</Text>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.updatedText}>Last updated: 01-01-2025</Text>
        <Text style={styles.contentText}>
          By using Quick Wash, you agree to the following terms:
        </Text>
        <View style={styles.card}>
          <Text style={styles.term}>
            1. You must be at least 18 to use the app.
          </Text>
          <Text style={styles.term}>
            2. You are responsible for keeping your login information secure.
          </Text>
          <Text style={styles.term}>
            3. Our services are provided "as is," without warranties of any kind.
          </Text>
          <Text style={styles.term}>
            4. We are not responsible for any damages or losses from using the app.
          </Text>
          <Text style={styles.term}>
            5. We may update the app or these terms without prior notice, so please check back regularly.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9', // Light background color for better contrast
    paddingHorizontal: 20,
    paddingTop: 60,
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
    backgroundColor: '#05293F', // Dark background for the back button
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
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
    fontSize: 28, // Slightly larger font size for emphasis
    color: '#05293F', // Dark blue for the title
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollView: {
    paddingBottom: 20,
  },
  updatedText: {
    color: '#05293F', // Dark blue for the updated text
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 10,
  },
  contentText: {
    color: '#05293F', // Dark blue for the content text
    marginBottom: 15,
    fontSize: 16,
  },
  card: {
    backgroundColor: '#E3E8EB', // Light gray background for card
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#dcdcdc', // Border color for subtle distinction
  },
  term: {
    color: '#05293F', // Dark blue for each term
    marginBottom: 12,
    fontSize: 16,
    lineHeight: 24, // Increased line height for better readability
  },
});

export default TermsConditionsScreen;
