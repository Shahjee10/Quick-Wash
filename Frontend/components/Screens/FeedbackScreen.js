import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios'; // Ensure axios is installed
import ENV from '../../env'; // Import the environment variable

const FeedbackScreen = ({ navigation }) => {
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await axios.get(`${ENV.API_BASE_URL}/api/feedback`);
        setFeedbacks(response.data);
      } catch (error) {
        console.error('Error fetching feedbacks: ', error);
      }
    };

    fetchFeedbacks();
  }, []);

  const renderStars = (rating) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? "star" : "star-outline"}
            size={20}
            color={star <= rating ? "#FFD700" : "#CCCCCC"}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <View style={styles.backIconContainer}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      {/* Header Image */}
      <View style={styles.iconContainer}>
        <Image source={require('../../assets/feedback.png')} style={styles.headerIcon} />
      </View>

      {/* Title */}
      <Text style={styles.title}>Feedback</Text>

      {/* Feedback List */}
      <ScrollView contentContainerStyle={styles.scrollView}>
        {feedbacks.map((feedback) => (
          <View key={feedback._id} style={styles.card}>
            <View style={styles.feedbackHeader}>
              <Text style={styles.feedbackName}>{feedback.name}</Text>
              <Text style={styles.feedbackDate}>
                {new Date(feedback.createdAt).toLocaleDateString()}
              </Text>
            </View>
            {renderStars(feedback.stars)}
            <Text style={styles.feedbackComment}>{feedback.comment}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Leave Comment Button */}
      <TouchableOpacity 
        style={styles.leaveCommentButton}
        onPress={() => navigation.navigate('FeedbackSubmissionScreen')}
      >
        <Text style={styles.leaveCommentText}>Leave Comment</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  backIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#05293F',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIcon: {
    width: 100, // Adjust width as needed
    height: 100, // Adjust height as needed
  },
  title: {
    fontSize: 28,
    color: '#05293F',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollView: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#05293F',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  feedbackName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  feedbackDate: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  feedbackComment: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
  },
  leaveCommentButton: {
    backgroundColor: '#007BFF',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  leaveCommentText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default FeedbackScreen;
