import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { COLORS } from '../constants/theme';
import { AuthService } from '../services/authService';

export default function CreateFamilyScreen({ navigation }) {
  const [familyName, setFamilyName] = useState('K.R. Family');
  const [createdFamily, setCreatedFamily] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!familyName.trim()) {
      Alert.alert('Required', 'Please enter a name for your family group.');
      return;
    }

    setLoading(true);
    try {
      const data = await AuthService.createFamily(familyName.trim());
      setCreatedFamily(data.family);
    } catch (err) {
      Alert.alert('Family Creation Failed', err.message || 'Could not create family.');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToDashboard = async () => {
    const user = await AuthService.getUser();
    if (user && user.role === 'PARENT') {
      navigation.replace('ParentDashboard');
    } else {
      navigation.replace('ChildDashboard');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.titleEmoji}>👨‍👩‍👧</Text>
          <Text style={styles.title}>ಕುಟುಂಬ ಗುಂಪು ರಚಿಸಿ</Text>
          <Text style={styles.subTitle}>Create Your Family Medicine Network</Text>
        </View>

        {!createdFamily ? (
          <View style={styles.card}>
            <Text style={styles.label}>ಕುಟುಂಬದ ಹೆಸರು (Family Group Name):</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Gowda Family, Mandya"
              placeholderTextColor="#94A3B8"
              value={familyName}
              onChangeText={setFamilyName}
            />
            <Text style={styles.helperText}>
              This group groups Amma's medication schedule and your monitoring dashboard securely.
            </Text>

            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              activeOpacity={0.85}
              disabled={loading}
              onPress={handleCreate}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.btnText}>ರಚಿಸಿ & ಕೋಡ್ ಪಡೆಯಿರಿ (Generate Code) ➔</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchModeBtn}
              onPress={() => navigation.navigate('JoinFamily')}
            >
              <Text style={styles.switchModeText}>Have an existing code? Join Family instead ➔</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.successCard}>
            <Text style={styles.successEmoji}>🎉</Text>
            <Text style={styles.successTitle}>Family Network Activated!</Text>
            <Text style={styles.familyDisplayName}>{createdFamily.familyName}</Text>

            <View style={styles.codeBox}>
              <Text style={styles.codeLabel}>YOUR 6-CHARACTER FAMILY CODE</Text>
              <Text style={styles.codeNumber}>{createdFamily.familyCode}</Text>
            </View>

            <Text style={styles.instructions}>
              👉 Have Amma (or open her phone) and enter code{' '}
              <Text style={{ fontWeight: '800', color: '#0D9488' }}>{createdFamily.familyCode}</Text> to securely pair both phones.
            </Text>

            <TouchableOpacity
              style={styles.proceedBtn}
              activeOpacity={0.85}
              onPress={handleProceedToDashboard}
            >
              <Text style={styles.proceedBtnText}>ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯಿರಿ (Go to Dashboard) ➔</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  titleEmoji: {
    fontSize: 44,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  subTitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0F172A',
  },
  helperText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
    marginBottom: 20,
    lineHeight: 18,
  },
  btn: {
    backgroundColor: '#0284C7',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  switchModeBtn: {
    marginTop: 18,
    alignItems: 'center',
  },
  switchModeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0D9488',
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  successEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  familyDisplayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0284C7',
    marginTop: 4,
  },
  codeBox: {
    backgroundColor: '#F0FDFA',
    borderWidth: 2,
    borderColor: '#0D9488',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginVertical: 20,
    width: '100%',
  },
  codeLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0D9488',
    letterSpacing: 1,
    marginBottom: 6,
  },
  codeNumber: {
    fontSize: 36,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 6,
  },
  instructions: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  proceedBtn: {
    backgroundColor: '#0D9488',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  proceedBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

