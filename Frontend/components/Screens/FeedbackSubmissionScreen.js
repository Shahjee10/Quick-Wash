import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import ENV from '../../env';

const FeedbackSubmissionScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [feedback, setFeedback] = useState('');
  const [stars, setStars] = useState(0);

  const handleSubmitFeedback = async () => {
    if (!name.trim() || !feedback.trim() || stars === 0) {
      alert('Please enter your name, feedback, and select a star rating.');
      return;
    }
    try {
      await axios.post(`${ENV.API_BASE_URL}/api/feedback`, {
        name,
        comment: feedback,
        stars
      });
      alert('Feedback submitted successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setStars(star)}
            style={styles.starButton}
          >
            <Ionicons
              name={star <= stars ? "star" : "star-outline"}
              size={40}
              color={star <= stars ? "#FFD700" : "#CCCCCC"}
            />
          </TouchableOpacity>
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

      {/* Title */}
      <Text style={styles.title}>Submit Feedback</Text>

      {/* Name Field */}
      <TextInput
        style={styles.input}
        placeholder="Your Name"
        value={name}
        onChangeText={setName}
      />
      {/* Feedback Field */}
      <TextInput
        style={[styles.input, styles.feedbackInput]}
        placeholder="Enter your feedback here..."
        value={feedback}
        onChangeText={setFeedback}
        multiline
      />
      {/* Star Rating */}
      <Text style={styles.starLabel}>Rate your experience:</Text>
      {renderStars()}
      
      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmitFeedback}>
        <Text style={styles.submitButtonText}>Submit Feedback</Text>
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
  title: {
    fontSize: 28,
    color: '#05293F',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    height: 50,
  },
  feedbackInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  starLabel: {
    fontSize: 18,
    color: '#05293F',
    marginBottom: 10,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  starButton: {
    padding: 5,
  },
  submitButton: {
    backgroundColor: '#007BFF',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default FeedbackSubmissionScreen;
