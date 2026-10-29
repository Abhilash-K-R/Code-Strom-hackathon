require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { connectDB, getIsConnected } = require('./config/db');
const User = require('./models/User');
const Family = require('./models/Family');
const FamilyMember = require('./models/FamilyMember');
const Medicine = require('./models/Medicine');
const History = require('./models/History');
const DoseEscalation = require('./models/DoseEscalation');
const { requireAuth, requireFamily, JWT_SECRET } = require('./middleware/auth');
const { sendExpoPushNotification } = require('./utils/pushService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-Memory store for offline fallback / high-reliability execution
const inMemoryStore = {
  users: [],
  families: [],
  familyMembers: [],
  medicines: [],
  history: [],
  doseEscalations: [],
};

// Helper: Generate unique 6-character family code (e.g. FM482A)
const generateFamilyCode = async () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  let unique = false;
  let attempts = 0;

  while (!unique && attempts < 20) {
    attempts++;
    let rand = '';
    for (let i = 0; i < 4; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    code = `FM${rand}`;

    if (getIsConnected()) {
      const existing = await Family.findOne({ familyCode: code });
      if (!existing) unique = true;
    } else {
      const existing = inMemoryStore.families.find((f) => f.familyCode === code);
      if (!existing) unique = true;
    }
  }

  return code;
};

// Helper: Dispatches push notification to all Child/Caregiver members of a family
const notifyFamilyCaregivers = async (familyId, { title, body, data = {}, priority = 'high' }) => {
  try {
    let childPushTokens = [];
    if (getIsConnected()) {
      const memberships = await FamilyMember.find({ familyId, role: 'CHILD' });
      const userIds = memberships.map((m) => m.userId);
      const childUsers = await User.find({ _id: { $in: userIds }, pushToken: { $ne: '' } });
      childPushTokens = childUsers.map((u) => u.pushToken).filter(Boolean);
    } else {
      const childMembers = inMemoryStore.familyMembers.filter(
        (m) => m.familyId === familyId && m.role === 'CHILD'
      );
      const userIds = childMembers.map((m) => m.userId);
      const childUsers = inMemoryStore.users.filter(
        (u) => userIds.includes(u.id) && u.pushToken && u.pushToken.trim() !== ''
      );
      childPushTokens = childUsers.map((u) => u.pushToken);
    }

    if (childPushTokens.length > 0) {
      await sendExpoPushNotification(childPushTokens, { title, body, data, priority });
    } else {
      console.log(`[PushService] No registered device tokens for family caregivers in [${familyId}]. Notification: "${title}: ${body}"`);
    }
  } catch (err) {
    console.warn('[PushService] notifyFamilyCaregivers error:', err.message);
  }
};

// Automated 30-Minute Missed Dose Escalation Worker
const runEscalationCycle = async () => {
  try {
    const now = Date.now();

    if (getIsConnected()) {
      // Find pending escalations whose 30-min window has expired
      const pendingDoses = await DoseEscalation.find({
        status: 'PENDING',
        escalateAtEpoch: { $lte: now },
      });

      for (const dose of pendingDoses) {
        dose.status = 'ESCALATED';
        dose.escalatedAt = new Date();
        await dose.save();

        // 1. Append MISSED history entry
        await History.create({
          familyId: dose.familyId,
          date: 'Today',
          time: dose.scheduledTime,
          slot: dose.slotLabel,
          medicines: dose.medicines,
          status: 'MISSED',
          takenAt: 'Not Taken (Escalated after 30 mins)',
        });

        // 2. Dispatch urgent push notification to caregivers
        console.log(`🚨 [EscalationEngine] 30-Minute Missed Dose triggered for ${dose.slotLabel} in family ${dose.familyId}`);
        await notifyFamilyCaregivers(dose.familyId.toString(), {
          title: '🚨 ತುರ್ತು ಎಚ್ಚರಿಕೆ (Emergency Alert)',
          body: `Amma did NOT confirm ${dose.slotLabel} (${dose.medicines}) for 30 minutes! Tap to call Amma now.`,
          data: { type: 'MISSED_DOSE_ESCALATION', slotId: dose.slotId, time: dose.scheduledTime },
          priority: 'max',
        });
      }
    } else {
      // In-Memory store escalation cycle
      const pendingDoses = inMemoryStore.doseEscalations.filter(
        (d) => d.status === 'PENDING' && d.escalateAtEpoch <= now
      );

      for (const dose of pendingDoses) {
        dose.status = 'ESCALATED';
        dose.escalatedAt = new Date();

        inMemoryStore.history.unshift({
          id: `hist-${Date.now()}`,
          familyId: dose.familyId,
          date: 'Today',
          time: dose.scheduledTime,
          slot: dose.slotLabel,
          medicines: dose.medicines,
          status: 'MISSED',
          takenAt: 'Not Taken (Escalated after 30 mins)',
          createdAt: new Date(),
        });

        console.log(`🚨 [EscalationEngine] 30-Minute Missed Dose triggered for ${dose.slotLabel} in family ${dose.familyId}`);
        await notifyFamilyCaregivers(dose.familyId, {
          title: '🚨 ತುರ್ತು ಎಚ್ಚರಿಕೆ (Emergency Alert)',
          body: `Amma did NOT confirm ${dose.slotLabel} (${dose.medicines}) for 30 minutes! Tap to call Amma now.`,
          data: { type: 'MISSED_DOSE_ESCALATION', slotId: dose.slotId, time: dose.scheduledTime },
          priority: 'max',
        });
      }
    }
  } catch (err) {
    console.warn('[EscalationWorker] Cycle execution error:', err.message);
  }
};

// Run escalation worker every 30 seconds
setInterval(runEscalationCycle, 30000);

// Seed initial demo data for demonstration resilience
const seedDatabaseIfEmpty = async () => {
  try {
    const demoPasswordHash = await bcrypt.hash('password123', 10);
    const demoFamilyCode = 'FM482A';

    if (getIsConnected()) {
      let childUser = await User.findOne({ email: 'abhilash@familymeds.in' });
      if (!childUser) {
        childUser = await User.create({
          name: 'Abhilash',
          email: 'abhilash@familymeds.in',
          passwordHash: demoPasswordHash,
          role: 'CHILD',
        });
        console.log('🌱 Seeded Demo Child user: abhilash@familymeds.in');
      }

      let parentUser = await User.findOne({ email: 'amma@familymeds.in' });
      if (!parentUser) {
        parentUser = await User.create({
          name: 'Amma',
          email: 'amma@familymeds.in',
          passwordHash: demoPasswordHash,
          role: 'PARENT',
        });
        console.log('🌱 Seeded Demo Parent user: amma@familymeds.in');
      }

      let demoFamily = await Family.findOne({ familyCode: demoFamilyCode });
      if (!demoFamily) {
        demoFamily = await Family.create({
          familyCode: demoFamilyCode,
          familyName: 'K.R. Family (Mandya-Bengaluru)',
          createdBy: childUser._id,
        });
        console.log(`🌱 Seeded Demo Family: ${demoFamily.familyName} (${demoFamily.familyCode})`);

        await FamilyMember.create([
          { familyId: demoFamily._id, userId: childUser._id, role: 'CHILD' },
          { familyId: demoFamily._id, userId: parentUser._id, role: 'PARENT' },
        ]);
      }

      const medCount = await Medicine.countDocuments({ familyId: demoFamily._id });
      if (medCount === 0) {
        await Medicine.create([
          {
            familyId: demoFamily._id,
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
            familyId: demoFamily._id,
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
            familyId: demoFamily._id,
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
        ]);
      }
    } else {
      const childId = 'user-child-1';
      const parentId = 'user-parent-1';
      const familyId = 'family-kr-1';

      inMemoryStore.users = [
        {
          id: childId,
          name: 'Abhilash',
          email: 'abhilash@familymeds.in',
          passwordHash: demoPasswordHash,
          role: 'CHILD',
          pushToken: 'ExponentPushToken[MockChildToken]',
        },
        {
          id: parentId,
          name: 'Amma',
          email: 'amma@familymeds.in',
          passwordHash: demoPasswordHash,
          role: 'PARENT',
          pushToken: '',
        },
      ];

      inMemoryStore.families = [
        {
          id: familyId,
          familyCode: demoFamilyCode,
          familyName: 'K.R. Family (Mandya-Bengaluru)',
          createdBy: childId,
          createdAt: new Date(),
        },
      ];

      inMemoryStore.familyMembers = [
        { id: 'mem-1', familyId, userId: childId, role: 'CHILD', joinedAt: new Date() },
        { id: 'mem-2', familyId, userId: parentId, role: 'PARENT', joinedAt: new Date() },
      ];

      inMemoryStore.medicines = [
        {
          id: 'med-1',
          familyId,
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
          familyId,
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
          familyId,
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
      ];
    }
  } catch (err) {
    console.warn('⚠️ Seeding error:', err.message);
  }
};

// Initialize auth middleware with in-memory fallback
const auth = requireAuth(inMemoryStore);

// Root Health Check
app.get('/', (req, res) => {
  res.json({
    app: 'FamilyMeds API (DoseBandhu) - Spiral 3',
    status: 'online',
    version: '3.0.0',
    mode: 'Real-Time Sync + Push Notifications + 30-Min Missed Dose Escalation',
    database: getIsConnected() ? 'MongoDB Atlas (Connected)' : 'Local In-Memory Mode',
    endpoints: {
      auth: ['POST /auth/register', 'POST /auth/login', 'GET /auth/me'],
      family: ['POST /families/create', 'POST /families/join', 'GET /families/me', 'GET /families/live-status'],
      medicines: ['GET /medicines', 'POST /medicines', 'PATCH /medicines/slots/:id/taken'],
      history: ['GET /history', 'POST /history'],
      push: ['POST /users/push-token'],
      escalation: ['POST /escalation/register-window', 'POST /escalation/trigger-check'],
    },
  });
});

// ============================================================
// 1. AUTHENTICATION & PROFILE ENDPOINTS
// ============================================================

app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, pushToken } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role (CHILD/PARENT) are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanRole = role.toUpperCase();

    if (!['CHILD', 'PARENT'].includes(cleanRole)) {
      return res.status(400).json({ error: 'Role must be either CHILD or PARENT.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    let user;
    if (getIsConnected()) {
      const existing = await User.findOne({ email: cleanEmail });
      if (existing) {
        return res.status(409).json({ error: 'A user with this email already exists.' });
      }

      user = await User.create({
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        role: cleanRole,
        pushToken: pushToken || '',
      });
    } else {
      const existing = inMemoryStore.users.find((u) => u.email === cleanEmail);
      if (existing) {
        return res.status(409).json({ error: 'A user with this email already exists.' });
      }

      user = {
        id: `user-${Date.now()}`,
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        role: cleanRole,
        pushToken: pushToken || '',
        createdAt: new Date(),
      };
      inMemoryStore.users.push(user);
    }

    const token = jwt.sign(
      { userId: user.id || user._id.toString(), role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id || user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        pushToken: user.pushToken,
      },
      family: null,
    });
  } catch (error) {
    console.error('POST /auth/register error:', error);
    res.status(500).json({ error: 'Failed to register user.' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password, pushToken } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user;
    let family = null;

    if (getIsConnected()) {
      user = await User.findOne({ email: cleanEmail });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      if (pushToken && pushToken !== user.pushToken) {
        user.pushToken = pushToken;
        await user.save();
      }

      const member = await FamilyMember.findOne({ userId: user._id });
      if (member) {
        const fam = await Family.findById(member.familyId);
        if (fam) {
          family = {
            id: fam._id.toString(),
            familyCode: fam.familyCode,
            familyName: fam.familyName,
          };
        }
      }
    } else {
      user = inMemoryStore.users.find((u) => u.email === cleanEmail);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      if (pushToken) {
        user.pushToken = pushToken;
      }

      const member = inMemoryStore.familyMembers.find((m) => m.userId === user.id);
      if (member) {
        const fam = inMemoryStore.families.find((f) => f.id === member.familyId);
        if (fam) {
          family = {
            id: fam.id,
            familyCode: fam.familyCode,
            familyName: fam.familyName,
          };
        }
      }
    }

    const token = jwt.sign(
      {
        userId: user.id || user._id.toString(),
        role: user.role,
        familyId: family ? family.id : null,
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id || user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        pushToken: user.pushToken,
      },
      family,
    });
  } catch (error) {
    console.error('POST /auth/login error:', error);
    res.status(500).json({ error: 'Failed to login.' });
  }
});

// POST /users/push-token
app.post('/users/push-token', auth, async (req, res) => {
  try {
    const { pushToken } = req.body;
    if (!pushToken) {
      return res.status(400).json({ error: 'pushToken is required' });
    }

    const userId = req.user.id || req.user._id.toString();

    if (getIsConnected()) {
      await User.findByIdAndUpdate(userId, { pushToken: pushToken.trim() });
    } else {
      const u = inMemoryStore.users.find((user) => user.id === userId);
      if (u) u.pushToken = pushToken.trim();
    }

    console.log(`📲 Registered push token for user ${req.user.name}: ${pushToken.substring(0, 25)}...`);
    return res.json({ success: true, message: 'Push token updated successfully.' });
  } catch (error) {
    console.error('POST /users/push-token error:', error);
    res.status(500).json({ error: 'Failed to save push token.' });
  }
});

app.get('/auth/me', auth, async (req, res) => {
  try {
    let family = null;
    const userId = req.user.id || req.user._id.toString();

    if (getIsConnected()) {
      const member = await FamilyMember.findOne({ userId: req.user._id });
      if (member) {
        const fam = await Family.findById(member.familyId);
        if (fam) {
          family = {
            id: fam._id.toString(),
            familyCode: fam.familyCode,
            familyName: fam.familyName,
          };
        }
      }
    } else {
      const member = inMemoryStore.familyMembers.find((m) => m.userId === userId);
      if (member) {
        const fam = inMemoryStore.families.find((f) => f.id === member.familyId);
        if (fam) {
          family = {
            id: fam.id,
            familyCode: fam.familyCode,
            familyName: fam.familyName,
          };
        }
      }
    }

    res.json({
      user: {
        id: userId,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
      family,
    });
  } catch (error) {
    console.error('GET /auth/me error:', error);
    res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
});

// ============================================================
// 2. FAMILY MANAGEMENT & LIVE STATUS
// ============================================================

app.post('/families/create', auth, async (req, res) => {
  try {
    const { familyName } = req.body;
    if (!familyName || familyName.trim() === '') {
      return res.status(400).json({ error: 'Family name is required.' });
    }

    const familyCode = await generateFamilyCode();
    const userId = req.user.id || req.user._id.toString();

    let family;
    let member;

    if (getIsConnected()) {
      const existingMember = await FamilyMember.findOne({ userId: req.user._id });
      if (existingMember) {
        return res.status(400).json({ error: 'You are already in a family.' });
      }

      family = await Family.create({
        familyCode,
        familyName: familyName.trim(),
        createdBy: req.user._id,
      });

      member = await FamilyMember.create({
        familyId: family._id,
        userId: req.user._id,
        role: req.user.role,
      });
    } else {
      const existingMember = inMemoryStore.familyMembers.find((m) => m.userId === userId);
      if (existingMember) {
        return res.status(400).json({ error: 'You are already in a family.' });
      }

      family = {
        id: `family-${Date.now()}`,
        familyCode,
        familyName: familyName.trim(),
        createdBy: userId,
        createdAt: new Date(),
      };
      inMemoryStore.families.push(family);

      member = {
        id: `mem-${Date.now()}`,
        familyId: family.id,
        userId,
        role: req.user.role,
        joinedAt: new Date(),
      };
      inMemoryStore.familyMembers.push(member);
    }

    return res.status(201).json({
      message: 'Family created successfully',
      family: {
        id: family.id || family._id.toString(),
        familyCode: family.familyCode,
        familyName: family.familyName,
      },
      member,
    });
  } catch (error) {
    console.error('POST /families/create error:', error);
    res.status(500).json({ error: 'Failed to create family.' });
  }
});

app.post('/families/join', auth, async (req, res) => {
  try {
    const { familyCode } = req.body;
    if (!familyCode || familyCode.trim() === '') {
      return res.status(400).json({ error: '6-character family code is required.' });
    }

    const cleanCode = familyCode.trim().toUpperCase();
    const userId = req.user.id || req.user._id.toString();

    let family;
    let member;

    if (getIsConnected()) {
      family = await Family.findOne({ familyCode: cleanCode });
      if (!family) {
        return res.status(404).json({ error: `Family code "${cleanCode}" not found. Please verify the code.` });
      }

      const existingMember = await FamilyMember.findOne({
        familyId: family._id,
        userId: req.user._id,
      });
      if (existingMember) {
        return res.status(200).json({
          message: 'Already a member of this family',
          family: {
            id: family._id.toString(),
            familyCode: family.familyCode,
            familyName: family.familyName,
          },
          member: existingMember,
        });
      }

      member = await FamilyMember.create({
        familyId: family._id,
        userId: req.user._id,
        role: req.user.role,
      });
    } else {
      family = inMemoryStore.families.find((f) => f.familyCode === cleanCode);
      if (!family) {
        return res.status(404).json({ error: `Family code "${cleanCode}" not found. Please verify the code.` });
      }

      const existingMember = inMemoryStore.familyMembers.find(
        (m) => m.familyId === family.id && m.userId === userId
      );
      if (existingMember) {
        return res.status(200).json({
          message: 'Already a member of this family',
          family: {
            id: family.id,
            familyCode: family.familyCode,
            familyName: family.familyName,
          },
          member: existingMember,
        });
      }

      member = {
        id: `mem-${Date.now()}`,
        familyId: family.id,
        userId,
        role: req.user.role,
        joinedAt: new Date(),
      };
      inMemoryStore.familyMembers.push(member);
    }

    return res.status(200).json({
      message: 'Successfully joined family!',
      family: {
        id: family.id || family._id.toString(),
        familyCode: family.familyCode,
        familyName: family.familyName,
      },
      member,
    });
  } catch (error) {
    console.error('POST /families/join error:', error);
    res.status(500).json({ error: 'Failed to join family.' });
  }
});

app.get('/families/me', auth, requireFamily, async (req, res) => {
  try {
    let family;
    let members = [];

    if (getIsConnected()) {
      family = await Family.findById(req.familyId);
      if (!family) {
        return res.status(404).json({ error: 'Family not found.' });
      }

      const membershipRecords = await FamilyMember.find({ familyId: family._id }).populate('userId', 'name email role');
      members = membershipRecords.map((m) => ({
        id: m._id.toString(),
        user: m.userId ? { id: m.userId._id.toString(), name: m.userId.name, email: m.userId.email, role: m.userId.role } : null,
        role: m.role,
        joinedAt: m.joinedAt,
      }));
    } else {
      family = inMemoryStore.families.find((f) => f.id === req.familyId);
      if (!family) {
        return res.status(404).json({ error: 'Family not found.' });
      }

      const membershipRecords = inMemoryStore.familyMembers.filter((m) => m.familyId === family.id);
      members = membershipRecords.map((m) => {
        const u = inMemoryStore.users.find((user) => user.id === m.userId);
        return {
          id: m.id,
          user: u ? { id: u.id, name: u.name, email: u.email, role: u.role } : null,
          role: m.role,
          joinedAt: m.joinedAt,
        };
      });
    }

    return res.json({
      family: {
        id: family.id || family._id.toString(),
        familyCode: family.familyCode,
        familyName: family.familyName,
      },
      members,
    });
  } catch (error) {
    console.error('GET /families/me error:', error);
    res.status(500).json({ error: 'Failed to retrieve family details.' });
  }
});

// GET /families/live-status (Real-Time Child Sync Endpoint)
app.get('/families/live-status', auth, requireFamily, async (req, res) => {
  try {
    let latestDose = null;
    let pendingEscalation = null;

    if (getIsConnected()) {
      latestDose = await History.findOne({ familyId: req.familyId }).sort({ createdAt: -1 });
      pendingEscalation = await DoseEscalation.findOne({ familyId: req.familyId, status: 'PENDING' });
    } else {
      const familyHistory = inMemoryStore.history.filter((h) => h.familyId === req.familyId);
      latestDose = familyHistory[0] || null;
      pendingEscalation = inMemoryStore.doseEscalations.find(
        (d) => d.familyId === req.familyId && d.status === 'PENDING'
      ) || null;
    }

    const hasActiveMissedAlert = latestDose && latestDose.status === 'MISSED';

    return res.json({
      familyId: req.familyId,
      timestamp: new Date(),
      latestDose,
      hasActiveMissedAlert,
      pendingEscalation,
    });
  } catch (error) {
    console.error('GET /families/live-status error:', error);
    res.status(500).json({ error: 'Failed to retrieve live status' });
  }
});

// ============================================================
// 3. MEDICINES & SLOTS
// ============================================================

app.get('/medicines', auth, requireFamily, async (req, res) => {
  try {
    if (getIsConnected()) {
      const medicines = await Medicine.find({ familyId: req.familyId }).sort({ createdAt: 1 });
      return res.status(200).json(medicines);
    }
    const medicines = inMemoryStore.medicines.filter((m) => m.familyId === req.familyId);
    return res.status(200).json(medicines);
  } catch (error) {
    console.error('GET /medicines error:', error);
    res.status(500).json({ error: 'Failed to retrieve medicines' });
  }
});

app.post('/medicines', auth, requireFamily, async (req, res) => {
  try {
    const { name, genericName, kannadaName, timing, dosage, color, photo, slotTime, slotLabel, slotId } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Medicine name is required' });
    }

    const medicineData = {
      familyId: req.familyId,
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
      createdAt: new Date(),
    };
    inMemoryStore.medicines.push(newMed);
    return res.status(201).json(newMed);
  } catch (error) {
    console.error('POST /medicines error:', error);
    res.status(500).json({ error: 'Failed to save medicine' });
  }
});

// ============================================================
// 4. DOSE CONFIRMATION, HISTORY & REAL-TIME SYNC
// ============================================================

app.get('/history', auth, requireFamily, async (req, res) => {
  try {
    if (getIsConnected()) {
      const history = await History.find({ familyId: req.familyId }).sort({ createdAt: -1 });
      return res.status(200).json(history);
    }
    const history = inMemoryStore.history.filter((h) => h.familyId === req.familyId);
    return res.status(200).json(history);
  } catch (error) {
    console.error('GET /history error:', error);
    res.status(500).json({ error: 'Failed to retrieve dose history' });
  }
});

// POST /history (Parent presses TAKEN ➔ Cloud sync + Instant Push to Child + Cancels Escalation)
app.post('/history', auth, requireFamily, async (req, res) => {
  try {
    const { date, time, slot, medicines, status, takenAt, slotId } = req.body;

    if (!medicines) {
      return res.status(400).json({ error: 'Medicine details required' });
    }

    const userId = req.user.id || req.user._id.toString();
    const confirmedStatus = status || 'TAKEN';

    const historyData = {
      familyId: req.familyId,
      userId,
      date: date || 'Today',
      time: time || '09:00 AM',
      slot: slot || 'Morning Medicines',
      medicines,
      status: confirmedStatus,
      takenAt: takenAt || 'Confirmed by Parent',
    };

    let savedRecord;
    if (getIsConnected()) {
      const newHist = new History(historyData);
      savedRecord = await newHist.save();

      // Resolve pending escalation window if exists
      if (slotId) {
        await DoseEscalation.updateMany(
          { familyId: req.familyId, slotId, status: 'PENDING' },
          { status: 'TAKEN', confirmedAt: new Date() }
        );
      }
    } else {
      savedRecord = {
        id: `hist-${Date.now()}`,
        ...historyData,
        createdAt: new Date(),
      };
      inMemoryStore.history.unshift(savedRecord);

      if (slotId) {
        const pending = inMemoryStore.doseEscalations.find(
          (d) => d.familyId === req.familyId && d.slotId === slotId && d.status === 'PENDING'
        );
        if (pending) {
          pending.status = 'TAKEN';
          pending.confirmedAt = new Date();
        }
      }
    }

    // DISPATCH INSTANT PUSH NOTIFICATION TO CHILD/CAREGIVERS
    if (confirmedStatus === 'TAKEN') {
      console.log(`✅ [SyncEngine] Parent TAKEN confirmed for ${slot}. Dispatching push to caregivers...`);
      await notifyFamilyCaregivers(req.familyId, {
        title: '✅ ಮಾತ್ರೆ ತೆಗೆದುಕೊಳ್ಳಲಾಗಿದೆ (Medicine Taken)',
        body: `Amma confirmed her ${slot} (${medicines}) at ${takenAt || time}.`,
        data: { type: 'DOSE_TAKEN_CONFIRMED', slot, time, status: 'TAKEN' },
        priority: 'high',
      });
    }

    return res.status(201).json(savedRecord);
  } catch (error) {
    console.error('POST /history error:', error);
    res.status(500).json({ error: 'Failed to save dose history' });
  }
});

// ============================================================
// 5. ESCALATION TEST & MANAGEMENT ENDPOINTS
// ============================================================

// POST /escalation/register-window (Registers an active monitoring slot)
app.post('/escalation/register-window', auth, requireFamily, async (req, res) => {
  try {
    const { slotId, slotLabel, medicines, scheduledTime, minutesUntilEscalate = 30 } = req.body;
    const escalateAtEpoch = Date.now() + minutesUntilEscalate * 60 * 1000;

    let record;
    if (getIsConnected()) {
      record = await DoseEscalation.create({
        familyId: req.familyId,
        slotId: slotId || 'slot-morning',
        slotLabel: slotLabel || 'Morning Medicines',
        medicines: medicines || 'Tablets',
        scheduledTime: scheduledTime || '09:00 AM',
        escalateAtEpoch,
        status: 'PENDING',
      });
    } else {
      record = {
        id: `esc-${Date.now()}`,
        familyId: req.familyId,
        slotId: slotId || 'slot-morning',
        slotLabel: slotLabel || 'Morning Medicines',
        medicines: medicines || 'Tablets',
        scheduledTime: scheduledTime || '09:00 AM',
        escalateAtEpoch,
        status: 'PENDING',
        createdAt: new Date(),
      };
      inMemoryStore.doseEscalations.push(record);
    }

    return res.status(201).json({
      message: `Escalation armed: Will trigger alert in ${minutesUntilEscalate} minutes if not taken.`,
      record,
    });
  } catch (error) {
    console.error('POST /escalation/register-window error:', error);
    res.status(500).json({ error: 'Failed to arm escalation window' });
  }
});

// POST /escalation/trigger-check (Manually invokes the escalation cycle for testing)
app.post('/escalation/trigger-check', auth, requireFamily, async (req, res) => {
  try {
    await runEscalationCycle();
    return res.json({ message: 'Escalation cycle executed.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start Server
let serverInstance = null;
const startServer = async () => {
  if (serverInstance) return serverInstance;
  await seedDatabaseIfEmpty();
  serverInstance = app.listen(PORT, async () => {
    console.log(`===============================================`);
    console.log(`🚀 FamilyMeds Sync & Escalation API running on port ${PORT}`);
    console.log(`📡 Base URL: http://localhost:${PORT}`);
    console.log(`📲 Push Notifications: Expo Push Engine Active`);
    console.log(`⏱️ Escalation Worker: 30-Minute Missed Dose Monitor Running`);
    console.log(`===============================================`);
    const connected = await connectDB();
    if (connected) {
      await seedDatabaseIfEmpty();
    }
  });
  return serverInstance;
};

startServer();

module.exports = app;
