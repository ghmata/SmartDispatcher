const http = require('http');

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3001${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function testApi() {
  console.log('--- TESTING API SERVER ---');
  try {
    console.log('GET /api/status...');
    const status = await get('/api/status');
    console.log('Response:', status);
    
    console.log('GET /api/sessions...');
    const sessions = await get('/api/sessions');
    console.log('Response:', sessions);

    console.log('✅ API IS RUNNING');
  } catch (e) {
    console.error('❌ API FAILED:', e.message);
    process.exit(1);
  }
}

testApi();
