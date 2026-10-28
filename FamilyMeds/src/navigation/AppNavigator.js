import React, { useEffect } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';

import LoginScreen from '../screens/LoginScreen';
import ParentDashboardScreen from '../screens/ParentDashboardScreen';
import ChildDashboardScreen from '../screens/ChildDashboardScreen';
import AlarmScreen from '../screens/AlarmScreen';
import AddMedicineScreen from '../screens/AddMedicineScreen';
import HistoryScreen from '../screens/HistoryScreen';
import DoctorViewScreen from '../screens/DoctorViewScreen';

const Stack = createNativeStackNavigator();
export const navigationRef = createNavigationContainerRef();

export default function AppNavigator() {
  useEffect(() => {
    // Listener 1: When notification fires while app is in foreground
    const subReceived = Notifications.addNotificationReceivedListener((notification) => {
      const slotId = notification.request.content.data?.slotId;
      if (navigationRef.isReady()) {
        navigationRef.navigate('Alarm', { slotId });
      }
    });

    // Listener 2: When user taps on notification from lockscreen/notification shade
    const subResponse = Notifications.addNotificationResponseReceivedListener((response) => {
      const slotId = response.notification.request.content.data?.slotId;
      if (navigationRef.isReady()) {
        navigationRef.navigate('Alarm', { slotId });
      }
    });

    return () => {
      subReceived.remove();
      subResponse.remove();
    };
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
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
