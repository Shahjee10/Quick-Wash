// // DashboardScreen.js
// import React from 'react';
// import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
// import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
// import { Ionicons } from '@expo/vector-icons';

// const CustomerDashboard = ({ navigation }) => {
//   return (
//     <View style={styles.container}>
//       {/* Map View */}
//       <MapView
//         provider={PROVIDER_GOOGLE} // Use Google Maps if available
//         style={styles.map}
//         initialRegion={{
//           latitude: 42.3601, // Example coordinates (replace with dynamic data if needed)
//           longitude: -71.0589,
//           latitudeDelta: 0.01,
//           longitudeDelta: 0.01,
//         }}
//       />
      
//       {/* Hamburger Menu */}
//       <TouchableOpacity style={styles.menuButton} onPress={() => navigation.openDrawer()}>
//         <Ionicons name="menu" size={30} color="#fff" />
//       </TouchableOpacity>
      
//       {/* Bottom Navigation */}
//       <View style={styles.bottomNav}>
//         <TouchableOpacity style={styles.navItem}>
//           <Ionicons name="car-outline" size={24} color="#fff" />
//           <Text style={styles.navText}>Book Now</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.navItem}>
//           <Ionicons name="location-outline" size={24} color="#fff" />
//           <Text style={styles.navText}>Track</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.navItem}>
//           <Ionicons name="pricetags-outline" size={24} color="#fff" />
//           <Text style={styles.navText}>Discounts</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.navItem}>
//           <Ionicons name="chatbubbles-outline" size={24} color="#fff" />
//           <Text style={styles.navText}>Messages</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   map: {
//     flex: 1,
//   },
//   menuButton: {
//     position: 'absolute',
//     top: 40,
//     left: 20,
//     backgroundColor: '#003366',
//     padding: 10,
//     borderRadius: 5,
//     zIndex: 10,
//   },
//   bottomNav: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     alignItems: 'center',
//     backgroundColor: '#003366',
//     height: 80,
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     paddingHorizontal: 10,
//   },
//   navItem: {
//     alignItems: 'center',
//   },
//   navText: {
//     color: '#fff',
//     fontSize: 12,
//     marginTop: 5,
//   },
// });

// export default CustomerDashboard;
