# How to Run FamilyMeds (DoseBandhu)

**Team Name:** Elite Evolvers  
**Team ID:** MHC09  
**Event:** CODE STORM 2026 (Innovation Ignite Symposium 2.0)  
**Domain:** Healthcare Technology  

---

## ⚡ Quick Start (In Under 2 Minutes)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18, v20, or v22 recommended)
- [npm](https://www.npmjs.com/) (installed automatically with Node)

---

## Step 1: Install Dependencies

### Windows:
Double-click `install.bat` in the root folder, OR run:
```bash
cd FamilyMeds
npm install
```

### macOS / Linux:
Run in terminal:
```bash
chmod +x install.sh
./install.sh
```

---

## Step 2: Launch Application

Navigate into the project directory:
```bash
cd FamilyMeds
```

### Option A: Open in Laptop Web Browser (Recommended for quick demo)
```bash
npm run web
```
This compiles the Expo Web bundle and opens `http://localhost:8081` in your browser.

### Option B: Open on Android / iOS Phone (Expo Go)
```bash
npm start
```
1. Install **Expo Go** from Google Play Store or Apple App Store.
2. Scan the terminal QR code using Expo Go (Android) or the native Camera app (iOS).

---

## 🎬 Live Hackathon Demo Walkthrough (30 Seconds)

1. **Role Select Screen:** Tap **"ನಾನು ಪೋಷಕರು (Parent Mode)"**.
2. **Parent Dashboard:** Notice the large Kannada fonts, active 09:00 AM dose countdown, and zero English clutter.
3. **Trigger Alarm:** Tap the bright teal button **"ಅಲಾರಂ ಪರೀಕ್ಷಿಸಿ (Simulate 09:00 AM)"**.
   - The full-screen high-contrast alarm wakes up.
   - On-device Kannada Text-to-Speech (TTS) speaks: *"ಅಮ್ಮಾ, ಬೆಳಗಿನ ಬಿಪಿ ಮತ್ತು ಸಕ್ಕರೆ ಕಾಯಿಲೆ ಮಾತ್ರೆ ತೆಗೆದುಕೊಳ್ಳಿ"*.
   - Clear high-resolution photo of the physical blister strip appears for visual recognition.
   - Tap the giant green **"ತೆಗೆದುಕೊಂಡೆ / TAKEN"** button to log both morning tablets at once.
4. **Switch to Child Mode:** Tap **"ಬದಲಿಸಿ (Switch)"** on top right ➔ Choose **"Child / Caregiver Mode"**.
5. **Simulate 30-Min Missed Alert:** Tap the purple demo control **"Simulate 30-min Missed Alert Trigger"**.
   - Watch the card flash emergency RED with an instant **"Call Amma Now"** button.
6. **Doctor View:** Tap **"Doctor View"** to inspect the 14-day compliance chart (**Days Tracked: 14 | Taken: 11 | Late: 1 | Missed: 2**).
