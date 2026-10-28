import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { COLORS } from '../constants/theme';
import { MOCK_PARENT } from '../constants/mockData';

export default function LoginScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Brand Hero */}
      <View style={styles.heroSection}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoIcon}>💊</Text>
        </View>
        <Text style={styles.brandTitle}>FamilyMeds</Text>
        <Text style={styles.brandKannada}>ಫ್ಯಾಮಿಲಿ ಮೆಡ್ಸ್ (ದೋಸ್ತ್ ಬಂಧು)</Text>
        <Text style={styles.tagline}>
          Village parent takes it. City child knows it.
        </Text>
      </View>

      {/* Role Selection Container */}
      <View style={styles.roleContainer}>
        <Text style={styles.selectPrompt}>Select your role to continue:</Text>

        {/* Parent Role Card */}
        <TouchableOpacity
          style={styles.parentCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('ParentDashboard')}
        >
          <View style={styles.cardIconBoxParent}>
            <Text style={styles.cardEmoji}>👵</Text>
          </View>
          <View style={styles.cardTextCol}>
            <Text style={styles.cardTitleKannada}>ನಾನು ಪೋಷಕರು (Parent Mode)</Text>
            <Text style={styles.cardSubtitle}>
              Amma ({MOCK_PARENT.location}) • Large text, Kannada voice alarms
            </Text>
          </View>
          <Text style={styles.arrowGreen}>➔</Text>
        </TouchableOpacity>

        {/* Child Role Card */}
        <TouchableOpacity
          style={styles.childCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('ChildDashboard')}
        >
          <View style={styles.cardIconBoxChild}>
            <Text style={styles.cardEmoji}>📱</Text>
          </View>
          <View style={styles.cardTextCol}>
            <Text style={styles.cardTitle}>Child / Caregiver Mode</Text>
            <Text style={styles.cardSubtitle}>
              Abhilash (Bengaluru) • Remote setup, 30-min missed alerts
            </Text>
          </View>
          <Text style={styles.arrowBlue}>➔</Text>
        </TouchableOpacity>

        {/* Fast Alarm Test Button for Judges */}
        <TouchableOpacity
          style={styles.directAlarmTestBtn}
          onPress={() => navigation.navigate('Alarm')}
        >
          <Text style={styles.directAlarmText}>⚡ Quick Test: Open Live Alarm Screen</Text>
        </TouchableOpacity>
      </View>

      {/* Footer Info */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Team Elite Evolvers (MHC09) • CODE STORM 2026
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'space-between',
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  logoBadge: {
    width: 70,
    height: 70,
    borderRadius: 24,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: '#0D9488',
  },
  logoIcon: {
    fontSize: 34,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  brandKannada: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0D9488',
    marginTop: 2,
  },
  tagline: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 6,
    textAlign: 'center',
  },
  roleContainer: {
    paddingHorizontal: 20,
  },
  selectPrompt: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 14,
    textAlign: 'center',
  },
  parentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: '#10B981', // Green
    shadowColor: '#10B981',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  childCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#0284C7', // Blue
    shadowColor: '#0284C7',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  cardIconBoxParent: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardIconBoxChild: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardEmoji: {
    fontSize: 26,
  },
  cardTextCol: {
    flex: 1,
  },
  cardTitleKannada: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  arrowGreen: {
    fontSize: 20,
    color: '#10B981',
    fontWeight: 'bold',
  },
  arrowBlue: {
    fontSize: 20,
    color: '#0284C7',
    fontWeight: 'bold',
  },
  directAlarmTestBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  directAlarmText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0D9488',
  },
  footer: {
    paddingBottom: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
