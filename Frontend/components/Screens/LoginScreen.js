import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useForm, Controller } from 'react-hook-form';
import ENV from '../../env';

const ErrorNotification = ({ message, onClose }) => {
  return (
    <Animated.View style={styles.errorContainer}>
      <Ionicons name="alert-circle" size={20} color="#fff" style={styles.errorIcon} />
      <Text style={styles.errorText}>{message}</Text>
      <TouchableOpacity onPress={onClose} style={styles.errorCloseButton}>
        <Ionicons name="close" size={20} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const LoginScreen = ({ navigation }) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [role, setRole] = useState('customer'); // Default role
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [userName, setUserName] = useState('');

  const { control, handleSubmit, formState: { errors }, reset } = useForm();

  const handleLogin = async (data) => {
    try {
      let endpoint, payload;
  
      if (role === 'employee') {
        const { name, referralCode } = data;
        endpoint = `${ENV.API_BASE_URL}/api/employees/login`;
        payload = { name, referralCode };
      } else {
        const { email, password } = data;
        endpoint = `${ENV.API_BASE_URL}/api/auth/login`;
        payload = { email, password, role };
      }
  
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        await AsyncStorage.setItem('userToken', result.token);
        await AsyncStorage.setItem('userType', role);
  
        if (role === 'employee') {
          await AsyncStorage.setItem('employeeName', data.name);
          await AsyncStorage.setItem('userToken', result.token);
          navigation.navigate('EmployeeHomeScreen', { 
            employeeName: data.name,
            employeeId: result.employee.id,
            employeeToken: result.token
          });
        } else if (role === 'customer') {
          const customerName = result.customer?.name || 'Customer';
          await AsyncStorage.setItem('customerName', customerName);
          await AsyncStorage.setItem('userToken', result.token);
          navigation.navigate('Home', { customerName });
        } else if (role === 'provider') {
          const providerName = result.provider?.name || data.name || 'Provider';
          await AsyncStorage.setItem('providerName', providerName);
          await AsyncStorage.setItem('userToken', result.token);
          navigation.navigate('ProviderDashboard', { providerName });
        }

        console.log('Login result:', result);
      } else {
        setErrorMessage(result.message || 'Login failed');
        setShowError(true);
      }
    } catch (error) {
      console.error('Error during login:', error);
      setErrorMessage('Failed to connect to the server. Please try again later.');
      setShowError(true);
    }
  };
  
  

  const handleErrorClose = () => {
    setShowError(false);
    setErrorMessage('');
  };

  return (
    <View style={styles.container}>
      {/* Icon and Title */}
      <Ionicons name="person-circle-outline" size={80} color="white" style={styles.icon} />
      <Text style={styles.title}>Login</Text>

      {/* Role Picker */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Role</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={role}
            style={styles.picker}
            onValueChange={(itemValue) => {
              setRole(itemValue);
              reset(); // Reset form when role changes
            }}
            dropdownIconColor="#4A90E2"
          >
            <Picker.Item label="Customer" value="customer" />
            <Picker.Item label="Provider" value="provider" />
            <Picker.Item label="Employee" value="employee" />
          </Picker>
        </View>
      </View>

      {/* Input Fields */}
      <View style={styles.formContainer}>
        {role === 'employee' ? (
          <>
            {/* Name Field */}
            <Text style={styles.label}>NAME</Text>
            <Controller
              control={control}
              name="name"
              rules={{
                required: 'Name is required',
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  placeholder="Enter Name"
                  style={[styles.input, errors.name && styles.errorInput]}
                  onChangeText={onChange}
                  value={value}
                  autoCapitalize="words"
                  placeholderTextColor="#AAAAAA"
                />
              )}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}

            {/* Referral Code Field */}
            <Text style={styles.label}>REFERRAL CODE</Text>
            <Controller
              control={control}
              name="referralCode"
              rules={{
                required: 'Referral code is required',
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  placeholder="Enter Referral Code"
                  style={[styles.input, errors.referralCode && styles.errorInput]}
                  onChangeText={onChange}
                  value={value}
                  autoCapitalize="none"
                  placeholderTextColor="#AAAAAA"
                />
              )}
            />
            {errors.referralCode && <Text style={styles.errorText}>{errors.referralCode.message}</Text>}
          </>
        ) : (
          <>
            {/* Email Field */}
            <Text style={styles.label}>EMAIL</Text>
            <Controller
              control={control}
              name="email"
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email format',
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  placeholder="Enter Email"
                  style={[styles.input, errors.email && styles.errorInput]}
                  onChangeText={onChange}
                  value={value}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#AAAAAA"
                />
              )}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

            {/* Password Field */}
            <Text style={styles.label}>PASSWORD</Text>
            <Controller
              control={control}
              name="password"
              rules={{
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters long',
                },
              }}
              render={({ field: { onChange, value } }) => (
                <View style={styles.passwordContainer}>
                  <TextInput
                    placeholder="Enter Password"
                    style={[styles.passwordInput, errors.password && styles.errorInput]}
                    onChangeText={onChange}
                    value={value}
                    secureTextEntry={!passwordVisible}
                    autoCapitalize="none"
                    placeholderTextColor="#AAAAAA"
                  />
                  <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={styles.eyeIcon}>
                    <Ionicons name={passwordVisible ? 'eye-off' : 'eye'} size={24} color="#AAAAAA" />
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
          </>
        )}

        {/* Login Button */}
        <TouchableOpacity style={styles.loginButton} onPress={handleSubmit(handleLogin)}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>

      {/* Additional Links */}
      <View style={styles.linksContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('ServiceProviderRegistration')}>
          <Text style={styles.linkText}>Create an Account as Service Provider?</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('CustomerSignUpScreen')}>
          <Text style={styles.linkText}>Create an Account as Customer?</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('EmployeeSignup')}>
          <Text style={styles.linkText}>Create an Account as Employee?</Text>
        </TouchableOpacity>
        {role !== 'employee' && (
          <TouchableOpacity onPress={() => navigation.navigate('PasswordReset')}>
            <Text style={styles.linkText}>Forgot Password?</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Error Notification */}
      {showError && (
        <ErrorNotification message={errorMessage} onClose={handleErrorClose} />
      )}

      <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#0A2E47', marginBottom: 10, marginTop: 40 }}>
        Welcome, {userName} !
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A2E47',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 80,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 40,
  },
  formContainer: {
    width: '100%',
  },
  pickerContainer: {
    width: '100%',
    marginBottom: 20,
  },
  pickerWrapper: {
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  picker: {
    height: 50,
    color: '#333333',
    paddingHorizontal: 15,
  },
  label: {
    color: '#ffffff',
    marginBottom: 5,
    marginLeft: 5,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#333333',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333333',
  },
  eyeIcon: {
    padding: 5,
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linksContainer: {
    alignItems: 'center',
    marginTop: 5,
  },
  linkText: {
    color: '#4A90E2',
    fontSize: 16,
    marginVertical: 5,
  },
  errorContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#ff4d4f',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5,
  },
  errorIcon: {
    marginRight: 10,
  },
  errorText: {
    color: '#fff',
    flex: 1,
    fontSize: 14,
  },
  errorCloseButton: {
    padding: 5,
  },
  errorInput: {
    borderWidth: 1,
    borderColor: 'red',
  },
});

export default LoginScreen;