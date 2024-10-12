import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Animated } from 'react-native';
import Button from '../Buttons/Button';
import { Ionicons } from '@expo/vector-icons';

const SignUpScreen = ({ navigation }) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));

  // Animation effect when the component mounts
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.pop()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="#fff" />
      </TouchableOpacity>

      {/* User Icon */}
      <Animated.View style={{ ...styles.logoContainer, opacity: fadeAnim }}>
        <Ionicons name="person-circle-outline" size={80} color="#fff" />
      </Animated.View>

      {/* Create Account Text */}
      <Text style={styles.createAccountText}>Create an Account</Text>

      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Username Input */}
        <TextInput
          placeholder="Username"
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholderTextColor="#aaa"
        />

        {/* Email Input */}
        <TextInput
          placeholder="Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          placeholderTextColor="#aaa"
        />

        {/* Password Input */}
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Password"
            style={styles.input}
            secureTextEntry={!passwordVisible}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            textContentType="password"
            placeholderTextColor="#aaa"
          />
          {/* Toggle Password Visibility */}
          <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={styles.eyeIconContainer}>
            <Ionicons name={passwordVisible ? "eye-off" : "eye"} size={24} color="#aaa" />
          </TouchableOpacity>
        </View>

        {/* Confirm Password Input */}
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Confirm Password"
            style={styles.input}
            secureTextEntry={!confirmPasswordVisible}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            autoCapitalize="none"
            textContentType="password"
            placeholderTextColor="#aaa"
          />
          {/* Toggle Confirm Password Visibility */}
          <TouchableOpacity onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)} style={styles.eyeIconContainer}>
            <Ionicons name={confirmPasswordVisible ? "eye-off" : "eye"} size={24} color="#aaa" />
          </TouchableOpacity>
        </View>

        {/* Create Account Button */}
        <Button title="Create Account" onPress={() => navigation.replace('Login')} buttonStyle={styles.button} textStyle={styles.buttonText} />

        {/* Link to Login */}
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.signInContainer}>
          <Text style={styles.signInText}>Already have an account? Login</Text>
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
    backgroundColor: '#05293F', // Dark blue background
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1, // Ensures the button is on top
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  createAccountText: {
    color: 'white',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
    backgroundColor: '#ffffff', // White input background
    color: '#000', // Black text color inside the input fields
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
  button: {
    backgroundColor: '#007AFF', // Light blue button
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff', // White text for button
    fontSize: 18,
  },
  signInContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  signInText: {
    color: '#fff', // White text for links
    fontWeight: 'bold',
  },
});

export default SignUpScreen;