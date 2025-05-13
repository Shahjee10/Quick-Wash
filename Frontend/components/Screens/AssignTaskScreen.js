import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ENV from '../../env';

const AssignTaskScreen = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Bookings from Backend
  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'User token not found. Please log in again.');
        return;
      }

      const response = await fetch(`${ENV.API_BASE_URL}/api/bookings/provider-accepted-bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response Error:', errorText);
        Alert.alert('Error', `Failed to fetch bookings: ${errorText}`);
        return;
      }

      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      Alert.alert('Error', 'Failed to fetch bookings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Employees from Backend
  const fetchEmployees = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${ENV.API_BASE_URL}/api/employees/provider-employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setEmployees(data.employees || []);
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch employees.');
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      Alert.alert('Error', 'Unable to fetch employees.');
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchEmployees();
  }, []);

  const handleAssignTask = (booking) => {
    setSelectedBooking(booking);
    setModalVisible(true);
  };

  const confirmAssignTask = async (employeeId, employeeName) => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${ENV.API_BASE_URL}/api/bookings/assign-task`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId: selectedBooking._id, employeeId }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert(
          'Success',
          `Task for "${selectedBooking?.service}" has been successfully assigned to "${employeeName}".`,
          [{ text: 'OK', onPress: () => setModalVisible(false) }]
        );
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking._id === selectedBooking._id
              ? { ...booking, assignedEmployee: { _id: employeeId, name: employeeName } }
              : booking
          )
        );
      } else {
        Alert.alert('Error', data.message || 'Failed to assign task.');
      }
    } catch (error) {
      console.error('Error assigning task:', error);
      Alert.alert('Error', 'Failed to assign task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display (e.g., "April 27, 2025")
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderBooking = ({ item }) => (
    <View style={styles.bookingCard}>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.serviceText}>{item.service}</Text>
          <Text style={styles.priceText}>${item.price}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={16} color="#6B7280" />
          <Text style={styles.detailText}>Customer: {item.user.name}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="mail-outline" size={16} color="#6B7280" />
          <Text style={styles.detailText}>Email: {item.user.email}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#6B7280" />
          <Text style={styles.detailText}>Address: {item.address}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="car-outline" size={16} color="#6B7280" />
          <Text style={styles.detailText}>Vehicle: {item.vehicle} ({item.vehicleModel})</Text>
        </View>
        {item.preferences && (
          <View style={styles.detailRow}>
            <Ionicons name="document-text-outline" size={16} color="#6B7280" />
            <Text style={styles.detailText}>Preferences: {item.preferences}</Text>
          </View>
        )}
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#6B7280" />
          <Text style={styles.detailText}>Created: {formatDate(item.createdAt)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="checkmark-circle-outline" size={16} color={item.assignedEmployee ? '#10B981' : '#EF4444'} />
          <Text style={styles.detailText}>
            Assigned: {item.assignedEmployee ? `Yes (To: ${item.assignedEmployee.name})` : 'No'}
          </Text>
        </View>
      </View>
      {!item.assignedEmployee && (
        <TouchableOpacity
          style={styles.assignButton}
          onPress={() => handleAssignTask(item)}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <Feather name="user-check" size={18} color="#fff" />
          <Text style={styles.buttonText}>Assign Task</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderEmployee = ({ item }) => (
    <TouchableOpacity
      style={styles.employeeCard}
      onPress={() => confirmAssignTask(item._id, item.name)}
      disabled={isLoading}
      activeOpacity={0.8}
    >
      <View style={styles.employeeCardContent}>
        <View style={styles.employeeAvatar}>
          <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.employeeInfo}>
          <Text style={styles.employeeName}>{item.name}</Text>
          <Text style={styles.employeeDetail}>CNIC: {item.cnic}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#6B7280" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A3C5A" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assign Tasks</Text>
      </View>

      {/* Loading State */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      )}

      {/* Empty State */}
      {!isLoading && bookings.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="folder-open-outline" size={40} color="#6B7280" />
          <Text style={styles.emptyText}>No accepted bookings found.</Text>
        </View>
      )}

      {/* Bookings List */}
      {!isLoading && bookings.length > 0 && (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={renderBooking}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Assign Task Modal */}
      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Assign Task</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                disabled={isLoading}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              Assign <Text style={styles.highlightText}>{selectedBooking?.service}</Text> to an employee:
            </Text>
            {employees.length === 0 ? (
              <View style={styles.emptyModalState}>
                <Ionicons name="people-outline" size={40} color="#6B7280" />
                <Text style={styles.emptyModalText}>No employees available.</Text>
              </View>
            ) : (
              <FlatList
                data={employees}
                keyExtractor={(item) => item._id.toString()}
                renderItem={renderEmployee}
                contentContainerStyle={styles.employeeList}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1A3C5A',
  },
  backButton: {
    marginTop: 30,
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    marginTop: 30,
    flex: 1,
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  cardContent: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3993C4',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    flexShrink: 1, // Ensure text wraps if too long
  },
  assignButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  closeButton: {
    padding: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  highlightText: {
    fontWeight: '600',
    color: '#3993C4',
  },
  employeeList: {
    paddingBottom: 16,
  },
  employeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  employeeCardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  employeeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3993C4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  employeeDetail: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyModalState: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyModalText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
  },
});

export default AssignTaskScreen;