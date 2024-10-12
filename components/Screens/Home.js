import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const Home = ({ navigation }) => {
  return (
    <LinearGradient 
      colors={['#B2FEFA', '#0ED2F7']} // Background gradient colors
      style={styles.container}
    >
      <Text style={styles.title}>Welcome Home!</Text>
      <Text style={styles.subtitle}>Your one-stop solution for quick and easy laundry services.</Text>

      <View style={styles.dashboard}>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('CarWash')}>
          <Text style={styles.cardTitle}>Car Wash</Text>
          <Text style={styles.cardDescription}>Quick and thorough car washing services.</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('CarpetCleaning')}>
          <Text style={styles.cardTitle}>Carpet Cleaning</Text>
          <Text style={styles.cardDescription}>Deep cleaning for your carpets and upholstery.</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('FullServices')}>
          <Text style={styles.cardTitle}>Full Services</Text>
          <Text style={styles.cardDescription}>Comprehensive services for all your laundry needs.</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('BookService')}>
          <Text style={styles.cardTitle}>Book a Service</Text>
          <Text style={styles.cardDescription}>Schedule your laundry service easily.</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.backButtonText}>Back to Login</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#022B42',
  },
  subtitle: {
    fontSize: 16,
    color: '#022B42',
    textAlign: 'center',
    marginBottom: 20,
  },
  dashboard: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    margin: 10,
    width: '45%', // Adjust the width for responsiveness
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3, // For Android shadow
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200EE',
  },
  cardDescription: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  backButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#6200EE',
    borderRadius: 5,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Home;
