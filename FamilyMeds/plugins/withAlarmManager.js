const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Expo Config Plugin for Production Medication Alarms:
 * 1. Registers Android AlarmManager permissions (SCHEDULE_EXACT_ALARM, USE_EXACT_ALARM, USE_FULL_SCREEN_INTENT, WAKE_LOCK, RECEIVE_BOOT_COMPLETED).
 * 2. Registers AlarmReceiver and BootReceiver broadcast receivers.
 * 3. Configures MainActivity with showWhenLocked and turnScreenOn flags for full-screen lock-screen takeovers.
 */
module.exports = function withAlarmManager(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;

    // Ensure permissions array exists
    if (!androidManifest['uses-permission']) {
      androidManifest['uses-permission'] = [];
    }

    const permissionsToAdd = [
      'android.permission.SCHEDULE_EXACT_ALARM',
      'android.permission.USE_EXACT_ALARM',
      'android.permission.USE_FULL_SCREEN_INTENT',
      'android.permission.WAKE_LOCK',
      'android.permission.RECEIVE_BOOT_COMPLETED',
      'android.permission.VIBRATE',
      'android.permission.FOREGROUND_SERVICE',
      'android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK',
      'android.permission.SYSTEM_ALERT_WINDOW',
      'android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS',
    ];

    permissionsToAdd.forEach((perm) => {
      const exists = androidManifest['uses-permission'].some(
        (p) => p.$ && p.$['android:name'] === perm
      );
      if (!exists) {
        androidManifest['uses-permission'].push({
          $: { 'android:name': perm },
        });
      }
    });

    const application = androidManifest.application[0];

    // Configure MainActivity for Full-Screen Lock-Screen Wakeup
    if (application.activity && application.activity.length > 0) {
      const mainActivity = application.activity[0];
      mainActivity.$['android:showWhenLocked'] = 'true';
      mainActivity.$['android:turnScreenOn'] = 'true';
      mainActivity.$['android:showOnLockScreen'] = 'true';
      mainActivity.$['android:excludeFromRecents'] = 'false';
    }

    // Register Alarm Receiver
    if (!application.receiver) {
      application.receiver = [];
    }

    const alarmReceiverName = 'in.familymeds.alarm.AlarmReceiver';
    const hasAlarmReceiver = application.receiver.some(
      (r) => r.$ && r.$['android:name'] === alarmReceiverName
    );

    if (!hasAlarmReceiver) {
      application.receiver.push({
        $: {
          'android:name': alarmReceiverName,
          'android:enabled': 'true',
          'android:exported': 'false',
        },
      });
    }

    // Register Boot Receiver
    const bootReceiverName = 'in.familymeds.alarm.BootReceiver';
    const hasBootReceiver = application.receiver.some(
      (r) => r.$ && r.$['android:name'] === bootReceiverName
    );

    if (!hasBootReceiver) {
      application.receiver.push({
        $: {
          'android:name': bootReceiverName,
          'android:enabled': 'true',
          'android:exported': 'true',
          'android:directBootAware': 'true',
        },
        'intent-filter': [
          {
            action: [
              { $: { 'android:name': 'android.intent.action.BOOT_COMPLETED' } },
              { $: { 'android:name': 'android.intent.action.QUICKBOOT_POWERON' } },
              { $: { 'android:name': 'com.htc.intent.action.QUICKBOOT_POWERON' } },
              { $: { 'android:name': 'android.intent.action.MY_PACKAGE_REPLACED' } },
            ],
          },
        ],
      });
    }

    return config;
  });
};
