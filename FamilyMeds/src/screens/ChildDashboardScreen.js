import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/theme';
import { MOCK_PARENT, MOCK_SLOTS } from '../constants/mockData';
import { StorageService } from '../services/storageService';
import { AuthService } from '../services/authService';
import { ApiService } from '../services/apiService';

export default function ChildDashboardScreen({ navigation }) {
  // Demo state: toggle between normal monitoring and 30-min missed dose alert
  const [isMissedAlertActive, setIsMissedAlertActive] = useState(false);
  const [slots, setSlots] = useState(MOCK_SLOTS);
  const [userProfile, setUserProfile] = useState(null);
  const [familyData, setFamilyData] = useState(null);
  const [liveStatus, setLiveStatus] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const triggerMissedDoseSimulation = () => {
    setIsMissedAlertActive(true);
    Alert.alert(
      "🚨 ತುರ್ತು ಎಚ್ಚರಿಕೆ (Emergency Family Alert)",
      "Mother has NOT confirmed her 09:00 AM BP medicine for 30 minutes! Phone call advised.",
      [
        { text: "Dismiss Alert", onPress: () => setIsMissedAlertActive(false), style: 'cancel' },
        { text: "Call Amma Now", onPress: () => Alert.alert("Calling Amma...", "+91 98450 12345") },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Caregiver Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Family Monitoring</Text>
          <View style={styles.parentTagRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.parentNameText}>{familyData ? `${familyData.familyName} [${familyData.familyCode}]` : `${MOCK_PARENT.name} (${MOCK_PARENT.location})`}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.switchRoleBtn}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.switchRoleText}>Switch Role</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {/* CRITICAL ALERT CARD (Simulated 30-min Escalation) */}
        {isMissedAlertActive ? (
          <View style={styles.missedAlertCard}>
            <View style={styles.alertHeaderRow}>
              <Text style={styles.alertBlinkingIcon}>🚨</Text>
              <Text style={styles.alertCardTitle}>30-MIN MISSED DOSE ESCALATION</Text>
            </View>
            <Text style={styles.alertCardMessage}>
              Amma did not confirm her 09:00 AM morning tablets within 30 minutes.
            </Text>
            <View style={styles.alertActionRow}>
              <TouchableOpacity
                style={styles.callAmmaBtn}
                onPress={() => Alert.alert("Calling...", MOCK_PARENT.phone)}
              >
                <Text style={styles.callAmmaText}>📞 Call Amma Now ({MOCK_PARENT.phone})</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.resetAlertBtn}
                onPress={() => setIsMissedAlertActive(false)}
              >
                <Text style={styles.resetAlertText}>Reset Alert</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.healthyStatusCard}>
            <View style={styles.statusRow}>
              <Text style={styles.shieldIcon}>🛡️</Text>
              <View style={styles.statusTextCol}>
                <Text style={styles.statusTitle}>
      {liveStatus?.latestDose?.status === 'TAKEN'
        ? '✅ Dose Confirmed by Parent'
        : '🛡️ Alarms Armed & Monitored'}
    </Text>
                <Text style={styles.statusSubtitle}>
                  Parent phone is active. Alarms will fire locally on schedule.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Hackathon Simulation Controls Box */}
        <View style={styles.demoControlBox}>
          <Text style={styles.demoBoxLabel}>⚡ HACKATHON LIVE DEMO CONTROLS</Text>
          <TouchableOpacity
            style={styles.simulateMissedBtn}
            onPress={triggerMissedDoseSimulation}
          >
            <Text style={styles.simulateMissedText}>
              🔔 Simulate 30-min Missed Alert Trigger
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons Row */}
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={styles.actionCardPrimary}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('AddMedicine')}
          >
            <Text style={styles.actionCardIcon}>➕</Text>
            <Text style={styles.actionCardTitle}>Add Medicine</Text>
            <Text style={styles.actionCardSub}>Upload strip photo & set schedule</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCardSecondary}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('History')}
          >
            <Text style={styles.actionCardIcon}>📊</Text>
            <Text style={styles.actionCardTitle}>Dose History</Text>
            <Text style={styles.actionCardSub}>Taken / Missed / Late logs</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Schedule Overview for Child */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Amma's Today's Medicines</Text>
          <TouchableOpacity onPress={() => navigation.navigate('DoctorView')}>
            <Text style={styles.doctorLinkText}>Doctor View ➔</Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Slots Render */}
        {slots.map((slot) => {
          const isTaken = slot.status === 'TAKEN';
          return (
            <View key={slot.id} style={styles.doseCard}>
              <View style={styles.doseCardTop}>
                <View>
                  <Text style={styles.doseTime}>{slot.time} — {slot.label}</Text>
                  <Text style={styles.doseInstruction}>{slot.medicines?.[0]?.timing || 'As Scheduled'}</Text>
                </View>
                <View style={isTaken ? styles.takenBadgeChild : styles.pendingBadge}>
                  <Text style={isTaken ? styles.takenBadgeChildText : styles.pendingBadgeText}>
                    {isTaken ? '✓ Taken' : 'Pending Tap'}
                  </Text>
                </View>
              </View>

              <View style={styles.pillListRow}>
                {slot.medicines?.map((med) => (
                  <View key={med.id} style={styles.pillChip}>
                    <Text style={styles.pillChipText}>💊 {med.name} ({med.dosage || '1 Tab'})</Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}

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
  header: {
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  parentTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
    marginRight: 6,
  },
  parentNameText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  switchRoleBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  switchRoleText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0D9488',
  },
  scrollArea: {
    padding: 16,
  },
  missedAlertCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  alertHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  alertBlinkingIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  alertCardTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#B91C1C',
    letterSpacing: 0.5,
  },
  alertCardMessage: {
    fontSize: 13,
    color: '#7F1D1D',
    lineHeight: 18,
    marginBottom: 12,
  },
  alertActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  callAmmaBtn: {
    flex: 1,
    backgroundColor: '#DC2626',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  callAmmaText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  resetAlertBtn: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  resetAlertText: {
    color: '#B91C1C',
    fontWeight: 'bold',
    fontSize: 12,
  },
  healthyStatusCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#86EFAC',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shieldIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  statusTextCol: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#166534',
  },
  statusSubtitle: {
    fontSize: 12,
    color: '#15803D',
    marginTop: 2,
  },
  demoControlBox: {
    backgroundColor: '#EDE9FE',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: '#C4B5FD',
  },
  demoBoxLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#6D28D9',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  simulateMissedBtn: {
    backgroundColor: '#7C3AED',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  simulateMissedText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionCardPrimary: {
    flex: 1,
    backgroundColor: '#0D9488',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#0D9488',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  actionCardSecondary: {
    flex: 1,
    backgroundColor: '#0284C7',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#0284C7',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  actionCardIcon: {
    fontSize: 22,
    marginBottom: 6,
  },
  actionCardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  actionCardSub: {
    fontSize: 11,
    color: '#E0F2FE',
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  doctorLinkText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0D9488',
  },
  doseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  doseCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  doseTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  doseInstruction: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  takenBadgeChild: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  takenBadgeChildText: {
    color: '#166534',
    fontSize: 11,
    fontWeight: 'bold',
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  pendingBadgeText: {
    color: '#B45309',
    fontSize: 11,
    fontWeight: 'bold',
  },
  scheduledBadge: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  scheduledBadgeText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: 'bold',
  },
  pillListRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  pillChip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  pillChipText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 6,
  },
  cardFooterText: {
    fontSize: 11,
    color: '#0F766E',
    fontStyle: 'italic',
  },
});
