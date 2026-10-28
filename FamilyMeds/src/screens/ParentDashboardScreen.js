import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { COLORS } from '../constants/theme';
import { MOCK_PARENT, MOCK_SLOTS } from '../constants/mockData';
import { SpeechService } from '../services/speechService';

export default function ParentDashboardScreen({ navigation }) {
  const morningSlot = MOCK_SLOTS[0];
  const nightSlot = MOCK_SLOTS[1];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Top Elder Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.greetingKannada}>ನಮಸ್ಕಾರ, {MOCK_PARENT.kannadaName}</Text>
          <Text style={styles.greetingEnglish}>Good Morning, {MOCK_PARENT.name} ({MOCK_PARENT.location})</Text>
        </View>
        <TouchableOpacity
          style={styles.roleSwitchBtn}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.roleSwitchText}>ಬದಲಿಸಿ (Switch)</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Next Dose Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroBadgeRow}>
            <View style={styles.liveDot} />
            <Text style={styles.heroBadgeText}>ಇಂದಿನ ಮುಂದಿನ ಮಾತ್ರೆ (NEXT DOSE)</Text>
          </View>
          
          <Text style={styles.heroTime}>{morningSlot.time}</Text>
          <Text style={styles.heroSlotName}>ಬೆಳಗಿನ ಉಪಹಾರದ ನಂತರ (Morning)</Text>
          
          <View style={styles.heroDivider} />

          <Text style={styles.heroPillListLabel}>ತೆಗೆದುಕೊಳ್ಳಬೇಕಾದ ಮಾತ್ರೆಗಳು (2 Tablets):</Text>
          <Text style={styles.heroPills}>• ಬಿಪಿ ಮಾತ್ರೆ (Telmisartan 40mg)</Text>
          <Text style={styles.heroPills}>• ಸಕ್ಕರೆ ಕಾಯಿಲೆ ಮಾತ್ರೆ (Metformin 500mg)</Text>

          {/* Big Trigger Alarm Simulation Button */}
          <TouchableOpacity
            style={styles.alarmTriggerButton}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Alarm')}
          >
            <Text style={styles.alarmTriggerIcon}>🔔</Text>
            <View>
              <Text style={styles.alarmTriggerTitle}>ಅಲಾರಂ ಪರೀಕ್ಷಿಸಿ (Simulate 09:00 AM)</Text>
              <Text style={styles.alarmTriggerSub}>Tap to test full-screen Kannada alarm</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Schedule List Section */}
        <Text style={styles.sectionTitle}>ಇಂದಿನ ಸಂಪೂರ್ಣ ವೇಳಾಪಟ್ಟಿ (Today's Schedule)</Text>

        {/* Morning Slot Card */}
        <View style={[styles.slotCard, styles.slotPendingBorder]}>
          <View style={styles.slotHeader}>
            <View>
              <Text style={styles.slotTimeText}>{morningSlot.time}</Text>
              <Text style={styles.slotLabelText}>ಬೆಳಗಿನ ಮಾತ್ರೆಗಳು (Morning)</Text>
            </View>
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>ಬಾಕಿ ಇದೆ (Pending)</Text>
            </View>
          </View>
          <Text style={styles.slotMedicineSummary}>
            BP Tablet (1 Tab) + Sugar Tablet (1 Tab)
          </Text>
        </View>

        {/* Night Slot Card */}
        <View style={[styles.slotCard, styles.slotScheduledBorder]}>
          <View style={styles.slotHeader}>
            <View>
              <Text style={styles.slotTimeText}>{nightSlot.time}</Text>
              <Text style={styles.slotLabelText}>ರಾತ್ರಿಯ ಮಾತ್ರೆಗಳು (Night)</Text>
            </View>
            <View style={styles.scheduledBadge}>
              <Text style={styles.scheduledBadgeText}>ರಾತ್ರಿ 8:30 ಕ್ಕೆ</Text>
            </View>
          </View>
          <Text style={styles.slotMedicineSummary}>
            Calcium Tablet (Shelcal 500mg) - 1 Tab
          </Text>
        </View>

        {/* Doctor View Entry Card */}
        <TouchableOpacity
          style={styles.doctorCard}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('DoctorView')}
        >
          <Text style={styles.doctorIcon}>📋</Text>
          <View style={styles.doctorTextCol}>
            <Text style={styles.doctorTitle}>ಡಾಕ್ಟರ್ ಚಾರ್ಟ್ (Doctor's View)</Text>
            <Text style={styles.doctorSub}>14-day medication compliance report</Text>
          </View>
          <Text style={styles.doctorChevron}>➔</Text>
        </TouchableOpacity>

        {/* Family Linked Notice */}
        <View style={styles.familyNotice}>
          <Text style={styles.familyNoticeText}>
            🛡️ ನಿಮ್ಮ ಮಗ {MOCK_PARENT.linkedChild} ನಿಮ್ಮ ಮಾತ್ರೆಗಳನ್ನು ಬೆಂಗಳೂರಿನಿಂದ ಗಮನಿಸುತ್ತಿದ್ದಾರೆ.
          </Text>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingKannada: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
  },
  greetingEnglish: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  roleSwitchBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  roleSwitchText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F766E',
  },
  content: {
    padding: 16,
  },
  heroCard: {
    backgroundColor: '#0F172A', // Slate 900
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#0D9488',
    shadowColor: '#0D9488',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F59E0B',
    marginRight: 8,
  },
  heroBadgeText: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  heroTime: {
    fontSize: 44,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 48,
  },
  heroSlotName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#94A3B8',
    marginTop: 4,
  },
  heroDivider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 14,
  },
  heroPillListLabel: {
    fontSize: 13,
    color: '#CBD5E1',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  heroPills: {
    fontSize: 15,
    color: '#F8FAFC',
    fontWeight: '600',
    lineHeight: 22,
  },
  alarmTriggerButton: {
    marginTop: 18,
    backgroundColor: '#0D9488', // Teal 600
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#2DD4BF',
  },
  alarmTriggerIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  alarmTriggerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  alarmTriggerSub: {
    fontSize: 11,
    color: '#CCFBF1',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  slotCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  slotPendingBorder: {
    borderColor: '#F59E0B',
  },
  slotScheduledBorder: {
    borderColor: '#E2E8F0',
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  slotTimeText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  slotLabelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  pendingBadgeText: {
    color: '#B45309',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scheduledBadge: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  scheduledBadgeText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: 'bold',
  },
  slotMedicineSummary: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
  },
  doctorCard: {
    backgroundColor: '#EFF6FF', // Light blue
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    marginTop: 8,
    marginBottom: 14,
  },
  doctorIcon: {
    fontSize: 26,
    marginRight: 14,
  },
  doctorTextCol: {
    flex: 1,
  },
  doctorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  doctorSub: {
    fontSize: 12,
    color: '#3B82F6',
  },
  doctorChevron: {
    fontSize: 18,
    color: '#1E3A8A',
    fontWeight: 'bold',
  },
  familyNotice: {
    backgroundColor: '#F0FDF4',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  familyNoticeText: {
    fontSize: 13,
    color: '#166534',
    lineHeight: 18,
    fontWeight: '600',
  },
});
