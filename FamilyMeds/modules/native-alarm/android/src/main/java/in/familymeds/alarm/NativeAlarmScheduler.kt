package in.familymeds.alarm

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log

object NativeAlarmScheduler {
    private const val TAG = "NativeAlarmScheduler"

    fun scheduleExactAlarm(
        context: Context,
        alarmId: Int,
        triggerTimeEpochMs: Long,
        slotId: String,
        slotLabel: String,
        medicines: String,
        kannadaVoiceText: String
    ): Boolean {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager
            ?: return false

        // Check exact alarm permission on Android 12+ (API 31+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (!alarmManager.canScheduleExactAlarms()) {
                Log.w(TAG, "Cannot schedule exact alarm: Permission SCHEDULE_EXACT_ALARM not granted.")
            }
        }

        val intent = Intent(context, AlarmReceiver::class.java).apply {
            action = AlarmReceiver.ACTION_MEDICATION_ALARM
            putExtra(AlarmReceiver.EXTRA_ALARM_ID, alarmId)
            putExtra(AlarmReceiver.EXTRA_SLOT_ID, slotId)
            putExtra(AlarmReceiver.EXTRA_SLOT_LABEL, slotLabel)
            putExtra(AlarmReceiver.EXTRA_MEDICINES, medicines)
            putExtra(AlarmReceiver.EXTRA_KANNADA_TEXT, kannadaVoiceText)
            putExtra(AlarmReceiver.EXTRA_TRIGGER_EPOCH, triggerTimeEpochMs)
        }

        val pendingIntent = PendingIntent.getBroadcast(
            context,
            alarmId,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Persist to native SharedPreferences for reboot recovery
        AlarmStorage.saveAlarm(
            context,
            alarmId,
            triggerTimeEpochMs,
            slotId,
            slotLabel,
            medicines,
            kannadaVoiceText
        )

        try {
            // Guarantee wakeup even in deep Doze / idle mode
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    triggerTimeEpochMs,
                    pendingIntent
                )
            } else {
                alarmManager.setExact(
                    AlarmManager.RTC_WAKEUP,
                    triggerTimeEpochMs,
                    pendingIntent
                )
            }
            Log.d(TAG, "✅ Exact medication alarm [$alarmId] scheduled for $triggerTimeEpochMs")
            return true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to schedule exact alarm: ${e.message}", e)
            return false
        }
    }

    fun cancelAlarm(context: Context, alarmId: Int) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager
            ?: return

        val intent = Intent(context, AlarmReceiver::class.java).apply {
            action = AlarmReceiver.ACTION_MEDICATION_ALARM
        }
        val pendingIntent = PendingIntent.getBroadcast(
            context,
            alarmId,
            intent,
            PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
        )

        if (pendingIntent != null) {
            alarmManager.cancel(pendingIntent)
            pendingIntent.cancel()
        }

        AlarmStorage.removeAlarm(context, alarmId)
        Log.d(TAG, "Canceled medication alarm [$alarmId]")
    }
}

