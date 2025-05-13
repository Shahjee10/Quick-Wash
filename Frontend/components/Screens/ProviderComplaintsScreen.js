import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ENV from '../../env';

const { width } = Dimensions.get('window');

const ProviderComplaintsScreen = ({ navigation }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  const fetchComplaints = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'User token not found. Please log in again.');
        return;
      }

      const response = await fetch(`${ENV.API_BASE_URL}/api/complaints/provider`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response Error:', errorText);
        Alert.alert('Error', `Failed to fetch complaints: ${errorText}`);
        return;
      }

      const data = await response.json();
      setComplaints(data || []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      Alert.alert('Error', 'Failed to fetch complaints. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchComplaints();
  };

  const handleStatusUpdate = async (complaintId, newStatus) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${ENV.API_BASE_URL}/api/complaints/${complaintId}/status`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        Alert.alert('Success', `Complaint marked as ${newStatus}`);
        fetchComplaints();
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to update complaint status');
      }
    } catch (error) {
      console.error('Error updating complaint status:', error);
      Alert.alert('Error', 'Failed to update complaint status. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return '#FFA500';
      case 'In Progress':
        return '#3498DB';
      case 'Resolved':
        return '#2ECC71';
      case 'Rejected':
        return '#E74C3C';
      default:
        return '#95A5A6';
    }
  };

  const filterComplaints = (complaints) => {
    if (activeFilter === 'All') return complaints;
    return complaints.filter(complaint => complaint.status === activeFilter);
  };

  const FilterButton = ({ title, isActive, onPress }) => (
    <TouchableOpacity
      style={[styles.filterButton, isActive && styles.filterButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderComplaint = ({ item }) => (
    <View style={styles.complaintCard}>
      <View style={styles.complaintHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.complaintTitle}>{item.title}</Text>
          <Text style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
        <Text style={styles.dateText}>
          {new Date(item.dateOfService).toLocaleDateString()}
        </Text>
      </View>
      
      <Text style={styles.complaintDescription}>{item.description}</Text>
      
      <View style={styles.complaintFooter}>
        <View style={styles.actionButtons}>
          {item.status === 'Pending' && (
            <>
              <TouchableOpacity
                style={[styles.statusButton, styles.acceptButton]}
                onPress={() => handleStatusUpdate(item._id, 'In Progress')}
              >
                <Ionicons name="play" size={18} color="#fff" />
                <Text style={styles.buttonText}>Start Progress</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.statusButton, styles.rejectButton]}
                onPress={() => handleStatusUpdate(item._id, 'Rejected')}
              >
                <Ionicons name="close" size={18} color="#fff" />
                <Text style={styles.buttonText}>Reject</Text>
              </TouchableOpacity>
            </>
          )}
          {item.status === 'In Progress' && (
            <TouchableOpacity
              style={[styles.statusButton, styles.resolveButton]}
              onPress={() => handleStatusUpdate(item._id, 'Resolved')}
            >
              <Ionicons name="checkmark" size={18} color="#fff" />
              <Text style={styles.buttonText}>Mark Resolved</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498DB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customer Complaints</Text>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <FilterButton
            title="All"
            isActive={activeFilter === 'All'}
            onPress={() => setActiveFilter('All')}
          />
          <FilterButton
            title="Pending"
            isActive={activeFilter === 'Pending'}
            onPress={() => setActiveFilter('Pending')}
          />
          <FilterButton
            title="In Progress"
            isActive={activeFilter === 'In Progress'}
            onPress={() => setActiveFilter('In Progress')}
          />
          <FilterButton
            title="Resolved"
            isActive={activeFilter === 'Resolved'}
            onPress={() => setActiveFilter('Resolved')}
          />
          <FilterButton
            title="Rejected"
            isActive={activeFilter === 'Rejected'}
            onPress={() => setActiveFilter('Rejected')}
          />
        </ScrollView>
      </View>

      <FlatList
        data={filterComplaints(complaints)}
        renderItem={renderComplaint}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3498DB']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#95A5A6" />
            <Text style={styles.emptyText}>No complaints found</Text>
            <Text style={styles.emptySubtext}>
              {activeFilter === 'All' 
                ? 'You have no complaints to handle at the moment'
                : `No ${activeFilter.toLowerCase()} complaints available`}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#0A2E47',
    elevation: 2,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    
  },
  headerTitle: {
    marginTop: 20,
    fontSize: 25,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  filterContainer: {
    backgroundColor: '#0A2E47',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a3f5c',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  filterButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#0A2E47',
  },
  listContainer: {
    padding: 16,
  },
  complaintCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  complaintHeader: {
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  complaintTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A2E47',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    marginLeft: 8,
    color: '#FFFFFF',
  },
  dateText: {
    fontSize: 14,
    color: '#95A5A6',
  },
  complaintDescription: {
    fontSize: 16,
    color: '#34495E',
    lineHeight: 24,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  acceptButton: {
    backgroundColor: '#0A2E47',
  },
  rejectButton: {
    backgroundColor: '#E74C3C',
  },
  resolveButton: {
    backgroundColor: '#2ECC71',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A2E47',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#95A5A6',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default ProviderComplaintsScreen; 