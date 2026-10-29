import React from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import CreateFamilyScreen from '../screens/CreateFamilyScreen';
import JoinFamilyScreen from '../screens/JoinFamilyScreen';

import ParentDashboardScreen from '../screens/ParentDashboardScreen';
import ChildDashboardScreen from '../screens/ChildDashboardScreen';
import AlarmScreen from '../screens/AlarmScreen';
import AddMedicineScreen from '../screens/AddMedicineScreen';
import HistoryScreen from '../screens/HistoryScreen';
import DoctorViewScreen from '../screens/DoctorViewScreen';

const Stack = createNativeStackNavigator();
export const navigationRef = createNavigationContainerRef();

export default function AppNavigator() {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {/* Multi-Tenant Authentication & Family Pairing */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="CreateFamily" component={CreateFamilyScreen} />
        <Stack.Screen name="JoinFamily" component={JoinFamilyScreen} />

        {/* Dashboards & Modals */}
        <Stack.Screen name="ParentDashboard" component={ParentDashboardScreen} />
        <Stack.Screen name="ChildDashboard" component={ChildDashboardScreen} />
        <Stack.Screen
          name="Alarm"
          component={AlarmScreen}
          options={{
            animation: 'fade_from_bottom',
            gestureEnabled: false,
          }}
        />

        {/* Supporting Clinical Screens */}
        <Stack.Screen name="AddMedicine" component={AddMedicineScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="DoctorView" component={DoctorViewScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
