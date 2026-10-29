import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/theme';
import { MOCK_PARENT, MOCK_SLOTS } from '../constants/mockData';
import { StorageService } from '../services/storageService';
import { NotificationService } from '../services/notificationService';
import { AuthService } from '../services/authService';

export default function ParentDashboardScreen({ navigation }) {
  const [slots, setSlots] = useState(MOCK_SLOTS);
  const [demoCountdown, setDemoCountdown] = useState(0);
  const [userProfile, setUserProfile] = useState(null);
  const [familyData, setFamilyData] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      StorageService.getSlots().then((data) => {
        if (isMounted && data) {
          setSlots(data);
        }
      });
      return () => {
        isMounted = false;
      };
    }, [])
  );

  const nextSlot = slots.find((s) => s.status !== 'TAKEN') || slots[0] || MOCK_SLOTS[0];

  const handleScheduleDemo30s = async () => {
    // Schedule native notification in 30s
    await NotificationService.scheduleDemoReminder30s(nextSlot.id, nextSlot.label);
    setDemoCountdown(30);

    const interval = setInterval(() => {
      setDemoCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Fallback auto-navigate if notification wasn't tapped
          navigation.navigate('Alarm', { slotId: nextSlot.id });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Top Elder Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.greetingKannada}>ನಮಸ್ಕಾರ, {userProfile?.name || MOCK_PARENT.kannadaName}</Text>
          <Text style={styles.greetingEnglish}>Welcome, {userProfile?.name || MOCK_PARENT.name} • {familyData?.familyName || 'Family'} [{familyData?.familyCode || 'FM482A'}]</Text>
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
            <View style={[styles.liveDot, nextSlot.status === 'TAKEN' && { backgroundColor: '#10B981' }]} />
            <Text style={styles.heroBadgeText}>
              {nextSlot.status === 'TAKEN' ? 'ಇಂದಿನ ಮಾತ್ರೆ ತೆಗೆದುಕೊಳ್ಳಲಾಗಿದೆ (ALL TAKEN)' : 'ಇಂದಿನ ಮುಂದಿನ ಮಾತ್ರೆ (NEXT DOSE)'}
            </Text>
          </View>
          
          <Text style={styles.heroTime}>{nextSlot.time}</Text>
          <Text style={styles.heroSlotName}>{nextSlot.label}</Text>
          
          <View style={styles.heroDivider} />

          <Text style={styles.heroPillListLabel}>
            ತೆಗೆದುಕೊಳ್ಳಬೇಕಾದ ಮಾತ್ರೆಗಳು ({nextSlot.medicines?.length || 0} Tablets):
          </Text>
          {nextSlot.medicines?.map((med) => (
            <Text key={med.id} style={styles.heroPills}>
              • {med.kannadaName || med.name} ({med.genericName || med.name})
            </Text>
          ))}

          {/* Buttons Row: 1 Instant Test, 1 30-Second Scheduled Demo */}
          <TouchableOpacity
            style={styles.alarmTriggerButton}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Alarm', { slotId: nextSlot.id })}
          >
            <Text style={styles.alarmTriggerIcon}>⚡</Text>
            <View>
              <Text style={styles.alarmTriggerTitle}>ತಕ್ಷಣದ ಪರೀಕ್ಷೆ (Instant Alarm)</Text>
              <Text style={styles.alarmTriggerSub}>Immediate full-screen alarm & Kannada voice</Text>
            </View>
          </TouchableOpacity>

          {/* 30-Second Real Scheduled Reminder Demo */}
          <TouchableOpacity
            style={[styles.scheduledDemoBtn, demoCountdown > 0 && styles.scheduledDemoBtnActive]}
            activeOpacity={0.85}
            onPress={handleScheduleDemo30s}
            disabled={demoCountdown > 0}
          >
            <Text style={styles.scheduledDemoIcon}>⏱️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.scheduledDemoTitle}>
                {demoCountdown > 0
                  ? `ಅಲಾರಂ ${demoCountdown}s ನಂತರ ಬರುತ್ತದೆ...`
                  : '30-ಸೆಕೆಂಡ್ ಡೆಮೊ (Schedule 30s Reminder)'}
              </Text>
              <Text style={styles.scheduledDemoSub}>
                {demoCountdown > 0
                  ? 'Close app or wait: notification will fire automatically!'
                  : 'Tests native Expo Notification in 30 seconds'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Schedule List Section */}
        <Text style={styles.sectionTitle}>ಇಂದಿನ ಸಂಪೂರ್ಣ ವೇಳಾಪಟ್ಟಿ (Today's Schedule)</Text>

        {slots.map((slot) => {
          const isTaken = slot.status === 'TAKEN';
          return (
            <View
              key={slot.id}
              style={[
                styles.slotCard,
                isTaken ? styles.slotTakenBorder : styles.slotPendingBorder,
              ]}
            >
              <View style={styles.slotHeader}>
                <View>
                  <Text style={styles.slotTimeText}>{slot.time}</Text>
                  <Text style={styles.slotLabelText}>{slot.label}</Text>
                </View>
                <View style={isTaken ? styles.takenBadge : styles.pendingBadge}>
                  <Text style={isTaken ? styles.takenBadgeText : styles.pendingBadgeText}>
                    {isTaken ? '✓ ತೆಗೆದುಕೊಂಡಿದ್ದೀರಿ (Taken)' : 'ಬಾಕಿ ಇದೆ (Pending)'}
                  </Text>
                </View>
              </View>
              <Text style={styles.slotMedicineSummary}>
                {slot.medicines?.map((m) => `${m.name} (${m.dosage || '1 Tab'})`).join(' + ')}
              </Text>
            </View>
          );
        })}

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
    marginTop: 14,
    backgroundColor: '#0D9488', // Teal 600
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#2DD4BF',
  },
  alarmTriggerIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  alarmTriggerTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  alarmTriggerSub: {
    fontSize: 11,
    color: '#CCFBF1',
  },
  scheduledDemoBtn: {
    marginTop: 10,
    backgroundColor: '#334155', // Slate 700
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#64748B',
  },
  scheduledDemoBtnActive: {
    backgroundColor: '#7C3AED', // Purple alert
    borderColor: '#A78BFA',
  },
  scheduledDemoIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  scheduledDemoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scheduledDemoSub: {
    fontSize: 10.5,
    color: '#CBD5E1',
    marginTop: 2,
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
  slotPendingBorder: {
    borderColor: '#F59E0B',
  },
  slotScheduledBorder: {
    borderColor: '#E2E8F0',
  },
  slotTakenBorder: {
    borderColor: '#10B981',
  },
  takenBadge: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  takenBadgeText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: 'bold',
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
