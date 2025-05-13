import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Dimensions } from 'react-native';
import ENV from '../../env'; // Import environment variables

const { width, height } = Dimensions.get('window');

const EmailVerificationPage = ({ route, navigation }) => {
    const { email } = route.params; // Get email from route params
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']); // Array for each digit

    const handleInputChange = (value, index) => {
        const newCode = [...verificationCode];
        newCode[index] = value;

        // Move to the next box automatically if input is valid
        if (value.length === 1 && index < verificationCode.length - 1) {
            const nextInput = `input-${index + 1}`;
            this[nextInput]?.focus();
        }

        setVerificationCode(newCode);
    };

    const handleVerifyEmail = async () => {
        const code = verificationCode.join(''); // Combine the code
        if (code.length !== 6) {
            Alert.alert('Error', 'Please enter the complete verification code');
            return;
        }

        try {
            // Send the verification code to the backend
            const response = await fetch(`${ENV.API_BASE_URL}/api/auth/verify-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, verificationCode: code }),
            });

            const result = await response.json();

            if (response.ok) {
                Alert.alert('Success', 'Email verified successfully. You can now log in.');
                navigation.navigate('Login'); // Navigate to login screen
            } else {
                Alert.alert('Error', result.message || 'Invalid verification code');
            }
        } catch (error) {
            console.error('Error during email verification:', error);
            Alert.alert('Error', 'Failed to connect to the server. Please try again later.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Email Verification</Text>
            <Text style={styles.description}>
                A verification code has been sent to your email. Enter the code below to verify your email.
            </Text>

            {/* Verification Code Boxes */}
            <View style={styles.inputContainer}>
                {verificationCode.map((value, index) => (
                    <TextInput
                        key={index}
                        ref={(ref) => (this[`input-${index}`] = ref)}
                        style={styles.inputBox}
                        keyboardType="number-pad"
                        maxLength={1}
                        value={value}
                        onChangeText={(text) => handleInputChange(text, index)}
                    />
                ))}
            </View>

            {/* Verify Button */}
            <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyEmail}>
                <Text style={styles.verifyButtonText}>Verify</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#0A2E47',
    },
    title: {
        fontSize: height * 0.03,
        color: '#ffffff',
        fontWeight: 'bold',
        marginBottom: height * 0.02,
    },
    description: {
        fontSize: height * 0.02,
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: height * 0.03,
    },
    inputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: height * 0.03,
        width: '80%',
    },
    inputBox: {
        width: width * 0.12,
        height: width * 0.12,
        backgroundColor: '#F2F2F2',
        borderRadius: 8,
        textAlign: 'center',
        fontSize: height * 0.03,
        color: '#333333',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    verifyButton: {
        width: '80%',
        height: height * 0.065,
        backgroundColor: '#4A90E2',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: height * 0.02,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    verifyButtonText: {
        color: '#ffffff',
        fontSize: height * 0.022,
        fontWeight: 'bold',
    },
});

export default EmailVerificationPage;
