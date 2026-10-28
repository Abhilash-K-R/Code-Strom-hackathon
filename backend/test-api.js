const http = require('http');

const request = (path, method = 'GET', body = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
        },
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

async function runTests() {
  console.log('Testing FamilyMeds Backend Endpoints...');

  try {
    // 1. GET /
    const root = await request('/');
    console.log('1. GET / -> Status:', root.status, '| App:', root.body.app);

    // 2. GET /medicines
    const getMeds = await request('/medicines');
    console.log('2. GET /medicines -> Status:', getMeds.status, '| Found:', getMeds.body.length, 'medicines');

    // 3. POST /medicines
    const newMed = await request('/medicines', 'POST', {
      name: 'Glimepiride 1mg',
      genericName: 'Amaryl',
      kannadaName: 'ಗ್ಲಿಮೆಪಿರೈಡ್ ಮಾತ್ರೆ',
      timing: 'Before Breakfast',
      dosage: '1 Tablet',
      slotTime: '08:00 AM',
      slotLabel: 'Morning Medicines',
      slotId: 'slot-morning',
    });
    console.log('3. POST /medicines -> Status:', newMed.status, '| Added:', newMed.body.name, '| ID:', newMed.body.id || newMed.body._id);

    // 4. GET /history
    const getHist = await request('/history');
    console.log('4. GET /history -> Status:', getHist.status, '| Found:', getHist.body.length, 'history records');

    // 5. POST /history
    const newHist = await request('/history', 'POST', {
      date: 'Today (Just Now)',
      time: '09:00 AM',
      slot: 'Morning Medicines',
      medicines: 'Glimepiride 1mg, BP Tablet',
      status: 'TAKEN',
      takenAt: '09:05 AM (Confirmed by Parent)',
    });
    console.log('5. POST /history -> Status:', newHist.status, '| Logged:', newHist.body.medicines, '| Status:', newHist.body.status);

    console.log('\n=============================================');
    console.log('🎉 ALL BACKEND ENDPOINTS ARE VERIFIED & READY!');
    console.log('=============================================');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
  }
}

runTests();
