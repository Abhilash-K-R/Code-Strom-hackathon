const http = require('http');

const request = (path, method = 'GET', body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, body: data });
          }
        });
      }
    );
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

async function runSpiral3Tests() {
  console.log('🧪 Starting Spiral 3 Verification: Real-Time Sync, Push & Escalation Engine...\n');

  try {
    // 1. Register Child
    const childRes = await request('/auth/register', 'POST', {
      name: 'Abhilash (Child)',
      email: `child_sync_${Date.now()}@test.com`,
      password: 'password123',
      role: 'CHILD',
      pushToken: 'ExponentPushToken[TestChildDeviceToken12345]',
    });
    console.log('1. Register Child with PushToken -> Status:', childRes.status, '| User:', childRes.body.user?.name);
    const childToken = childRes.body.token;

    // 2. Child Creates Family
    const famRes = await request('/families/create', 'POST', {
      familyName: 'Mandya Care Family',
    }, childToken);
    const familyCode = famRes.body.family?.familyCode;
    console.log('2. Created Family -> Code:', familyCode);

    // 3. Register Parent & Join Family
    const parentRes = await request('/auth/register', 'POST', {
      name: 'Amma (Parent)',
      email: `parent_sync_${Date.now()}@test.com`,
      password: 'password123',
      role: 'PARENT',
    });
    const parentToken = parentRes.body.token;
    await request('/families/join', 'POST', { familyCode }, parentToken);
    console.log('3. Parent Joined Family Successfully');

    // 4. Test Happy Path: Parent TAKEN ➔ Child Live Status Check
    console.log('\n--- Test Scenario 1: Parent presses TAKEN ➔ Real-Time Sync ---');
    const takenRes = await request('/history', 'POST', {
      slotId: 'slot-morning',
      slot: 'Morning Medicines',
      medicines: 'BP Tablet (Telmisartan 40mg)',
      status: 'TAKEN',
      time: '09:00 AM',
      takenAt: '09:07 AM',
    }, parentToken);
    console.log('4. Parent logs TAKEN -> Status:', takenRes.status, '| Medicines:', takenRes.body.medicines);

    // 5. Child checks /families/live-status
    const liveStatusRes = await request('/families/live-status', 'GET', null, childToken);
    console.log('5. Child queries Live Status -> Latest Dose:', liveStatusRes.body.latestDose?.status, 'at', liveStatusRes.body.latestDose?.takenAt);
    if (liveStatusRes.body.latestDose?.status !== 'TAKEN') {
      throw new Error('Child dashboard did not reflect Parent TAKEN status in real time!');
    }
    console.log('✅ Real-time Parent TAKEN ➔ Child Sync Verified');

    // 6. Test Escalation Path: 30-Minute Missed Dose Engine
    console.log('\n--- Test Scenario 2: 30-Minute Missed Dose Escalation Engine ---');
    // Arm an expired escalation window (mimicking 30 minutes passing without confirmation)
    const armEscalationRes = await request('/escalation/register-window', 'POST', {
      slotId: 'slot-night',
      slotLabel: 'Night Medicines',
      medicines: 'Calcium Tablet (Shelcal 500mg)',
      scheduledTime: '08:30 PM',
      minutesUntilEscalate: -1, // Already expired 1 minute ago!
    }, childToken);
    console.log('6. Armed Expired Escalation Window -> ID:', armEscalationRes.body.record?.id);

    // Manually trigger the escalation worker cycle
    await request('/escalation/trigger-check', 'POST', {}, childToken);

    // Verify MISSED entry generated and alert activated
    const liveStatusEscalated = await request('/families/live-status', 'GET', null, childToken);
    console.log('7. Live Status after Escalation Cycle -> Has Active Missed Alert:', liveStatusEscalated.body.hasActiveMissedAlert);
    console.log('   Latest History Entry Status:', liveStatusEscalated.body.latestDose?.status, '| Slot:', liveStatusEscalated.body.latestDose?.slot);

    if (liveStatusEscalated.body.latestDose?.status !== 'MISSED') {
      throw new Error('Escalation worker failed to generate MISSED dose entry!');
    }
    console.log('✅ Automated 30-Minute Missed Dose Escalation Verified');

    console.log('\n======================================================');
    console.log('🎉 SPIRAL 3 SYNCHRONIZATION & ESCALATION FULLY VERIFIED!');
    console.log('======================================================');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Spiral 3 Test Failed:', err.message);
    process.exit(1);
  }
}

runSpiral3Tests();
