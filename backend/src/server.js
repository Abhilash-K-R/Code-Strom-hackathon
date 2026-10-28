require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, getIsConnected } = require('./config/db');
const Medicine = require('./models/Medicine');
const History = require('./models/History');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-Memory fallback store
const inMemoryStore = {
  medicines: [
    {
      id: 'med-1',
      name: 'BP Tablet',
      genericName: 'Telmisartan 40mg',
      kannadaName: 'ಬಿಪಿ ಮಾತ್ರೆ',
      timing: 'After Breakfast',
      dosage: '1 Tablet',
      color: '#3B82F6',
      photo: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
      slotTime: '09:00 AM',
      slotLabel: 'ಬೆಳಗಿನ ಮಾತ್ರೆಗಳು (Morning Medicines)',
      slotId: 'slot-morning',
      status: 'PENDING',
    },
    {
      id: 'med-2',
      name: 'Sugar Tablet',
      genericName: 'Metformin 500mg',
      kannadaName: 'ಸಕ್ಕರೆ ಕಾಯಿಲೆ ಮಾತ್ರೆ',
      timing: 'After Breakfast',
      dosage: '1 Tablet',
      color: '#10B981',
      photo: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80',
      slotTime: '09:00 AM',
      slotLabel: 'ಬೆಳಗಿನ ಮಾತ್ರೆಗಳು (Morning Medicines)',
      slotId: 'slot-morning',
      status: 'PENDING',
    },
    {
      id: 'med-3',
      name: 'Calcium Tablet',
      genericName: 'Shelcal 500mg',
      kannadaName: 'ಕ್ಯಾಲ್ಸಿಯಂ ಮಾತ್ರೆ',
      timing: 'After Dinner',
      dosage: '1 Tablet',
      color: '#F59E0B',
      photo: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80',
      slotTime: '08:30 PM',
      slotLabel: 'ರಾತ್ರಿಯ ಮಾತ್ರೆಗಳು (Night Medicines)',
      slotId: 'slot-night',
      status: 'SCHEDULED',
    },
  ],
  history: [
    {
      id: 'hist-1',
      date: 'Today (28 Oct)',
      time: '09:00 AM',
      slot: 'Morning Medicines',
      medicines: 'BP Tablet, Sugar Tablet',
      status: 'TAKEN',
      takenAt: '09:08 AM',
    },
    {
      id: 'hist-2',
      date: 'Yesterday (27 Oct)',
      time: '08:30 PM',
      slot: 'Night Medicines',
      medicines: 'Calcium Tablet',
      status: 'TAKEN',
      takenAt: '08:35 PM',
    },
    {
      id: 'hist-3',
      date: 'Yesterday (27 Oct)',
      time: '09:00 AM',
      slot: 'Morning Medicines',
      medicines: 'BP Tablet, Sugar Tablet',
      status: 'TAKEN',
      takenAt: '09:12 AM',
    },
    {
      id: 'hist-4',
      date: '26 Oct',
      time: '09:00 AM',
      slot: 'Morning Medicines',
      medicines: 'BP Tablet, Sugar Tablet',
      status: 'LATE',
      takenAt: '09:42 AM (After child call)',
    },
    {
      id: 'hist-5',
      date: '25 Oct',
      time: '08:30 PM',
      slot: 'Night Medicines',
      medicines: 'Calcium Tablet',
      status: 'MISSED',
      takenAt: 'Not Taken',
    },
  ],
};

// Auto-seed MongoDB Atlas if empty
const seedDatabaseIfEmpty = async () => {
  try {
    const medCount = await Medicine.countDocuments();
    if (medCount === 0) {
      console.log('🌱 Seeding initial medicines into MongoDB Atlas...');
      await Medicine.insertMany(inMemoryStore.medicines.map((m) => {
        const { id, ...rest } = m;
        return rest;
      }));
      console.log('✅ Initial medicines seeded.');
    }

    const histCount = await History.countDocuments();
    if (histCount === 0) {
      console.log('🌱 Seeding initial dose history into MongoDB Atlas...');
      await History.insertMany(inMemoryStore.history.map((h) => {
        const { id, ...rest } = h;
        return rest;
      }));
      console.log('✅ Initial dose history seeded.');
    }
  } catch (err) {
    console.warn('⚠️ Seeding error:', err.message);
  }
};

