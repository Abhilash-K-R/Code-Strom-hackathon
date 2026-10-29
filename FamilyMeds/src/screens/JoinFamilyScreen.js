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

export default function JoinFamilyScreen({ navigation }) {
  const [familyCode, setFamilyCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    const cleanCode = familyCode.trim().toUpperCase();
    if (!cleanCode || cleanCode.length < 5) {
      Alert.alert('ಅಮಾನ್ಯ ಕೋಡ್ (Invalid Code)', 'ದಯವಿಟ್ಟು 6 ಅಕ್ಷರಗಳ ಕೋಡ್ ನಮೂದಿಸಿ (Please enter the 6-character code).');
      return;
    }

    setLoading(true);
    try {
      const data = await AuthService.joinFamily(cleanCode);
      const user = await AuthService.getUser();

      Alert.alert(
        'ಯಶಸ್ವಿಯಾಗಿದೆ! (Connected)',
        `Joined "${data.family.familyName}". Medications are now synced!`,
        [
          {
            text: 'ಮುಂದುವರಿಯಿರಿ (Continue)',
            onPress: () => {
              if (user && user.role === 'PARENT') {
                navigation.replace('ParentDashboard');
              } else {
                navigation.replace('ChildDashboard');
              }
            },
          },
        ]
      );
    } catch (err) {
      Alert.alert('ದೋಷ (Error)', err.message || 'Could not find or join family.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.titleEmoji}>🔑</Text>
          <Text style={styles.titleKannada}>ಕುಟುಂಬಕ್ಕೆ ಸೇರಿ</Text>
          <Text style={styles.titleEnglish}>Join Your Family Network</Text>
          <Text style={styles.subtitle}>
            Enter the 6-character code shared by your family member
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>ಕುಟುಂಬದ ಕೋಡ್ (6-Character Family Code):</Text>
          <TextInput
            style={styles.codeInput}
            placeholder="FM482A"
            placeholderTextColor="#94A3B8"
            autoCapitalize="characters"
            maxLength={6}
            value={familyCode}
            onChangeText={(t) => setFamilyCode(t.toUpperCase())}
          />

          <Text style={styles.demoHint}>
            💡 Demo Code: <Text style={{ fontWeight: '700', color: '#0D9488' }}>FM482A</Text> (K.R. Family)
          </Text>

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            activeOpacity={0.85}
            disabled={loading}
            onPress={handleJoin}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.btnText}>ಸೇರ್ಪಡೆಗೊಳ್ಳಿ (Join Family) ➔</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchModeBtn}
            onPress={() => navigation.navigate('CreateFamily')}
          >
            <Text style={styles.switchModeText}>Need to create a new family instead? ➔</Text>
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
  titleKannada: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0D9488',
  },
  titleEnglish: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 6,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 10,
  },
  codeInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#0D9488',
    borderRadius: 14,
    paddingVertical: 14,
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: 8,
  },
  demoHint: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 10,
    marginBottom: 24,
    textAlign: 'center',
  },
  btn: {
    backgroundColor: '#0D9488',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  switchModeBtn: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchModeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0284C7',
  },
});
