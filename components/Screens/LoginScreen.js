import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Animated, ActivityIndicator } from 'react-native';
import Button from '../Buttons/Button';
import { Ionicons } from '@expo/vector-icons'; // Ensure this import is correct

const LoginScreen = ({ navigation }) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [loading, setLoading] = useState(false); // State to manage loading

  // Animation effect when the component mounts
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800, // Quicker fade-in effect
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleLogin = () => {
    setLoading(true); // Start loading
    setTimeout(() => {
      // Simulating network request
      setLoading(false); // Stop loading after 1 second
      navigation.replace('Home'); // Navigate to Home after login
    }, 1000); // Simulated delay for login
  };

  return (
    <View style={styles.container}>
      {/* Person Icon */}
      <View style={styles.iconContainer}>
        <Ionicons name="person-circle-outline" size={100} color="white" />
      </View>

      <Text style={styles.login}>Login</Text>

      <Animated.View style={{ opacity: fadeAnim }}>
        <TextInput 
          placeholder="Email" 
          style={styles.input} 
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress" // iOS feature for better autofill
        />
        <View style={styles.passwordContainer}>
          <TextInput 
            placeholder="Password" 
            style={styles.input} 
            secureTextEntry={!passwordVisible}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            textContentType="password" // iOS feature for better autofill
          />
          <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={styles.eyeIconContainer}>
            <Ionicons 
              name={passwordVisible ? "eye-off" : "eye"} 
              size={24} 
              color="#6200EE" 
            />
          </TouchableOpacity>
        </View>

        <Button title="Login" onPress={handleLogin} />

        {loading && (
          <ActivityIndicator size="small" color="#6200EE" style={styles.loadingIndicator} />
        )}

        <TouchableOpacity onPress={() => navigation.navigate('SignUp')} style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#05293F', // Light background color
  },

  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30, // Adjust space between icon and other elements
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
    backgroundColor: '#ffffff', // White input background
    elevation: 2, // Shadow for depth
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeIconContainer: {
    position: 'absolute',
    right: 15,
    top: 12,
    padding: 5, // Adding padding for better touch area
  },
  signUpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  signUpText: {
    color: '#6200EE',
    fontWeight: 'bold',
  },
  loadingIndicator: {
    marginTop: 10,
    alignItems: 'center',
  },
  login: {
    color: 'white', // White text color
    fontSize: 24, // Font size of 24
    textAlign: 'center', // Center the text
    marginBottom: 40, // Margin for spacing
  },
});

export default LoginScreen;