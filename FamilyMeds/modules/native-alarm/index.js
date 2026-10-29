import { NativeModules, Platform } from 'react-native';

const { NativeAlarmModule } = NativeModules;

export default {
  /**
   * Schedule exact native medication alarm via Android AlarmManager.setExactAndAllowWhileIdle
   */
  scheduleExactMedicationAlarm: async (params) => {
    if (Platform.OS === 'android' && NativeAlarmModule) {
      return await NativeAlarmModule.scheduleExactMedicationAlarm(params);
    }
    return false;
  },

  /**
   * Cancel native medication alarm
   */
  cancelMedicationAlarm: async (alarmId) => {
    if (Platform.OS === 'android' && NativeAlarmModule) {
      return await NativeAlarmModule.cancelMedicationAlarm(alarmId);
    }
    return false;
  },

  isNativeAvailable: () => {
    return Platform.OS === 'android' && !!NativeAlarmModule;
  },
};
