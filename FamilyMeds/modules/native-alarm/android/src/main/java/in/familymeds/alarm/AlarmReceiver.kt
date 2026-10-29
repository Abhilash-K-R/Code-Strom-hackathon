package in.familymeds.alarm

import android.app.KeyguardManager
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.RingtoneManager
import android.os.Build
import android.os.PowerManager
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.util.Log
import androidx.core.app.NotificationCompat

class AlarmReceiver : BroadcastReceiver() {

    companion object {
        const val TAG = "FamilyMedsAlarmReceiver"
        const val ACTION_MEDICATION_ALARM = "in.familymeds.alarm.ACTION_MEDICATION_ALARM"
        const val CHANNEL_ID = "familymeds_emergency_alarms"
        const val CHANNEL_NAME = "Medication Alarms (ಮಾತ್ರೆ ಎಚ್ಚರಿಕೆಗಳು)"

        const val EXTRA_ALARM_ID = "extra_alarm_id"
        const val EXTRA_SLOT_ID = "extra_slot_id"
        const val EXTRA_SLOT_LABEL = "extra_slot_label"
        const val EXTRA_MEDICINES = "extra_medicines"
        const val EXTRA_KANNADA_TEXT = "extra_kannada_text"
        const val EXTRA_TRIGGER_EPOCH = "extra_trigger_epoch"
    }

    override fun onReceive(context: Context, intent: Intent) {
        Log.d(TAG, "🔔 Medication Alarm received via AlarmManager!")

        val slotId = intent.getStringExtra(EXTRA_SLOT_ID) ?: "slot-morning"
        val slotLabel = intent.getStringExtra(EXTRA_SLOT_LABEL) ?: "Morning Medicines"
        val medicines = intent.getStringExtra(EXTRA_MEDICINES) ?: "Scheduled Medication"
        val kannadaText = intent.getStringExtra(EXTRA_KANNADA_TEXT) ?: "ಅಮ್ಮಾ, ಮಾತ್ರೆ ತೆಗೆದುಕೊಳ್ಳುವ ಸಮಯವಾಗಿದೆ."

        // 1. Acquire Partial WakeLock to guarantee CPU stays active
        val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
        val wakeLock = powerManager.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK or PowerManager.ACQUIRE_CAUSES_WAKEUP or PowerManager.ON_AFTER_RELEASE,
            "FamilyMeds:AlarmWakeLock"
        )
        wakeLock.acquire(10 * 60 * 1000L) // 10 minutes maximum safety timeout

        // 2. Trigger native high-contrast vibration pattern [delay, vibrate, pause, vibrate]
        triggerNativeVibration(context)

        // 3. Launch or bring MainActivity to the foreground over the lock screen
        launchFullScreenAlarm(context, slotId, slotLabel, medicines, kannadaText)

        // 4. Create and post High-Priority Foreground Notification with FullScreenIntent
        createNotificationChannel(context)
        postEmergencyNotification(context, slotId, slotLabel, medicines)

        // 5. Automatic rescheduling for the next day (recurring exact alarm)
        val alarmId = intent.getIntExtra(EXTRA_ALARM_ID, 1001)
        val nextDayEpoch = System.currentTimeMillis() + (24 * 60 * 60 * 1000L)
        NativeAlarmScheduler.scheduleExactAlarm(
            context,
            alarmId,
            nextDayEpoch,
            slotId,
            slotLabel,
            medicines,
            kannadaText
        )
    }

    private fun triggerNativeVibration(context: Context) {
        val pattern = longArrayOf(0, 1000, 400, 1000, 400, 1500)
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
                vibratorManager?.defaultVibrator?.vibrate(
                    VibrationEffect.createWaveform(pattern, -1)
                )
            } else {
                @Suppress("DEPRECATION")
                val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator?.vibrate(VibrationEffect.createWaveform(pattern, -1))
                } else {
                    @Suppress("DEPRECATION")
                    vibrator?.vibrate(pattern, -1)
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "Vibration failed: ${e.message}")
        }
    }

    private fun launchFullScreenAlarm(
        context: Context,
        slotId: String,
        slotLabel: String,
        medicines: String,
        kannadaText: String
    ) {
        try {
            val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)?.apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or
                        Intent.FLAG_ACTIVITY_CLEAR_TOP or
                        Intent.FLAG_ACTIVITY_SINGLE_TOP
                putExtra("route", "Alarm")
                putExtra("slotId", slotId)
                putExtra("slotLabel", slotLabel)
                putExtra("medicines", medicines)
                putExtra("kannadaText", kannadaText)
                putExtra("isExactAlarmTrigger", true)
            }

            if (launchIntent != null) {
                context.startActivity(launchIntent)
                Log.d(TAG, "🚀 FullScreen MainActivity invoked over lockscreen for slot: $slotId")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to launch full screen alarm activity: ${e.message}", e)
        }
    }

    private fun createNotificationChannel(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager ?: return
            val soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
            val audioAttributes = AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .setUsage(AudioAttributes.USAGE_ALARM)
                .build()

            val channel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Critical medication alarms for seniors"
                setSound(soundUri, audioAttributes)
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 1000, 400, 1000)
                lockscreenVisibility = Notification.VISIBILITY_PUBLIC
                setBypassDnd(true)
            }
            manager.createNotificationChannel(channel)
        }
    }

    private fun postEmergencyNotification(
        context: Context,
        slotId: String,
        slotLabel: String,
        medicines: String
    ) {
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager ?: return
        val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)?.apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("route", "Alarm")
            putExtra("slotId", slotId)
        }

        val fullScreenPendingIntent = PendingIntent.getActivity(
            context,
            slotId.hashCode(),
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentTitle("ಮಾತ್ರೆ ಸಮಯ (MEDICINE TIME): $slotLabel")
            .setContentText("ತೆಗೆದುಕೊಳ್ಳಿ: $medicines")
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setFullScreenIntent(fullScreenPendingIntent, true)
            .setAutoCancel(true)
            .setOngoing(true)
            .build()

        manager.notify(slotId.hashCode(), notification)
    }
}
