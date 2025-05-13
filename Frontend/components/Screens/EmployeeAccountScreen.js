import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ENV from '../../env';

const EmployeeAccountScreen = ({ route, navigation }) => {
  const { employeeToken, employeeId } = route.params;
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [employeeData, setEmployeeData] = useState({
    name: '',
    cnic: '',
    referralCode: '',
  });
  const [editedData, setEditedData] = useState({});

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeData();
    } else {
      Alert.alert('Error', 'Employee ID is missing');
      setLoading(false);
    }
  }, [employeeId]);

  const fetchEmployeeData = async () => {
    try {
      if (!employeeId) {
        throw new Error('Employee ID is required');
      }

      const response = await fetch(`${ENV.API_BASE_URL}/api/employees/profile/${employeeId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${employeeToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setEmployeeData(data.employee);
        setEditedData(data.employee);
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch employee data');
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
      Alert.alert('Error', 'Something went wrong while fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData({ ...employeeData });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${ENV.API_BASE_URL}/api/employees/profile/${employeeId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${employeeToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedData),
      });

      const data = await response.json();
      if (data.success) {
        setEmployeeData(editedData);
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        Alert.alert('Error', data.message || 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(employeeData);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498DB" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="account-circle" size={80} color="#3498DB" />
        <Text style={styles.headerText}>Employee Profile</Text>
      </View>

      <View style={styles.content}>
        {isEditing ? (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={editedData.name}
                onChangeText={(text) => setEditedData({ ...editedData, name: text })}
                placeholder="Enter your name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>CNIC</Text>
              <TextInput
                style={styles.input}
                value={editedData.cnic}
                onChangeText={(text) => setEditedData({ ...editedData, cnic: text })}
                placeholder="Enter your CNIC"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.buttonGroup}>
              <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
                <Text style={styles.buttonText}>Save Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={styles.infoGroup}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>{employeeData.name}</Text>
            </View>

            <View style={styles.infoGroup}>
              <Text style={styles.label}>CNIC</Text>
              <Text style={styles.value}>{employeeData.cnic}</Text>
            </View>

            <View style={styles.infoGroup}>
              <Text style={styles.label}>Referral Code</Text>
              <Text style={styles.value}>{employeeData.referralCode}</Text>
            </View>

            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <MaterialCommunityIcons name="pencil" size={20} color="#FFFFFF" />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3993C4',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3993C4',
  },
  header: {
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#002347',
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  content: {
    padding: 20,
  },
  infoGroup: {
    marginBottom: 20,
    backgroundColor: '#002347',
    padding: 15,
    borderRadius: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 5,
  },
  value: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#002347',
    color: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
  },
  editButton: {
    backgroundColor: '#003366',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#003366',
  },
  cancelButton: {
    backgroundColor: '#E74C3C',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EmployeeAccountScreen; 