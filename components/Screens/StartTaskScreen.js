import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ENV from '../../env';

const StartTaskScreen = ({ route, navigation }) => {
  const { task, employeeId, employeeToken } = route.params;
  const [isTaskStarted, setIsTaskStarted] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const handleStartTask = async () => {
    try {
      const response = await fetch(`${ENV.API_BASE_URL}/api/bookings/start-task`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${employeeToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: task._id,
          employeeId: employeeId
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setIsTaskStarted(true);
        Alert.alert('Success', 'Task has been started successfully!');
      } else {
        Alert.alert('Error', data.message || 'Failed to start task');
      }
    } catch (error) {
      console.error('Error starting task:', error);
      Alert.alert('Error', 'Failed to start task. Please try again.');
    }
  };

  const handleCompleteTask = async () => {
    try {
      setIsCompleting(true);
      
      // Use the assignedEmployee ID from the task if employeeId is not provided
      const actualEmployeeId = employeeId || task.assignedEmployee;
      
      console.log('Completing task with data:', {
        bookingId: task._id,
        employeeId: actualEmployeeId,
        taskDetails: task
      });

      if (!actualEmployeeId) {
        throw new Error('Employee ID not found. Please try logging in again.');
      }

      const response = await fetch(`${ENV.API_BASE_URL}/api/bookings/complete-task`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${employeeToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: task._id,
          employeeId: actualEmployeeId
        }),
      });

      const data = await response.json();
      console.log('Complete task response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to complete task');
      }

      Alert.alert(
        'Success',
        'Task marked as completed successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to EmployeeHomeScreen and refresh the tasks
              navigation.navigate('EmployeeHomeScreen', {
                employeeName: task.assignedEmployee?.name,
                employeeId: actualEmployeeId,
                employeeToken,
                refreshTasks: true // Add this flag to trigger refresh
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error completing task:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to complete task. Please try again.'
      );
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Illustration */}
      <View style={styles.illustrationContainer}>
        <Image
          source={require('../../assets/task.png')}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>

      {/* Task Card */}
      <View style={styles.taskCard}>
        <Text style={styles.taskTitle}>Task No. 1</Text>
        <Text style={styles.detailsLabel}>Details:</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{task.user?.name || 'N/A'}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.value}>{task.address}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.label}>Vehicle:</Text>
          <Text style={styles.value}>{task.vehicle} {task.vehicleModel}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Service:</Text>
          <Text style={styles.value}>{task.service}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Status:</Text>
          <Text style={styles.value}>In Progress</Text>
        </View>

        <TouchableOpacity 
          style={[styles.completedButton, isCompleting && styles.disabledButton]}
          onPress={handleCompleteTask}
          disabled={isCompleting}
        >
          {isCompleting ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={[styles.completedButtonText, styles.loadingText]}>
                Completing...
              </Text>
            </View>
          ) : (
            <Text style={styles.completedButtonText}>Completed</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        disabled={isCompleting}
      >
        <View style={styles.backButtonCircle}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3993C4',
  },
  illustrationContainer: {
    height: '40%',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  illustration: {
    width: '80%',
    height: '80%',
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  taskTitle: {
    fontSize: 22,
    color: '#3498DB',
    marginBottom: 8,
    textAlign: 'left',
  },
  detailsLabel: {
    fontSize: 18,
    color: '#3498DB',
    marginBottom: 15,
    textAlign: 'left',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    width: 70,
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  value: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
  completedButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#A5D6A7',
  },
  completedButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: 8,
  },
  backButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
  backButtonCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default StartTaskScreen; 