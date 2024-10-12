import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import Button from '../Buttons/Button'; // Assuming you already have a custom Button component

const OnBoardingScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Welcome Title */}
      <Text style={styles.title}>Welcome to QuickWash!</Text>
      
      {/* Description */}
      <Text style={styles.description}>
        "Quick Wash, Delivered to Your Door—Shine Anytime, Anywhere!"
      </Text>

      {/* Illustration Image */}
      <Image
        source={require('../../assets/welcome.jpg')} // Ensure this points to your illustration image
        style={styles.illustration}
        resizeMode="contain"
      />

      {/* Continue Button */}
      <Button
        title="Continue"
        onPress={() => navigation.replace('Login')}
        buttonStyle={styles.button} // Ensure your Button component can accept custom styles
        textStyle={styles.buttonText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#007AFF', // Blue color like the image
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#555', // Darker shade for text
    marginHorizontal: 20, // Add some horizontal padding for a neater look
  },
  illustration: {
    width: '100%',  // Full width of the screen
    height: 250, // Adjust height for your illustration
    marginBottom: 30, // Space between image and button
  },
  button: {
    backgroundColor: '#3993C4', // Blue button color
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',  // White text for button
    fontSize: 18,
  },
});

export default OnBoardingScreen;