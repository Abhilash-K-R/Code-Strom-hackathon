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
  Image,
  Alert,
} from 'react-native';
import { COLORS } from '../constants/theme';
import { StorageService } from '../services/storageService';

export default function AddMedicineScreen({ navigation }) {
  const [name, setName] = useState('Thyronorm 50mcg');
  const [kannadaLabel, setKannadaLabel] = useState('ಥೈರಾಯ್ಡ್ ಮಾತ್ರೆ (Thyroid Tab)');
  const [selectedSlot, setSelectedSlot] = useState('Morning');
  const [time, setTime] = useState('07:30 AM');
  const [timing, setTiming] = useState('Before Breakfast');
  const [photoSelected, setPhotoSelected] = useState(true);

  const samplePhoto = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80';

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a medicine name.");
      return;
    }

    await StorageService.addMedicine({
      name,
      kannadaLabel,
      selectedSlot,
      time,
      timing,
      photo: samplePhoto,
      dosage: '1 Tablet',
    });

    Alert.alert(
      "✅ Medicine Saved & Synced",
      `"${name}" scheduled for ${time} (${selectedSlot}). Saved to local storage and active for Amma.`,
      [{ text: "OK", onPress: () => navigation.goBack() }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add New Medicine</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Blister Photo Picker Card */}
        <Text style={styles.inputLabel}>1. Tablet Strip Photo (For Amma's visual match):</Text>
        <View style={styles.photoContainer}>
          {photoSelected ? (
            <View style={styles.previewBox}>
              <Image source={{ uri: samplePhoto }} style={styles.photoPreview} />
              <TouchableOpacity
                style={styles.changePhotoBtn}
                onPress={() => Alert.alert("Camera Simulation", "Photo of blister strip captured successfully.")}
              >
                <Text style={styles.changePhotoText}>📷 Re-snap Blister Strip</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.uploadPlaceholder}
              onPress={() => setPhotoSelected(true)}
            >
              <Text style={styles.cameraIcon}>📸</Text>
              <Text style={styles.uploadText}>Tap to take photo of tablet strip</Text>
              <Text style={styles.uploadSub}>Helps parent identify without reading English</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Form Inputs */}
        <Text style={styles.inputLabel}>2. Medicine Name (Clinical):</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Telmisartan 40mg"
        />

        <Text style={styles.inputLabel}>3. Simple Name for Amma (Kannada TTS):</Text>
        <TextInput
          style={styles.input}
          value={kannadaLabel}
          onChangeText={setKannadaLabel}
          placeholder="e.g. ಬಿಪಿ ಮಾತ್ರೆ (BP Tablet)"
        />

        {/* Time Slot Selector */}
        <Text style={styles.inputLabel}>4. Time Slot:</Text>
        <View style={styles.slotRow}>
          {['Morning', 'Afternoon', 'Night'].map((slot) => (
            <TouchableOpacity
              key={slot}
              style={[styles.slotTab, selectedSlot === slot && styles.slotTabActive]}
              onPress={() => {
                setSelectedSlot(slot);
                if (slot === 'Morning') setTime('09:00 AM');
                if (slot === 'Afternoon') setTime('01:30 PM');
                if (slot === 'Night') setTime('08:30 PM');
              }}
            >
              <Text style={[styles.slotTabText, selectedSlot === slot && styles.slotTabTextActive]}>
                {slot}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.inputLabel}>5. Schedule Time & Food Timing:</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1, marginRight: 8 }]}
            value={time}
            onChangeText={setTime}
            placeholder="Time (e.g. 09:00 AM)"
          />
          <TextInput
            style={[styles.input, { flex: 1.2 }]}
            value={timing}
            onChangeText={setTiming}
            placeholder="After Breakfast"
          />
        </View>

        <View style={{ height: 20 }} />

        {/* Save Button */}
        <TouchableOpacity style={styles.saveBtn} activeOpacity={0.85} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save & Sync to Amma's Phone</Text>
        </TouchableOpacity>
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
  content: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  photoContainer: {
    marginBottom: 10,
  },
  previewBox: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#0D9488',
    backgroundColor: '#0F172A',
  },
  photoPreview: {
    width: '100%',
    height: 160,
  },
  changePhotoBtn: {
    backgroundColor: '#0D9488',
    paddingVertical: 10,
    alignItems: 'center',
  },
  changePhotoText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  uploadPlaceholder: {
    height: 140,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#94A3B8',
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  cameraIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  uploadSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  slotRow: {
    flexDirection: 'row',
    gap: 8,
  },
  slotTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  slotTabActive: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  slotTabText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#475569',
  },
  slotTabTextActive: {
    color: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
  },
  saveBtn: {
    backgroundColor: '#0D9488',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#0D9488',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
