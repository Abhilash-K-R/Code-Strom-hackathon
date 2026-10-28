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
import { MOCK_DOCTOR_STATS, MOCK_PARENT, MOCK_SLOTS } from '../constants/mockData';

export default function DoctorViewScreen({ navigation }) {
  // 14-day sample compliance row (Green = Taken, Yellow = Late, Red = Missed)
  const fourteenDays = [
    { day: 'D1', status: 'taken' },
    { day: 'D2', status: 'taken' },
    { day: 'D3', status: 'taken' },
    { day: 'D4', status: 'missed' },
    { day: 'D5', status: 'taken' },
    { day: 'D6', status: 'taken' },
    { day: 'D7', status: 'taken' },
    { day: 'D8', status: 'late' },
    { day: 'D9', status: 'taken' },
    { day: 'D10', status: 'taken' },
    { day: 'D11', status: 'missed' },
    { day: 'D12', status: 'taken' },
    { day: 'D13', status: 'taken' },
    { day: 'D14', status: 'taken' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Doctor View (ಕ್ಲಿನಿಕಲ್ ಚಾರ್ಟ್)</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Patient Identity Clinical Card */}
        <View style={styles.patientCard}>
          <View style={styles.patientAvatar}>
            <Text style={styles.avatarEmoji}>🩺</Text>
          </View>
          <View>
            <Text style={styles.patientName}>Patient: {MOCK_PARENT.name} ({MOCK_PARENT.kannadaName})</Text>
            <Text style={styles.patientMeta}>Age: {MOCK_PARENT.age} yrs • Location: {MOCK_PARENT.location}</Text>
            <Text style={styles.patientMeta}>Caregiver: {MOCK_PARENT.linkedChild}</Text>
          </View>
        </View>

        {/* EXACT STATS AS INSTRUCTED: COUNTS ONLY (NO % FORMULAS) */}
        <Text style={styles.sectionTitle}>14-Day Compliance Breakdown:</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statBox, { borderColor: '#0D9488' }]}>
            <Text style={[styles.statNum, { color: '#0D9488' }]}>{MOCK_DOCTOR_STATS.daysTracked}</Text>
            <Text style={styles.statLabel}>Days Tracked</Text>
          </View>

          <View style={[styles.statBox, { borderColor: '#16A34A' }]}>
            <Text style={[styles.statNum, { color: '#16A34A' }]}>{MOCK_DOCTOR_STATS.taken}</Text>
            <Text style={styles.statLabel}>Taken On-Time</Text>
          </View>

          <View style={[styles.statBox, { borderColor: '#F59E0B' }]}>
            <Text style={[styles.statNum, { color: '#F59E0B' }]}>{MOCK_DOCTOR_STATS.late}</Text>
            <Text style={styles.statLabel}>Late</Text>
          </View>

          <View style={[styles.statBox, { borderColor: '#EF4444' }]}>
            <Text style={[styles.statNum, { color: '#EF4444' }]}>{MOCK_DOCTOR_STATS.missed}</Text>
            <Text style={styles.statLabel}>Missed</Text>
          </View>
        </View>

        {/* 14-Day Visual Timeline Matrix */}
        <Text style={styles.sectionTitle}>Daily Record Matrix (Past 14 Days):</Text>
        <View style={styles.matrixContainer}>
          <View style={styles.matrixRow}>
            {fourteenDays.map((item, idx) => {
              let dotBg = '#16A34A'; // Taken
              if (item.status === 'late') dotBg = '#F59E0B';
              if (item.status === 'missed') dotBg = '#EF4444';
              return (
                <View key={idx} style={styles.matrixItem}>
                  <View style={[styles.matrixDot, { backgroundColor: dotBg }]} />
                  <Text style={styles.matrixDayText}>{item.day}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#16A34A' }]} />
              <Text style={styles.legendText}>Taken ({MOCK_DOCTOR_STATS.taken})</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.legendText}>Late ({MOCK_DOCTOR_STATS.late})</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.legendText}>Missed ({MOCK_DOCTOR_STATS.missed})</Text>
            </View>
          </View>
        </View>

        {/* Current Active Prescriptions Table */}
        <Text style={styles.sectionTitle}>Active Daily Prescriptions:</Text>
        <View style={styles.prescriptionBox}>
          {MOCK_SLOTS.flatMap(s => s.medicines).map((med, i) => (
            <View key={med.id} style={[styles.prescRow, i > 0 && styles.prescBorderTop]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.prescName}>{med.name} ({med.genericName})</Text>
                <Text style={styles.prescKannada}>{med.kannadaName}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.prescDosage}>{med.dosage}</Text>
                <Text style={styles.prescTiming}>{med.timing}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Clinical Disclaimer */}
        <View style={styles.clinicalNotice}>
          <Text style={styles.clinicalNoticeTitle}>Notice for Consulting Doctor:</Text>
          <Text style={styles.clinicalNoticeText}>
            This record reflects timestamped patient confirmations. The application does NOT provide dosage advice, AI recommendations, or clinical diagnoses. All medical decisions remain under your discretion.
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
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    padding: 6,
  },
  backText: {
    color: '#0D9488',
    fontSize: 15,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  content: {
    padding: 16,
  },
  patientCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  patientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarEmoji: {
    fontSize: 24,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  patientMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 10,
    marginTop: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  statNum: {
    fontSize: 22,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  matrixContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  matrixRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  matrixItem: {
    alignItems: 'center',
    width: '13%',
    marginBottom: 10,
  },
  matrixDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginBottom: 4,
  },
  matrixDayText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748B',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  prescriptionBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 16,
  },
  prescRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  prescBorderTop: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  prescName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  prescKannada: {
    fontSize: 12,
    color: '#0D9488',
    marginTop: 1,
  },
  prescDosage: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#16A34A',
  },
  prescTiming: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  clinicalNotice: {
    backgroundColor: '#F1F5F9',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  clinicalNoticeTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 4,
  },
  clinicalNoticeText: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
});
