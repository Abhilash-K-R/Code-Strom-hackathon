import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { COLORS } from '../constants/theme';
import { SpeechService } from '../services/speechService';
import { MOCK_SLOTS, MOCK_PARENT } from '../constants/mockData';

export default function AlarmScreen({ navigation, route }) {
  const [takenConfirmed, setTakenConfirmed] = useState(false);
  const morningSlot = MOCK_SLOTS[0]; // 09:00 AM slot
  const kannadaSpokenText = "ಅಮ್ಮಾ, ಬೆಳಗಿನ ಬಿಪಿ ಮತ್ತು ಸಕ್ಕರೆ ಕಾಯಿಲೆ ಮಾತ್ರೆ ತೆಗೆದುಕೊಳ್ಳಿ.";
  const englishFallback = "Amma, please take your morning BP and Sugar tablets.";

  useEffect(() => {
    // Automatically trigger voice prompt when alarm fires
    const timer = setTimeout(() => {
      SpeechService.speakKannada(kannadaSpokenText, englishFallback);
    }, 500);

    return () => {
      SpeechService.stop();
      clearTimeout(timer);
    };
  }, []);

  const handleTakenPress = () => {
    SpeechService.stop();
    setTakenConfirmed(true);
    // Voice confirmation
    SpeechService.speakKannada("ಧನ್ಯವಾದಗಳು ಅಮ್ಮಾ, ಮಾತ್ರೆ ತೆಗೆದುಕೊಂಡಿದ್ದೀರಿ ಎಂದು ದಾಖಲಾಗಿದೆ.", "Thank you Amma, recorded as taken.");
    
    setTimeout(() => {
      Alert.alert(
        "ಮಾತ್ರೆ ತೆಗೆದುಕೊಳ್ಳಲಾಗಿದೆ! (Recorded)",
        "Both BP and Sugar tablets logged as TAKEN at 09:08 AM. Child notified.",
        [
          {
            text: "ಸರಿ (OK)",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }, 800);
  };

  const handleSnooze = () => {
    SpeechService.stop();
    Alert.alert(
      "10 ನಿಮಿಷ ಬಿಟ್ಟು ನೆನಪಿಸಲಾಗುವುದು (Snoozed)",
      "Alarm will ring again in 10 minutes (Demo Mode).",
      [{ text: "OK", onPress: () => navigation.goBack() }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      
      {/* Top Emergency Indicator Header */}
      <View style={styles.header}>
        <View style={styles.pulsingBadge}>
          <Text style={styles.pulsingDot}>🔔</Text>
          <Text style={styles.headerBadgeText}>ಮಾತ್ರೆ ಸಮಯ (MEDICINE TIME)</Text>
        </View>
        <Text style={styles.timeBig}>{morningSlot.time}</Text>
        <Text style={styles.slotLabelKannada}>ಬೆಳಗಿನ ಮಾತ್ರೆಗಳು (Morning Slot)</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Kannada Voice Trigger Button */}
        <TouchableOpacity
          style={styles.voiceButton}
          activeOpacity={0.8}
          onPress={() => SpeechService.speakKannada(kannadaSpokenText, englishFallback)}
        >
          <Text style={styles.voiceIcon}>🔊</Text>
          <View style={styles.voiceTextContainer}>
            <Text style={styles.voiceTitleKannada}>ಕನ್ನಡದಲ್ಲಿ ಕೇಳಿ (Tap to Listen)</Text>
            <Text style={styles.voiceSubtitle}>"ಅಮ್ಮಾ, ಬೆಳಗಿನ ಬಿಪಿ ಮಾತ್ರೆ ತೆಗೆದುಕೊಳ್ಳಿ"</Text>
          </View>
        </TouchableOpacity>

        {/* Medicines in this slot */}
        <Text style={styles.sectionHeader}>ತೆಗೆದುಕೊಳ್ಳಬೇಕಾದ ಮಾತ್ರೆಗಳು (2 Tablets):</Text>
        
        {morningSlot.medicines.map((med, index) => (
          <View key={med.id} style={styles.medicineCard}>
            <Image
              source={{ uri: med.photo }}
              style={styles.tabletImage}
              resizeMode="cover"
            />
            <View style={styles.medDetails}>
              <View style={styles.pillBadge}>
                <Text style={styles.pillIndex}>#{index + 1}</Text>
                <Text style={styles.pillTiming}>{med.timing}</Text>
              </View>
              <Text style={styles.medNameKannada}>{med.kannadaName}</Text>
              <Text style={styles.medNameEnglish}>{med.name} ({med.genericName})</Text>
              <Text style={styles.dosageText}>ಪ್ರಮಾಣ: {med.dosage}</Text>
            </View>
          </View>
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Bottom Sticky Action Area (Giant TAKEN Button) */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.giantTakenButton, takenConfirmed && styles.giantTakenSuccess]}
          activeOpacity={0.85}
          onPress={handleTakenPress}
        >
          <Text style={styles.takenIcon}>✓</Text>
          <Text style={styles.takenTextKannada}>ತೆಗೆದುಕೊಂಡೆ</Text>
          <Text style={styles.takenTextEnglish}>TAKEN (CONFIRM ALL)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.snoozeButton} onPress={handleSnooze}>
          <Text style={styles.snoozeText}>10 ನಿಮಿಷ ಬಿಟ್ಟು ನೆನಪಿಸಿ (Remind in 10 mins - Demo)</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Slate 900 dark contrast
  },
  header: {
    paddingTop: 16,
    paddingBottom: 16,
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderBottomWidth: 2,
    borderBottomColor: '#0D9488',
  },
  pulsingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#991B1B', // Dark red alert badge
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 8,
  },
  pulsingDot: {
    fontSize: 16,
    marginRight: 6,
  },
  headerBadgeText: {
    color: '#FEF2F2',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 1,
  },
  timeBig: {
    fontSize: 48,
    fontWeight: '900',
    color: '#38BDF8', // Cyan 400
    lineHeight: 52,
  },
  slotLabelKannada: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#CBD5E1',
    marginTop: 4,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F766E', // Teal 700
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#2DD4BF',
    marginBottom: 18,
    shadowColor: '#2DD4BF',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  voiceIcon: {
    fontSize: 32,
    marginRight: 14,
  },
  voiceTextContainer: {
    flex: 1,
  },
  voiceTitleKannada: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  voiceSubtitle: {
    fontSize: 13,
    color: '#CCFBF1',
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#94A3B8',
    marginBottom: 12,
  },
  medicineCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#334155',
    marginBottom: 14,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  tabletImage: {
    width: 110,
    height: 120,
    backgroundColor: '#334155',
  },
  medDetails: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  pillIndex: {
    backgroundColor: '#38BDF8',
    color: '#0F172A',
    fontWeight: '900',
    fontSize: 11,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 8,
  },
  pillTiming: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: 'bold',
  },
  medNameKannada: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  medNameEnglish: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  dosageText: {
    fontSize: 13,
    color: '#4ADE80',
    fontWeight: 'bold',
    marginTop: 4,
  },
  bottomBar: {
    padding: 16,
    backgroundColor: '#1E293B',
    borderTopWidth: 1.5,
    borderTopColor: '#334155',
  },
  giantTakenButton: {
    backgroundColor: '#16A34A', // Green 600
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#4ADE80',
    shadowColor: '#16A34A',
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 8,
  },
  giantTakenSuccess: {
    backgroundColor: '#059669',
    borderColor: '#A7F3D0',
  },
  takenIcon: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  takenTextKannada: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  takenTextEnglish: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DCFCE7',
    marginTop: 2,
  },
  snoozeButton: {
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 8,
  },
  snoozeText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
});
