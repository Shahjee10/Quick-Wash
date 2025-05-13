import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Linking, Platform, Alert } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import ENV from '../../env';
import EmployeeAccountScreen from './EmployeeAccountScreen';

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const EmployeeHomeScreen = ({ route, navigation }) => {
  const { employeeName, employeeId, employeeToken } = route.params;
  const [activeTasks, setActiveTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks', 'account', 'feedback', 'history'
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, [employeeToken]);

  useEffect(() => {
    if (route.params?.refreshTasks) {
      setLoading(true);
      fetchTasks();
      navigation.setParams({ refreshTasks: false });
    }
  }, [route.params?.refreshTasks]);

  useEffect(() => {
    if (activeTab === 'feedback') {
      fetchFeedbacks();
    }
  }, [activeTab]);

  const fetchTasks = () => {
    // Fetch active (assigned) tasks
    fetch(`${ENV.API_BASE_URL}/api/bookings/employee-assigned-bookings`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${employeeToken}`,
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        if (data && data.bookings) {
          setActiveTasks(data.bookings);
        } else {
          setActiveTasks([]);
        }
      })
      .catch(error => {
        setError("Error fetching bookings: " + error.message);
        setActiveTasks([]);
      });

    // Fetch completed tasks
    fetch(`${ENV.API_BASE_URL}/api/bookings/employee-completed-tasks`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${employeeToken}`,
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        if (data && data.bookings) {
          setCompletedTasks(data.bookings);
        } else {
          setCompletedTasks([]);
        }
      })
      .catch(error => {
        setError("Error fetching completed tasks: " + error.message);
        setCompletedTasks([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchFeedbacks = async () => {
    setFeedbackLoading(true);
    setFeedbackError(null);
    try {
      const response = await fetch(`${ENV.API_BASE_URL}/api/feedback`);
      const data = await response.json();
      setFeedbacks(data);
    } catch (err) {
      setFeedbackError('Failed to load feedback');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleStartTask = (task) => {
    navigation.navigate('StartTaskScreen', {
      task,
      employeeId,
      employeeToken
    });
  };

  const handleViewMap = (address) => {
    const encodedAddress = encodeURIComponent(address);
    const scheme = Platform.select({
      ios: 'maps:',
      android: 'geo:'
    });
    const url = Platform.select({
      ios: `${scheme}?q=${encodedAddress}`,
      android: `${scheme}?q=${encodedAddress}&z=16`
    });

    Linking.openURL(url).catch(err => {
      console.error('Error opening map:', err);
      Alert.alert('Error', 'Could not open map. Please try again.');
    });
  };

  const renderTasksContent = () => {
    if (loading) {
      return (
        <View style={[styles.loadingContainer, { backgroundColor: '#3993C4' }]}> 
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={[styles.errorContainer, { backgroundColor: '#3993C4' }]}> 
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    return (
      <ScrollView style={[styles.taskList, { backgroundColor: '#3993C4' }]} showsVerticalScrollIndicator={false}>
        {activeTasks.length === 0 ? (
          <Text style={[styles.placeholderText, { textAlign: 'center', marginTop: 40 }]}>
            No tasks assigned yet.
          </Text>
        ) : (
          activeTasks.map((task, index) => (
            <View key={task._id} style={styles.taskCard}>
              <View style={styles.cardContent}>
                <View style={styles.taskTitleRow}>
                  <Text style={styles.taskTitle}>Task No. {index + 1}</Text>
                  <View style={styles.timeBox}>
                    <Text style={styles.timeText}>Time:{'\n'}{formatTime(task.createdAt)}</Text>
                  </View>
                </View>

                <Text style={styles.detailsTitle}>Details:</Text>

                <View style={styles.detailsSection}>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Name:</Text>
                    <Text style={styles.value}>{task.user?.name || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Address:</Text>
                    <Text style={styles.value}>{task.address}</Text>
                    <MaterialCommunityIcons name="map-marker" size={16} color="#FF0000" />
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Vehicle:</Text>
                    <Text style={styles.value}>{task.vehicle}, {task.vehicleModel}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Service:</Text>
                    <Text style={styles.value}>{task.service}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Status:</Text>
                    <Text style={[styles.value, styles.statusText, task.status === 'Completed' && styles.completedStatus]}>
                      {task.status === 'Accepted' ? 'ASSIGNED' : task.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleStartTask(task)}
                  >
                    <Text style={styles.buttonText}>Start Task</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleViewMap(task.address)}
                  >
                    <Text style={styles.buttonText}>View Map</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    );
  };

  const renderHistoryContent = () => {
    if (loading) {
      return (
        <View style={[styles.loadingContainer, { backgroundColor: '#3993C4' }]}> 
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={[styles.errorContainer, { backgroundColor: '#3993C4' }]}> 
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    return (
      <ScrollView style={[styles.taskList, { backgroundColor: '#3993C4' }]} showsVerticalScrollIndicator={false}>
        {completedTasks.map((task, index) => (
          <View key={task._id} style={styles.taskCard}>
            <View style={styles.cardContent}>
              <View style={styles.taskTitleRow}>
                <Text style={styles.taskTitle}>Task No. {index + 1}</Text>
                <View style={styles.timeBox}>
                  <Text style={styles.timeText}>Time:{'\n'}{formatTime(task.createdAt)}</Text>
                </View>
              </View>

              <Text style={styles.detailsTitle}>Details:</Text>

              <View style={styles.detailsSection}>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Name:</Text>
                  <Text style={styles.value}>{task.user?.name || 'N/A'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Address:</Text>
                  <Text style={styles.value}>{task.address}</Text>
                  <MaterialCommunityIcons name="map-marker" size={16} color="#FF0000" />
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Vehicle:</Text>
                  <Text style={styles.value}>{task.vehicle}, {task.vehicleModel}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Service:</Text>
                  <Text style={styles.value}>{task.service}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Status:</Text>
                  <Text style={[styles.value, styles.statusText, styles.completedStatus]}>
                    {task.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'tasks':
        return renderTasksContent();
      case 'account':
        return (
          <EmployeeAccountScreen 
            route={{ 
              params: { 
                employeeToken: employeeToken,
                employeeId: employeeId 
              } 
            }}
            navigation={navigation}
          />
        );
      case 'feedback':
        if (feedbackLoading) {
          return (
            <View style={[styles.placeholderContainer, { backgroundColor: '#3993C4' }]}>
              <Text style={styles.placeholderText}>Loading feedback...</Text>
            </View>
          );
        }
        if (feedbackError) {
          return (
            <View style={[styles.placeholderContainer, { backgroundColor: '#3993C4' }]}>
              <Text style={styles.placeholderText}>{feedbackError}</Text>
            </View>
          );
        }
        return (
          <ScrollView style={{ backgroundColor: '#3993C4', flex: 1 }}>
            {feedbacks.length === 0 ? (
              <Text style={[styles.placeholderText, { textAlign: 'center', marginTop: 20 }]}>No feedback yet.</Text>
            ) : (
              feedbacks.map((fb, idx) => (
                <View key={idx} style={{ backgroundColor: '#fff', margin: 10, borderRadius: 10, padding: 15 }}>
                  <Text style={{ fontWeight: 'bold', color: '#2176AE' }}>{fb.name}</Text>
                  <Text style={{ color: '#333', marginVertical: 5 }}>{fb.comment}</Text>
                  <Text style={{ color: '#FFD700' }}>{"★".repeat(fb.stars)}{"☆".repeat(5 - fb.stars)}</Text>
                  <Text style={{ color: '#aaa', fontSize: 12, marginTop: 5 }}>{new Date(fb.createdAt).toLocaleString()}</Text>
                </View>
              ))
            )}
          </ScrollView>
        );
      case 'history':
        return renderHistoryContent();
      default:
        return renderTasksContent();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeArabic}>خوش آمدید ! </Text>
        <Text style={styles.userName}>{employeeName}</Text>
      </View>

      {/* Main Content */}
      <View style={{ flex: 1 }}>{renderContent()}</View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'tasks' && styles.activeNavItem]} 
          onPress={() => setActiveTab('tasks')}
        >
          <MaterialCommunityIcons name="clipboard-list-outline" size={24} color={activeTab === 'tasks' ? '#3498DB' : '#FFF'} />
          <Text style={[styles.navText, activeTab === 'tasks' && styles.activeNavText]}>Tasks</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'account' && styles.activeNavItem]} 
          onPress={() => setActiveTab('account')}
        >
          <MaterialCommunityIcons name="account" size={24} color={activeTab === 'account' ? '#3498DB' : '#FFF'} />
          <Text style={[styles.navText, activeTab === 'account' && styles.activeNavText]}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'feedback' && styles.activeNavItem]} 
          onPress={() => setActiveTab('feedback')}
        >
          <MaterialCommunityIcons name="message-reply-text-outline" size={24} color={activeTab === 'feedback' ? '#3498DB' : '#FFF'} />
          <Text style={[styles.navText, activeTab === 'feedback' && styles.activeNavText]}>Feedback</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'history' && styles.activeNavItem]} 
          onPress={() => setActiveTab('history')}
        >
          <MaterialCommunityIcons name="clock-outline" size={24} color={activeTab === 'history' ? '#3498DB' : '#FFF'} />
          <Text style={[styles.navText, activeTab === 'history' && styles.activeNavText]}>History</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05293F',
  },
  header: {
    backgroundColor: '#002347',
    paddingTop: 30,
    paddingBottom: 10,
    paddingHorizontal: 20,
    alignItems: 'flex-start',
  },
  welcomeArabic: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
    alignSelf: 'flex-end',
    width: '100%',
    textAlign: 'right',
    top: 10,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 2,
    marginLeft: 0,
    alignSelf: 'flex-start',
  },
  taskList: {
    flex: 1,
    padding: 10,
  },
  taskCard: {
    backgroundColor: '#E6F0FA',
    borderRadius: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 0,
  },
  cardContent: {
    padding: 16,
  },
  taskTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  taskTitle: {
    color: '#2176AE',
    fontSize: 20,
    fontWeight: 'bold',
  },
  timeBox: {
    backgroundColor: '#002347',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  detailsTitle: {
    color: '#2176AE',
    fontSize: 16,
    marginTop: 5,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  detailsSection: {
    gap: 6,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  label: {
    width: 70,
    color: '#003366',
    fontSize: 14,
    fontWeight: 'bold',
  },
  value: {
    flex: 1,
    color: '#003366',
    fontSize: 14,
    fontWeight: '500',
  },
  statusText: {
    fontWeight: 'bold',
    color: '#2176AE',
  },
  completedStatus: {
    color: '#10B981',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#2176AE',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#002347',
    paddingVertical: 10,
    paddingHorizontal: 0,
    justifyContent: 'space-around',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 4,
    fontWeight: 'bold',
  },
  activeNavItem: {
    borderTopWidth: 3,
    borderTopColor: '#2176AE',
    backgroundColor: '#E6F0FA',
    borderRadius: 10,
  },
  activeNavText: {
    color: '#2176AE',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#003366',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#003366',
    padding: 20,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    textAlign: 'center',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3993C4',
  },
  placeholderText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
});

export default EmployeeHomeScreen;
