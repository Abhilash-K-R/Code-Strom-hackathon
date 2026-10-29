package in.familymeds.alarm

import android.content.Context
import android.content.SharedPreferences
import org.json.JSONArray
import org.json.JSONObject

data class PersistedAlarm(
    val alarmId: Int,
    val triggerTimeEpochMs: Long,
    val slotId: String,
    val slotLabel: String,
    val medicines: String,
    val kannadaVoiceText: String
)

object AlarmStorage {
    private const val PREFS_NAME = "familymeds_alarm_storage"
    private const val KEY_ALARMS = "active_alarms"

    private fun getPrefs(context: Context): SharedPreferences {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }

    fun saveAlarm(
        context: Context,
        alarmId: Int,
        triggerTimeEpochMs: Long,
        slotId: String,
        slotLabel: String,
        medicines: String,
        kannadaVoiceText: String
    ) {
        val prefs = getPrefs(context)
        val alarms = getAllAlarms(context).toMutableList()
        alarms.removeAll { it.alarmId == alarmId }
        alarms.add(
            PersistedAlarm(
                alarmId,
                triggerTimeEpochMs,
                slotId,
                slotLabel,
                medicines,
                kannadaVoiceText
            )
        )

        val jsonArray = JSONArray()
        for (item in alarms) {
            val obj = JSONObject().apply {
                put("alarmId", item.alarmId)
                put("triggerTimeEpochMs", item.triggerTimeEpochMs)
                put("slotId", item.slotId)
                put("slotLabel", item.slotLabel)
                put("medicines", item.medicines)
                put("kannadaVoiceText", item.kannadaVoiceText)
            }
            jsonArray.put(obj)
        }

        prefs.edit().putString(KEY_ALARMS, jsonArray.toString()).apply()
    }

    fun removeAlarm(context: Context, alarmId: Int) {
        val prefs = getPrefs(context)
        val alarms = getAllAlarms(context).filter { it.alarmId != alarmId }
        val jsonArray = JSONArray()
        for (item in alarms) {
            val obj = JSONObject().apply {
                put("alarmId", item.alarmId)
                put("triggerTimeEpochMs", item.triggerTimeEpochMs)
                put("slotId", item.slotId)
                put("slotLabel", item.slotLabel)
                put("medicines", item.medicines)
                put("kannadaVoiceText", item.kannadaVoiceText)
            }
            jsonArray.put(obj)
        }
        prefs.edit().putString(KEY_ALARMS, jsonArray.toString()).apply()
    }

    fun getAllAlarms(context: Context): List<PersistedAlarm> {
        val prefs = getPrefs(context)
        val raw = prefs.getString(KEY_ALARMS, null) ?: return emptyList()
        val list = mutableListOf<PersistedAlarm>()
        try {
            val jsonArray = JSONArray(raw)
            for (i in 0 until jsonArray.length()) {
                val obj = jsonArray.getJSONObject(i)
                list.add(
                    PersistedAlarm(
                        alarmId = obj.getInt("alarmId"),
                        triggerTimeEpochMs = obj.getLong("triggerTimeEpochMs"),
                        slotId = obj.getString("slotId"),
                        slotLabel = obj.getString("slotLabel"),
                        medicines = obj.getString("medicines"),
                        kannadaVoiceText = obj.getString("kannadaVoiceText")
                    )
                )
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        return list
    }
}

