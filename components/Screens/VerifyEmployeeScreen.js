import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import ENV from '../../env';

const VerifyEmployeeScreen = ({ navigation }) => {
  const [pendingEmployees, setPendingEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPendingEmployees();
  }, []);

  const fetchPendingEmployees = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${ENV.API_BASE_URL}/api/employees/unverified`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setPendingEmployees(data.unverifiedEmployees || []);
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch unverified employees.');
      }
    } catch (error) {
      console.error('Error fetching unverified employees:', error);
      Alert.alert('Error', 'Unable to fetch unverified employees.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPendingEmployees();
    setRefreshing(false);
  };

  const confirmAction = (action, employeeId) => {
    Alert.alert(
      `Confirm ${action}`,
      `Are you sure you want to ${action.toLowerCase()} this employee?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action,
          onPress: () => (action === 'Accept' ? handleAccept(employeeId) : handleReject(employeeId)),
        },
      ]
    );
  };

  const handleAccept = async (employeeId) => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${ENV.API_BASE_URL}/api/employees/verify`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeId, action: 'accept' }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', data.message || 'Employee verified and added to Employee table.');
        setPendingEmployees((prev) => prev.filter((emp) => emp._id !== employeeId));
      } else {
        Alert.alert('Error', data.message || 'Verification failed.');
      }
    } catch (error) {
      console.error('Error verifying employee:', error);
      Alert.alert('Error', 'Unable to verify employee.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (employeeId) => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${ENV.API_BASE_URL}/api/employees/verify`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeId, action: 'reject' }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', data.message || 'Employee rejected.');
        setPendingEmployees((prev) => prev.filter((emp) => emp._id !== employeeId));
      } else {
        Alert.alert('Error', data.message || 'Rejection failed.');
      }
    } catch (error) {
      console.error('Error rejecting employee:', error);
      Alert.alert('Error', 'Unable to reject employee.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmployeeCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.profileImage}
        />
        <View style={styles.employeeInfo}>
          <Text style={styles.name}>{item.name}</Text>
          <View style={styles.detailsContainer}>
            <Text style={styles.detail}>
              CNIC: <Text style={styles.detailValue}>{item.cnic}</Text>
            </Text>
            <Text style={styles.detail}>
              Referral: <Text style={styles.detailValue}>{item.referralCode}</Text>
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => confirmAction('Accept', item._id)}
          activeOpacity={0.7}
          disabled={isLoading}
        >
          <Ionicons name="checkmark" size={20} color="#fff" />
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={() => confirmAction('Reject', item._id)}
          activeOpacity={0.7}
          disabled={isLoading}
        >
          <Ionicons name="close" size={20} color="#fff" />
          <Text style={styles.buttonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A3C5A" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Pending Verifications</Text>
      </View>

      {/* Loading State */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      )}

      {/* Empty State */}
      {!isLoading && pendingEmployees.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No pending verifications.</Text>
        </View>
      )}

      {/* Employee List */}
      {!isLoading && pendingEmployees.length > 0 && (
        <FlatList
          data={pendingEmployees}
          keyExtractor={(item) => item._id.toString()}
          renderItem={renderEmployeeCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#10B981"
            />
          }
        />
      )}
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
    marginTop: 40,
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    marginTop: 40,
    flex: 1,
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
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
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'visible',
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#E8ECEF',
    backgroundColor: '#E8ECEF',
  },
  employeeInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  detailsContainer: {
    gap: 4,
  },
  detail: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontWeight: '500',
    color: '#1A1A1A',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  acceptButton: {
    flex: 1,
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
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#EF4444',
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
});

export default VerifyEmployeeScreen;