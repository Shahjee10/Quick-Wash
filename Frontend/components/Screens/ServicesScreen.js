import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const servicesData = [
  {
    id: '1',
    title: "Exterior Wash",
    time: "20-30 mins",
    description: "Removes dirt, grime, and contaminants from the exterior surfaces of the car.",
    details: ["High-pressure rinse", "Soap application", "Hand or automated drying"],
    price: "PKR 2,000",
  },
  {
    id: '2',
    title: "Interior Cleaning",
    time: "30-45 mins",
    description: "Deep cleaning of the car's interior, focusing on removing dust, dirt, and stains.",
    details: ["Vacuuming (seats, carpets, mats)", "Dashboard cleaning", "Air freshener"],
    price: "PKR 3,000",
  },
  {
    id: '3',
    title: "Full-Service Wash",
    time: "60-90 mins",
    description: "Combination of exterior wash and interior cleaning for a complete car wash.",
    details: ["Exterior and interior cleaning", "Spotless finish inspection"],
    price: "PKR 5,000",
  },
  {
    id: '4',
    title: "Wax & Polish",
    time: "45-60 mins",
    description: "Protects the car's paint and gives it a glossy shine.",
    details: ["Hand-applied wax", "Polishing for minor scratches"],
    price: "PKR 4,500",
  },
  {
    id: '5',
    title: "Engine Cleaning",
    time: "30-40 mins",
    description: "Focuses on cleaning the engine compartment, which often gets overlooked.",
    details: ["Degreasing", "Engine compartment cleaning"],
    price: "PKR 4,000",
  },
  {
    id: '6',
    title: "Tire Detailing",
    time: "20-30 mins",
    description: "Cleans and restores the shine to tires and wheels.",
    details: ["Tire dressing", "Brake dust removal"],
    price: "PKR 2,500",
  },
];

const ServiceCard = ({ title, time, description, details, price, onSelect }) => {
  return (
    <View style={styles.serviceContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.serviceTitle}>{title}</Text>
        <Text style={styles.serviceTime}>{time}</Text>
      </View>
      <Text style={styles.serviceDescription}>{description}</Text>
      <View style={styles.detailsContainer}>
        <View style={styles.detailsList}>
          <Text style={styles.detailsHeader}>Details:</Text>
          {details.map((detail, index) => (
            <Text key={index} style={styles.detailItem}>
              • {detail}
            </Text>
          ))}
        </View>
        <Text style={styles.priceText}>{price}</Text>
      </View>
      <TouchableOpacity style={styles.selectButton} onPress={onSelect}>
        <Text style={styles.buttonText}>Select Service</Text>
      </TouchableOpacity>
    </View>
  );
};

const CarWashServices = ({ navigation }) => {
  const handleServiceSelect = (service) => {
    navigation.navigate('BookingScreen', { serviceTitle: service.title, servicePrice: service.price });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerText}>Services We Provide</Text>
      {servicesData.map((service) => (
        <ServiceCard
          key={service.id}
          {...service}
          onSelect={() => handleServiceSelect(service)}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9',
    margin: 15,
    padding: 15,
  },
  headerText: {
    marginTop:25,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#05293F',
    textAlign: 'center',
    marginBottom: 15,
  },
  serviceContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3993C4',
  },
  serviceTime: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#34495E',
    marginBottom: 10,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  detailsList: {
    flex: 1,
  },
  detailsHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3993C4',
    marginBottom: 5,
  },
  detailItem: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27AE60',
    alignSelf: 'center',
    marginLeft: 10,
  },
  selectButton: {
    backgroundColor: '#3993C4',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default CarWashServices;