// backend\backend_serverflex\serveurflex\test-vcenter-rest.js
const axios = require('axios');

async function testVcenter() {
  const baseUrl = 'https://192.168.94.134/rest'; // Removed explicit :443 (default for HTTPS)
  try {
    console.log('Attempting to authenticate to:', baseUrl);
    const authResponse = await axios.post(
      `${baseUrl}/com/vmware/cis/session`,
      {},
      {
        auth: { username: 'administrator@esxi02.local', password: 'Ma1920++' },
        headers: { 'Content-Type': 'application/json' },
        httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
      }
    );
    console.log('Session ID:', authResponse.data.value);
    await axios.delete(`${baseUrl}/com/vmware/cis/session`, {
      headers: { 'vmware-api-session-id': authResponse.data.value },
      httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
    });
    console.log('Disconnected');
  } catch (error) {
    console.error('Error Details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
    });
  }
}

testVcenter();