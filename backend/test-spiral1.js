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

async function runSpiral1Tests() {
  console.log('🧪 Starting Spiral 1 Multi-Tenancy & Family Isolation Verification...\n');

  try {
    // 1. Register Child A
    const childARes = await request('/auth/register', 'POST', {
      name: 'Ramesh (Child A)',
      email: `ramesh_${Date.now()}@test.com`,
      password: 'password123',
      role: 'CHILD',
    });
    console.log('1. Register Child A -> Status:', childARes.status, '| User:', childARes.body.user?.name);
    const childAToken = childARes.body.token;

    // 2. Child A creates Family A
    const createFamRes = await request('/families/create', 'POST', {
      familyName: 'Ramesh Family',
    }, childAToken);
    console.log('2. Create Family A -> Status:', createFamRes.status, '| Code:', createFamRes.body.family?.familyCode);
    const familyACode = createFamRes.body.family?.familyCode;

    // 3. Register Parent A
    const parentARes = await request('/auth/register', 'POST', {
      name: 'Gowramma (Parent A)',
      email: `gowramma_${Date.now()}@test.com`,
      password: 'password123',
      role: 'PARENT',
    });
    console.log('3. Register Parent A -> Status:', parentARes.status, '| User:', parentARes.body.user?.name);
    const parentAToken = parentARes.body.token;

    // 4. Parent A joins Family A using familyCode
    const joinFamRes = await request('/families/join', 'POST', {
      familyCode: familyACode,
    }, parentAToken);
    console.log('4. Parent A Joins Family A -> Status:', joinFamRes.status, '| Joined Family:', joinFamRes.body.family?.familyName);

    // 5. Parent A checks /families/me
    const famMeRes = await request('/families/me', 'GET', null, parentAToken);
    console.log('5. Check Family Members -> Status:', famMeRes.status, '| Member count:', famMeRes.body.members?.length);

    // 6. Child A adds a medicine to Family A
    const addMedRes = await request('/medicines', 'POST', {
      name: 'Amlodipine 5mg',
      genericName: 'Amlodipine',
      kannadaName: 'ಅಮ್ಲೋಡಿಪಿನ್',
      timing: 'Morning',
      slotTime: '08:30 AM',
      slotLabel: 'Morning Medicines',
    }, childAToken);
    console.log('6. Child A adds Medicine -> Status:', addMedRes.status, '| Added:', addMedRes.body.name);

    // 7. Parent A retrieves medicines (should see Amlodipine 5mg)
    const getMedsARes = await request('/medicines', 'GET', null, parentAToken);
    const hasMedA = getMedsARes.body.some((m) => m.name === 'Amlodipine 5mg');
    console.log('7. Parent A reads Medicines -> Status:', getMedsARes.status, '| Contains Amlodipine:', hasMedA);
    if (!hasMedA) throw new Error('Parent A could not find medicine added by Child A in the same family!');

    // 8. Register Child B in a separate family (Family B)
    const childBRes = await request('/auth/register', 'POST', {
      name: 'Suresh (Child B)',
      email: `suresh_${Date.now()}@test.com`,
      password: 'password123',
      role: 'CHILD',
    });
    const childBToken = childBRes.body.token;

    const createFamBRes = await request('/families/create', 'POST', {
      familyName: 'Suresh Family B',
    }, childBToken);
    console.log('8. Create Separate Family B -> Status:', createFamBRes.status, '| Code:', createFamBRes.body.family?.familyCode);

    // 9. Child B retrieves medicines (MUST NOT see Amlodipine 5mg!)
    const getMedsBRes = await request('/medicines', 'GET', null, childBToken);
    const hasLeak = getMedsBRes.body.some((m) => m.name === 'Amlodipine 5mg');
    console.log('9. Child B reads Medicines -> Count:', getMedsBRes.body.length, '| Leak from Family A?:', hasLeak);
    if (hasLeak) throw new Error('CRITICAL SECURITY VIOLATION: Family B saw Family A medicines!');

    // 10. Parent A records dose in Family A
    const recordDoseRes = await request('/history', 'POST', {
      date: 'Today',
      time: '08:35 AM',
      slot: 'Morning Medicines',
      medicines: 'Amlodipine 5mg',
      status: 'TAKEN',
      takenAt: '08:35 AM (Confirmed by Parent A)',
    }, parentAToken);
    console.log('10. Parent A logs dose -> Status:', recordDoseRes.status, '| Medicines:', recordDoseRes.body.medicines);

    // 11. Child A sees dose in History; Child B sees 0 history
    const histARes = await request('/history', 'GET', null, childAToken);
    const histBRes = await request('/history', 'GET', null, childBToken);
    console.log('11. History Isolation -> Family A count:', histARes.body.length, '| Family B count:', histBRes.body.length);

    if (histBRes.body.length !== 0) throw new Error('CRITICAL SECURITY VIOLATION: Family B saw Family A history!');

    console.log('\n======================================================');
    console.log('🎉 SPIRAL 1 MULTI-TENANCY & ISOLATION FULLY VERIFIED!');
    console.log('======================================================');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Test failed:', err.message);
    process.exit(1);
  }
}

runSpiral1Tests();

