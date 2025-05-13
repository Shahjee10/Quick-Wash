import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ContactUsScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <View style={styles.backIconContainer}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      {/* Header Image in a Circle */}
      <View style={styles.iconContainer}>
        <Image source={require('../../assets/contactus.png')} style={styles.headerIcon} />
      </View>

      {/* Title */}
      <Text style={styles.title}>Contact Us</Text>

      {/* Contact Details Card */}
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.card}>
          <Text style={styles.contactText}>
            <Ionicons name="call" size={20} color="#FFFFFF" /> 051-335571
          </Text>
          <Text style={styles.contactText}>
            <Ionicons name="call" size={20} color="#FFFFFF" /> 0331-5239001
          </Text>
          <Text style={styles.contactText}>
            <Ionicons name="mail" size={20} color="#FFFFFF" /> Quickwash@gmail.com
          </Text>
          <Text style={styles.contactText}>
            <Ionicons name="location-outline" size={20} color="#FFFFFF" /> Blue Area-Islamabad
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
    borderRadius: 50, // Circular shape
    borderWidth: 2,
    borderColor: '#FFFFFF', // White border around the image
  },
  title: {
    fontSize: 28, // Title size
    color: '#05293F', // Dark blue for the title
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollView: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#05293F', // Dark background for card
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  contactText: {
    color: '#FFFFFF', // White color for each contact detail
    marginBottom: 12,
    fontSize: 16,
    flexDirection: 'row',
    alignItems: 'center', // Align icon and text
  },
});

export default ContactUsScreen;
