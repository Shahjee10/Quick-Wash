import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from './components/Screens/SplashScreen';
import OnBoardingScreen from './components/Screens/OnBoardingScreen';
import LoginScreen from './components/Screens/LoginScreen';
import CustomerSignUpScreen from './components/Screens/CustomerSignUpScreen';
import Home from './components/Screens/Home';
import ForgetPassword from './components/Screens/ForgetPassword';
import ServiceProviderRegistration from './components/Screens/ServiceProviderRegistration';
import MyBookingsScreen from './components/Screens/MyBookingsScreen';
import AccountScreen from './components/Screens/AccountScreen';
import TermsConditionsScreen from './components/Screens/TermsConditionsScreen';
import ContactUsScreen from './components/Screens/ContactUsScreen';
import FeedbackScreen from './components/Screens/FeedbackScreen';
import FeedbackSubmissionScreen from './components/Screens/FeedbackSubmissionScreen';
import ServicesScreen from './components/Screens/ServicesScreen';
import ComplaintScreen from './components/Screens/ComplaintScreen';
import PrivacyPolicyScreen from './components/Screens/PrivacyPolicyScreen';
import EmailVerificationPage from './components/Screens/EmailVerificationPage';
import EmailVerificationProvider from './components/Screens/EmailVerificationProvider';
import ProviderDashboard from './components/Screens/ProviderDashboard';
import BookingScreen from './components/Screens/BookingScreen';
import CustomerBookingScreen from './components/Screens/CustomerBookingScreen';
import AssignTaskScreen from './components/Screens/AssignTaskScreen';
import EmployeeHomeScreen from './components/Screens/EmployeeHomeScreen';
import EmployeeSignup from './components/Screens/EmployeeSignup';
import ReferralCodeScreen from './components/Screens/ReferalCode';
import VerifyEmployeeScreen from './components/Screens/VerifyEmployeeScreen';
import ProviderComplaintsScreen from './components/Screens/ProviderComplaintsScreen';
import StartTaskScreen from './components/Screens/StartTaskScreen';
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="OnBoarding" component={OnBoardingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CustomerSignUpScreen" component={CustomerSignUpScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ServiceProviderRegistration" component={ServiceProviderRegistration} options={{ headerShown: false }} />
        <Stack.Screen name="PasswordReset" component={ForgetPassword} options = {{headerShown: false}} />
        <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
        <Stack.Screen name="MyBookingsScreen" component={MyBookingsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AccountScreen" component={AccountScreen} options={{ headerShown: false }} />
        <Stack.Screen name="TermsConditionsScreen" component={TermsConditionsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ContactUsScreen" component={ContactUsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="FeedbackScreen" component={FeedbackScreen} options={{ headerShown: false }} />
        <Stack.Screen name="FeedbackSubmissionScreen" component={FeedbackSubmissionScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ServicesScreen" component={ServicesScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ComplaintScreen" component={ComplaintScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PrivacyPolicyScreen" component={PrivacyPolicyScreen} options={{ headerShown: false }} />
        <Stack.Screen name="EmailVerificationPage" component={EmailVerificationPage} options={{ headerShown: false }} />
        <Stack.Screen name="EmailVerificationProvider" component={EmailVerificationProvider} options={{ headerShown: false }} />
        <Stack.Screen name="ProviderDashboard" component={ProviderDashboard} options={{ headerShown: false }} />
        <Stack.Screen name="BookingScreen" component={BookingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CustomerBookingScreen" component={CustomerBookingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AssignTaskScreen" component={AssignTaskScreen} options={{ headerShown: false }} />
        <Stack.Screen name="EmployeeHomeScreen" component={EmployeeHomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="EmployeeSignup" component={EmployeeSignup} options={{ headerShown: false }} />
        <Stack.Screen name="ReferralCodeScreen" component={ReferralCodeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="VerifyEmployeeScreen" component={VerifyEmployeeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ProviderComplaintsScreen" component={ProviderComplaintsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="StartTaskScreen" component={StartTaskScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
