const https = require('https');

/**
 * FamilyMeds Push Notification Dispatcher (Expo Push API)
 * Sends high-priority push notifications to iOS and Android devices without requiring native APNs setup
 */
const sendExpoPushNotification = async (pushTokens, { title, body, data = {}, priority = 'high', channelId = 'medication-alerts' }) => {
  if (!pushTokens || pushTokens.length === 0) return { success: false, reason: 'No push tokens provided' };

  const validTokens = pushTokens.filter(
    (t) => typeof t === 'string' && (t.startsWith('ExponentPushToken[') || t.startsWith('ExpoPushToken['))
  );

  if (validTokens.length === 0) {
    console.log(`[PushService] Mock dispatch (Tokens: ${pushTokens.length}) -> "${title}: ${body}"`);
    return { success: true, simulated: true, count: pushTokens.length };
  }

  const messages = validTokens.map((to) => ({
    to,
    sound: 'default',
    title,
    body,
    data,
    priority,
    channelId,
  }));

  return new Promise((resolve) => {
    const postData = JSON.stringify(messages);
    const req = https.request(
      'https://exp.host/--/api/v2/push/send',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      },
      (res) => {
        let responseData = '';
        res.on('data', (chunk) => (responseData += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseData);
            console.log(`[PushService] Sent ${validTokens.length} push notification(s) successfully.`);
            resolve({ success: true, result: parsed });
          } catch (e) {
            resolve({ success: false, error: e.message });
          }
        });
      }
    );

    req.on('error', (err) => {
      console.warn('[PushService] Push request failed:', err.message);
      resolve({ success: false, error: err.message });
    });

    req.write(postData);
    req.end();
  });
};

module.exports = { sendExpoPushNotification };