// Root Health Check
app.get('/', (req, res) => {
  res.json({
    app: 'FamilyMeds API (DoseBandhu)',
    status: 'online',
    database: getIsConnected() ? 'MongoDB Atlas (Connected)' : 'Local In-Memory Mode',
    endpoints: [
      'POST /medicines',
      'GET /medicines',
      'POST /history',
      'GET /history',
    ],
  });
});

// 1. GET /medicines
app.get('/medicines', async (req, res) => {
  try {
    if (getIsConnected()) {
      const medicines = await Medicine.find().sort({ createdAt: 1 });
      return res.status(200).json(medicines);
    }
    return res.status(200).json(inMemoryStore.medicines);
  } catch (error) {
    console.error('GET /medicines error:', error);
    res.status(500).json({ error: 'Failed to retrieve medicines' });
  }
});

// 2. POST /medicines
app.post('/medicines', async (req, res) => {
  try {
    const { name, genericName, kannadaName, timing, dosage, color, photo, slotTime, slotLabel, slotId } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Medicine name is required' });
    }

    const medicineData = {
      name: name.trim(),
      genericName: genericName ? genericName.trim() : name.trim(),
      kannadaName: kannadaName ? kannadaName.trim() : name.trim(),
      timing: timing || 'After Food',
      dosage: dosage || '1 Tablet',
      color: color || '#0D9488',
      photo: photo || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
      slotTime: slotTime || '09:00 AM',
      slotLabel: slotLabel || 'Morning Medicines',
      slotId: slotId || `slot-${(slotLabel || 'morning').toLowerCase()}`,
      status: 'SCHEDULED',
    };

    if (getIsConnected()) {
      const newMed = new Medicine(medicineData);
      const savedMed = await newMed.save();
      return res.status(201).json(savedMed);
    }

    const newMed = {
      id: `med-${Date.now()}`,
      ...medicineData,
    };
    inMemoryStore.medicines.push(newMed);
    return res.status(201).json(newMed);
  } catch (error) {
    console.error('POST /medicines error:', error);
    res.status(500).json({ error: 'Failed to save medicine' });
  }
});

// 3. GET /history
app.get('/history', async (req, res) => {
  try {
    if (getIsConnected()) {
      const history = await History.find().sort({ createdAt: -1 });
      return res.status(200).json(history);
    }
    return res.status(200).json(inMemoryStore.history);
  } catch (error) {
    console.error('GET /history error:', error);
    res.status(500).json({ error: 'Failed to retrieve dose history' });
  }
});

// 4. POST /history
app.post('/history', async (req, res) => {
  try {
    const { date, time, slot, medicines, status, takenAt } = req.body;

    if (!medicines) {
      return res.status(400).json({ error: 'Medicine details required' });
    }

    const historyData = {
      date: date || 'Today',
      time: time || '09:00 AM',
      slot: slot || 'Morning Medicines',
      medicines,
      status: status || 'TAKEN',
      takenAt: takenAt || 'Confirmed by Parent',
    };

    if (getIsConnected()) {
      const newHist = new History(historyData);
      const savedHist = await newHist.save();
      return res.status(201).json(savedHist);
    }

    const newHist = {
      id: `hist-${Date.now()}`,
      ...historyData,
    };
    inMemoryStore.history.unshift(newHist);
    return res.status(201).json(newHist);
  } catch (error) {
    console.error('POST /history error:', error);
    res.status(500).json({ error: 'Failed to save dose history' });
  }
});

// Start Server
app.listen(PORT, async () => {
  console.log(`===============================================`);
  console.log(`🚀 FamilyMeds API Server running on port ${PORT}`);
  console.log(`📡 Base URL: http://localhost:${PORT}`);
  console.log(`===============================================`);
  const connected = await connectDB();
  if (connected) {
    await seedDatabaseIfEmpty();
  }
});

module.exports = app;
