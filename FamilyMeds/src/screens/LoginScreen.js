import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../constants/theme';
import { AuthService } from '../services/authService';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('amma@familymeds.in');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (overrideEmail, overridePassword) => {
    const targetEmail = overrideEmail || email;
    const targetPassword = overridePassword || password;

    if (!targetEmail.trim() || !targetPassword.trim()) {
      Alert.alert('Required', 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const data = await AuthService.login({
        email: targetEmail.trim(),
        password: targetPassword,
      });

      const { user, family } = data;

      if (!family) {
        if (user.role === 'CHILD') {
          navigation.replace('CreateFamily');
        } else {
          navigation.replace('JoinFamily');
        }
      } else {
        if (user.role === 'PARENT') {
          navigation.replace('ParentDashboard');
        } else {
          navigation.replace('ChildDashboard');
        }
      }
    } catch (err) {
      Alert.alert('Login Failed', err.message || 'Invalid credentials or server offline.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (role) => {
    if (role === 'PARENT') {
      setEmail('amma@familymeds.in');
      setPassword('password123');
      handleLogin('amma@familymeds.in', 'password123');
    } else {
      setEmail('abhilash@familymeds.in');
      setPassword('password123');
      handleLogin('abhilash@familymeds.in', 'password123');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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

        {/* Real Auth Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>ಲಾಗ್ ಇನ್ (Sign In to Your Family)</Text>

          <Text style={styles.inputLabel}>ಇಮೇಲ್ ವಿಳಾಸ (Email)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. user@familymeds.in"
            placeholderTextColor="#94A3B8"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.inputLabel}>ಪಾಸ್‌ವರ್ಡ್ (Password)</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#94A3B8"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            activeOpacity={0.85}
            disabled={loading}
            onPress={() => handleLogin()}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginBtnText}>ಪ್ರವೇಶಿಸಿ (Log In) ➔</Text>
            )}
          </TouchableOpacity>

          {/* Quick Demo Pre-fills for Testing */}
          <Text style={styles.quickTestDivider}>— ತ್ವರಿತ ಡೆಮೊ ಲಾಗಿನ್ (Quick 1-Tap Demo) —</Text>
          <View style={styles.quickRow}>
            <TouchableOpacity
              style={styles.quickParentBtn}
              onPress={() => handleQuickDemo('PARENT')}
            >
              <Text style={styles.quickEmoji}>👵</Text>
              <Text style={styles.quickTextParent}>Amma (Parent)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickChildBtn}
              onPress={() => handleQuickDemo('CHILD')}
            >
              <Text style={styles.quickEmoji}>📱</Text>
              <Text style={styles.quickTextChild}>Abhilash (Child)</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Register Account Button */}
        <TouchableOpacity
          style={styles.registerBox}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.registerPrompt}>ಹೊಸ ಕುಟುಂಬವೇ? (New Family?)</Text>
          <Text style={styles.registerLink}>ಹೊಸ ಖಾತೆ ರಚಿಸಿ (Create Account) ➔</Text>
        </TouchableOpacity>

        {/* Fast Alarm Test Button for Verification */}
        <TouchableOpacity
          style={styles.directAlarmTestBtn}
          onPress={() => navigation.navigate('Alarm')}
        >
          <Text style={styles.directAlarmText}>⚡ Quick Test: Open Live Alarm Screen</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            FamilyMeds v2.0 • Multi-Family Isolated Architecture
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 30,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E6FFFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#99F6E4',
  },
  logoIcon: {
    fontSize: 32,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  brandKannada: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0D9488',
    marginTop: 2,
  },
  tagline: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginTop: 8,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0F172A',
  },
  loginBtn: {
    backgroundColor: '#0D9488',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  quickTestDivider: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 18,
    marginBottom: 12,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickParentBtn: {
    flex: 1,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  quickChildBtn: {
    flex: 1,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  quickEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  quickTextParent: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  quickTextChild: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369A1',
  },
  registerBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  registerPrompt: {
    fontSize: 12,
    color: '#64748B',
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0284C7',
    marginTop: 3,
  },
  directAlarmTestBtn: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  directAlarmText: {
    color: '#B45309',
    fontWeight: '700',
    fontSize: 13,
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    fontSize: 11,
    color: '#94A3B8',
  },
});
