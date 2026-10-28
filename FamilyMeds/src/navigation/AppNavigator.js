import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import ParentDashboardScreen from '../screens/ParentDashboardScreen';
import ChildDashboardScreen from '../screens/ChildDashboardScreen';
import AlarmScreen from '../screens/AlarmScreen';
import AddMedicineScreen from '../screens/AddMedicineScreen';
import HistoryScreen from '../screens/HistoryScreen';
import DoctorViewScreen from '../screens/DoctorViewScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {/* Core Entry */}
        <Stack.Screen name="Login" component={LoginScreen} />

        {/* Prioritized Screens */}
        <Stack.Screen name="ParentDashboard" component={ParentDashboardScreen} />
        <Stack.Screen name="ChildDashboard" component={ChildDashboardScreen} />
        <Stack.Screen
          name="Alarm"
          component={AlarmScreen}
          options={{
            animation: 'fade_from_bottom',
            gestureEnabled: false, // Prevents accidental swipe to dismiss alarm
          }}
        />

        {/* Supporting Screens */}
        <Stack.Screen name="AddMedicine" component={AddMedicineScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="DoctorView" component={DoctorViewScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
