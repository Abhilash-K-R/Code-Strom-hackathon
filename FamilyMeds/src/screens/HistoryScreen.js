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
import { MOCK_HISTORY } from '../constants/mockData';
import { StorageService } from '../services/storageService';

export default function HistoryScreen({ navigation }) {
  const [filter, setFilter] = useState('ALL');
  const [historyList, setHistoryList] = useState(MOCK_HISTORY);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      StorageService.getHistory().then((data) => {
        if (isMounted && data) {
          setHistoryList(data);
        }
      });
      return () => {
        isMounted = false;
      };
    }, [])
  );

  const filteredData = historyList.filter((item) => {
    if (filter === 'ALL') return true;
    return item.status === filter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'TAKEN':
        return { bg: '#DCFCE7', text: '#166534', label: '✓ TAKEN' };
      case 'LATE':
        return { bg: '#FEF3C7', text: '#92400E', label: '⏱ LATE' };
      case 'MISSED':
        return { bg: '#FEE2E2', text: '#991B1B', label: '✕ MISSED' };
      default:
        return { bg: '#F1F5F9', text: '#475569', label: status };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Medication History</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {['ALL', 'TAKEN', 'LATE', 'MISSED'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {filteredData.map((item, idx) => {
          const badge = getStatusBadge(item.status);
          return (
            <View key={idx} style={styles.historyCard}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardDate}>{item.date}</Text>
                  <Text style={styles.cardSlot}>{item.slot} ({item.time})</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                  <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                    {badge.label}
                  </Text>
                </View>
              </View>

              <Text style={styles.medicineText}>💊 {item.medicines}</Text>
              
              <View style={styles.timestampRow}>
                <Text style={styles.timestampLabel}>Log Record:</Text>
                <Text style={styles.timestampValue}>{item.takenAt}</Text>
              </View>
            </View>
          );
        })}
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#0D9488',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  content: {
    padding: 16,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardDate: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  cardSlot: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  medicineText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
    marginBottom: 8,
  },
  timestampRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 6,
  },
  timestampLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginRight: 6,
  },
  timestampValue: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
});
