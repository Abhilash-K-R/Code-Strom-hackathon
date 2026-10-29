import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../constants/theme';
import { AuthService } from '../services/authService';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CHILD'); // CHILD or PARENT
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Required Fields', 'Please fill in your name, email, and password.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Password Too Short', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const data = await AuthService.register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });

      Alert.alert(
        'Account Created! 🎉',
        `Welcome ${data.user.name}. Let's set up your family network.`,
        [
          {
            text: 'Continue',
            onPress: () => {
              if (role === 'CHILD') {
                navigation.replace('CreateFamily');
              } else {
                navigation.replace('JoinFamily');
              }
            },
          },
        ]
      );
    } catch (err) {
      Alert.alert('Registration Failed', err.message || 'Could not register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Branding */}
        <View style={styles.brandHero}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>💊</Text>
          </View>
          <Text style={styles.brandTitle}>FamilyMeds</Text>
          <Text style={styles.brandSubtitle}>ಖಾತೆ ರಚಿಸಿ (Create Account)</Text>
          <Text style={styles.tagline}>Secure Multi-Family Medicine Care</Text>
        </View>

        {/* Role Selector */}
        <Text style={styles.sectionLabel}>ನಿಮ್ಮ ಪಾತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ (Select Your Role):</Text>
        <View style={styles.roleRow}>
          {/* Child Card */}
          <TouchableOpacity
            style={[styles.roleCard, role === 'CHILD' && styles.roleCardActiveChild]}
            activeOpacity={0.85}
            onPress={() => setRole('CHILD')}
          >
            <Text style={styles.roleEmoji}>📱</Text>
            <Text style={[styles.roleTitle, role === 'CHILD' && styles.roleTitleActiveChild]}>
              Child / Caregiver
            </Text>
            <Text style={styles.roleSub}>Schedules pills, monitors Amma</Text>
          </TouchableOpacity>

          {/* Parent Card */}
          <TouchableOpacity
            style={[styles.roleCard, role === 'PARENT' && styles.roleCardActiveParent]}
            activeOpacity={0.85}
            onPress={() => setRole('PARENT')}
          >
            <Text style={styles.roleEmoji}>👵</Text>
            <Text style={[styles.roleTitle, role === 'PARENT' && styles.roleTitleActiveParent]}>
              ಪೋಷಕರು (Parent)
            </Text>
            <Text style={styles.roleSub}>Large text, voice alarms</Text>
          </TouchableOpacity>
        </View>

        {/* Inputs Form */}
        <View style={styles.formCard}>
          <Text style={styles.inputLabel}>ಪೂರ್ಣ ಹೆಸರು (Full Name)</Text>
          <TextInput
            style={styles.input}
            placeholder={role === 'CHILD' ? 'e.g. Abhilash' : 'e.g. Amma (Gowramma)'}
            placeholderTextColor="#94A3B8"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.inputLabel}>ಇಮೇಲ್ ವಿಳಾಸ (Email Address)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. user@familymeds.in"
            placeholderTextColor="#94A3B8"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.inputLabel}>ಪಾಸ್‌ವರ್ಡ್ (Password - min 6 characters)</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#94A3B8"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            activeOpacity={0.85}
            disabled={loading}
            onPress={handleRegister}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>ಖಾತೆ ರಚಿಸಿ (Register Account) ➔</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Navigation to Login */}
        <View style={styles.loginRedirectRow}>
          <Text style={styles.alreadyText}>Already have a family account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>ಲಾಗ್ ಇನ್ (Log In)</Text>
          </TouchableOpacity>
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
    paddingBottom: 40,
  },
  brandHero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E6FFFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
  iconEmoji: {
    fontSize: 28,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
  },
  brandSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D9488',
    marginTop: 2,
  },
  tagline: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 12,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  roleCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  roleCardActiveChild: {
    borderColor: '#0284C7',
    backgroundColor: '#F0F9FF',
  },
  roleCardActiveParent: {
    borderColor: '#0D9488',
    backgroundColor: '#F0FDF4',
  },
  roleEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  roleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
  },
  roleTitleActiveChild: {
    color: '#0284C7',
  },
  roleTitleActiveParent: {
    color: '#0D9488',
  },
  roleSub: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  submitBtn: {
    backgroundColor: '#0D9488',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 24,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loginRedirectRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    gap: 6,
  },
  alreadyText: {
    fontSize: 14,
    color: '#64748B',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0D9488',
  },
});

