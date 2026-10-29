package in.familymeds.alarm

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap

class NativeAlarmModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "NativeAlarmModule"
    }

    @ReactMethod
    fun scheduleExactMedicationAlarm(params: ReadableMap, promise: Promise) {
        try {
            val alarmId = if (params.hasKey("alarmId")) params.getInt("alarmId") else 1001
            val triggerEpochMs = if (params.hasKey("triggerEpochMs")) {
                params.getDouble("triggerEpochMs").toLong()
            } else {
                System.currentTimeMillis() + 30000L
            }

            val slotId = if (params.hasKey("slotId")) params.getString("slotId") ?: "slot-morning" else "slot-morning"
            val slotLabel = if (params.hasKey("slotLabel")) params.getString("slotLabel") ?: "Morning Medicines" else "Morning Medicines"
            val medicines = if (params.hasKey("medicines")) params.getString("medicines") ?: "Tablets" else "Tablets"
            val kannadaText = if (params.hasKey("kannadaText")) params.getString("kannadaText") ?: "ಅಮ್ಮಾ, ಮಾತ್ರೆ ತೆಗೆದುಕೊಳ್ಳಿ." else "ಅಮ್ಮಾ, ಮಾತ್ರೆ ತೆಗೆದುಕೊಳ್ಳಿ."

            val success = NativeAlarmScheduler.scheduleExactAlarm(
                reactContext,
                alarmId,
                triggerEpochMs,
                slotId,
                slotLabel,
                medicines,
                kannadaText
            )

            if (success) {
                promise.resolve(true)
            } else {
                promise.reject("ALARM_ERROR", "Failed to schedule exact alarm with AlarmManager.")
            }
        } catch (e: Exception) {
            promise.reject("EXCEPTION", e.message, e)
        }
    }

    @ReactMethod
    fun cancelMedicationAlarm(alarmId: Int, promise: Promise) {
        try {
            NativeAlarmScheduler.cancelAlarm(reactContext, alarmId)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("CANCEL_ERROR", e.message, e)
        }
    }
}

