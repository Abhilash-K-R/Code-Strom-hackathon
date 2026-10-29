import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { StorageService } from './src/services/storageService';
import { AlarmSyncService } from './src/services/alarmSyncService';

export default function App() {
  useEffect(() => {
    async function initialize() {
      await StorageService.initStorage();
      await AlarmSyncService.syncAllAlarms();
    }
    initialize();
  }, []);

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}
