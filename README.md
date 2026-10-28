# FamilyMeds (DoseBandhu)
### A Family-Connected Medication Safety Loop for Aging Parents in Villages

[![Event](https://img.shields.io/badge/CODE%20STORM-2026-teal.svg)](#)
[![Domain](https://img.shields.io/badge/Domain-Healthcare%20Technology-blue.svg)](#)
[![Team ID](https://img.shields.io/badge/Team%20ID-MHC09-emerald.svg)](#)
[![Stack](https://img.shields.io/badge/Tech-React%20Native%20%7C%20Expo%20%7C%20Node.js-orange.svg)](#)

> *"Village parent takes it. City child knows it."*

---

## 📌 Project Overview

**FamilyMeds** is a zero-text, family-connected medication adherence system designed specifically for elderly rural parents managing chronic conditions (Hypertension, Diabetes) and their adult children working in distant cities.

Instead of expecting non-English-speaking elderly parents to navigate complex smartphone menus, FamilyMeds turns the parent's phone into an **accessible appliance**:
1. At dose time, a loud **Kannada voice prompt** speaks the medicine name.
2. A high-resolution **photo of the physical tablet strip** is displayed so seniors match pills visually with zero confusion.
3. The parent taps **one giant "Taken" button** to confirm all tablets in that time slot.
4. If unconfirmed within **30 minutes**, an automated high-priority emergency alert rings the **child's phone in the city** for immediate family follow-up.
5. All doses are recorded locally and compiled into a clean **14-day clinical chart** for doctor consultations.

---

## 📊 Ground Evidence & Clinical Burden (Official Data)

* **51% Adherence Rate:** Longitudinal Ageing Study in India (LASI, Wave 1) of 2,840+ older adults found medication adherence for chronic illnesses averages just 51%.
* **34.5% Undiagnosed & 34.2% Uncontrolled BP:** National Family Health Survey (NFHS) & ICMR studies show ~68.7% of hypertension in older adults is either undetected or inadequately controlled due to missed doses.
* **Forgetfulness is #1:** ICMR surveys report forgetfulness and visual confusion over similar-looking pill strips as the primary driver of missed medication.
* **Catastrophic Out-of-Pocket Expense:** NSSO (75th Round) data shows a single stroke hospitalisation costs an average of ₹40,360 (median ₹17,140). *(Uncontrolled hypertension elevates stroke risk).*

---

## 💡 The Novelty (Why FamilyMeds is NOT Just a Reminder App)

| Feature | FamilyMeds | Generic Pill Reminders | Google Calendar / Alarms |
| :--- | :---: | :---: | :---: |
| **Local Language Voice (Kannada TTS)** | ✅ Yes (`kn-IN`) | ❌ English text only | ❌ Ringtone only |
| **Visual Blister Strip Photo** | ✅ Yes (Full screen) | ⚠️ Rarely / icon only | ❌ None |
| **Asymmetric Remote Setup** | ✅ Child handles 100% | ❌ Senior must configure | ❌ Senior must configure |
| **30-Min Missed Dose Family Alert** | ✅ Yes (Dead-man switch) | ❌ Stays on patient phone | ❌ Stays on patient phone |
| **14-Day Clinical Doctor Chart** | ✅ Yes (OPD view) | ⚠️ Complex exports | ❌ None |
| **Zero-Text Parent UI (1 Button)** | ✅ Yes (1-tap batch) | ❌ Multiple sub-menus | ❌ Swipe notifications |

> **Judges Pitch Line:**  
> *"Existing reminder apps assume the elderly patient can operate a smartphone app independently. FamilyMeds assumes the parent can only hear, recognize a photo, and press one large button—shifting 100% of cognitive setup to their working child in the city."*

---

## 📱 Application Screens

1. **Role Selector (`LoginScreen`):** 1-tap instant switch between Parent Mode and Child Mode.
2. **Parent Dashboard (`ParentDashboardScreen`):** Large high-contrast Kannada text, active dose countdown, and zero English clutter.
3. **Alarm Screen (`AlarmScreen`):** Full-screen alert with tablet blister photos, on-device Kannada voice prompt, and giant green `ತೆಗೆದುಕೊಂಡೆ / TAKEN` button.
4. **Child Dashboard (`ChildDashboardScreen`):** Live parent status tracking, schedule overview, and interactive **30-min missed-dose simulation**.
5. **Add Medicine Screen (`AddMedicineScreen`):** Child takes photos of blister strips and sets dosage slots remotely.
6. **Medication History (`HistoryScreen`):** Filterable timeline of `TAKEN`, `LATE`, and `MISSED` events.
7. **Doctor View Screen (`DoctorViewScreen`):** Clinical adherence summary: **Days Tracked: 14 | Taken: 11 | Late: 1 | Missed: 2** with visual daily dot matrix.

---

## 🛠️ Technology Stack

- **Frontend:** React Native with Expo (SDK 58)
- **Voice Assistance:** On-device Android Text-to-Speech (TTS) via `expo-speech` (`kn-IN`)
- **State & Local Storage:** React Hooks + `@react-native-async-storage/async-storage`
- **Navigation:** `@react-navigation/native` & `@react-navigation/native-stack`
- **Web Support:** `react-native-web` for instant browser evaluation during presentations

---

## 🚀 How to Run Locally

See complete setup steps in **[RUN.md](RUN.md)**.

```bash
# 1. Navigate to project directory
cd FamilyMeds

# 2. Install dependencies
npm install

# 3. Launch Web Demo (Browser)
npm run web

# 4. Launch on Mobile Phone (Expo Go)
npm start
```

---

## 👥 Team Details — Elite Evolvers (MHC09)

* **Team Leader:** Abhilash K R
* **Team Member:** Laxuman
* **Domain:** Healthcare Technology
* **Event:** CODE STORM 2026 — Innovation Ignite Symposium 2.0
* **Repository:** [https://github.com/Abhilash-K-R/Code-Strom-hackathon.git](https://github.com/Abhilash-K-R/Code-Strom-hackathon.git)
