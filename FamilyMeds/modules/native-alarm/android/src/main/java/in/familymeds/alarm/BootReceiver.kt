package in.familymeds.alarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

/**
 * BootReceiver:
 * Listens for ACTION_BOOT_COMPLETED, QUICKBOOT_POWERON, and MY_PACKAGE_REPLACED.
 * Immediately reads all persisted medication alarms from native SharedPreferences
 * and reschedules them with Android AlarmManager.setExactAndAllowWhileIdle().
 */
class BootReceiver : BroadcastReceiver() {

    companion object {
        private const val TAG = "FamilyMedsBootReceiver"
    }

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action
        Log.d(TAG, "⚡ Device Reboot / Update event received: $action")

        if (Intent.ACTION_BOOT_COMPLETED == action ||
            "android.intent.action.QUICKBOOT_POWERON" == action ||
            "com.htc.intent.action.QUICKBOOT_POWERON" == action ||
            Intent.ACTION_MY_PACKAGE_REPLACED == action
        ) {
            val alarms = AlarmStorage.getAllAlarms(context)
            Log.d(TAG, "Rescheduling ${alarms.size} persisted medication alarms after boot...")

            val now = System.currentTimeMillis()
            for (alarm in alarms) {
                var triggerTime = alarm.triggerTimeEpochMs

                // If scheduled time has already passed while device was powered off,
                // advance to the next daily occurrence
                while (triggerTime <= now) {
                    triggerTime += (24 * 60 * 60 * 1000L)
                }

                NativeAlarmScheduler.scheduleExactAlarm(
                    context,
                    alarm.alarmId,
                    triggerTime,
                    alarm.slotId,
                    alarm.slotLabel,
                    alarm.medicines,
                    alarm.kannadaVoiceText
                )
                Log.d(TAG, "✅ Rescheduled alarm [${alarm.alarmId}] for ${alarm.slotLabel} at $triggerTime")
            }
        }
    }
}
