# FamilyMeds Backend API (DoseBandhu)

Minimal Express + MongoDB Atlas backend for **FamilyMeds (DoseBandhu)**.

Built strictly according to Phase 3 requirements:
- **Node.js + Express**
- **MongoDB Atlas** (via Mongoose)
- **Only 4 Endpoints**:
  - `POST /medicines`
  - `GET /medicines`
  - `POST /history`
  - `GET /history`
- **Zero bloat**: No OTP, no JWT, no Redis, no WebSockets, no BullMQ.
- **Fail-Safe Architecture**: If MongoDB Atlas URI is not yet configured or unreachable, the server continues running in high-reliability in-memory fallback mode so demonstrations never fail.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure MongoDB Atlas (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your connection string:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/familymeds?retryWrites=true&w=majority
```
*(If left blank, the server safely runs in local fallback mode with pre-seeded data).*

### 3. Run the Server
```bash
npm start
```
Server runs at `http://localhost:5000`.

### 4. Run Endpoint Verification Test
```bash
npm test
```

---

## 📡 API Reference

### Medicines

#### `GET /medicines`
Returns the list of scheduled medicines.
```json
[
  {
    "id": "med-1",
    "name": "BP Tablet",
    "genericName": "Telmisartan 40mg",
    "kannadaName": "ಬಿಪಿ ಮಾತ್ರೆ",
    "timing": "After Breakfast",
    "dosage": "1 Tablet",
    "color": "#3B82F6",
    "slotTime": "09:00 AM",
    "slotLabel": "ಬೆಳಗಿನ ಮಾತ್ರೆಗಳು (Morning Medicines)",
    "slotId": "slot-morning",
    "status": "PENDING"
  }
]
```

#### `POST /medicines`
Adds a new medicine.
```json
{
  "name": "Thyronorm 50mcg",
  "genericName": "Thyronorm",
  "kannadaName": "ಥೈರಾಯ್ಡ್ ಮಾತ್ರೆ",
  "timing": "Before Breakfast",
  "dosage": "1 Tablet",
  "color": "#0D9488",
  "slotTime": "07:30 AM",
  "slotLabel": "Morning Medicines",
  "slotId": "slot-morning"
}
```

---

### Dose History

#### `GET /history`
Returns dose confirmation history records (newest first).
```json
[
  {
    "date": "Today (28 Oct)",
    "time": "09:00 AM",
    "slot": "Morning Medicines",
    "medicines": "BP Tablet, Sugar Tablet",
    "status": "TAKEN",
    "takenAt": "09:08 AM"
  }
]
```

#### `POST /history`
Records a new dose confirmation when Amma presses **TAKEN**.
```json
{
  "date": "Today (Just Now)",
  "time": "09:00 AM",
  "slot": "Morning Medicines",
  "medicines": "BP Tablet, Sugar Tablet",
  "status": "TAKEN",
  "takenAt": "09:08 AM (Confirmed by Parent)"
}
```
