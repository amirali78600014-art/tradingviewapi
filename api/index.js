const crypto = require('crypto');

const VALID_API_KEYS = new Set([
  'demo-key-123',
  'test-key-456', 
  'live-key-789'
]);

function generateApiKey() {
  return 'fxapi-' + crypto.randomBytes(16).toString('hex');
}

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.url === '/' || req.url === '/api') {
    res.status(200).json({
      message: 'Forex API Server is running',
      endpoints: {
        '/': 'API Info',
        '/api/generate-key': 'Generate API Key (POST)',
        '/api/keys': 'List API Keys (GET)'
      },
      status: 'active'
    });
  } else if (req.url === '/api/generate-key' && req.method === 'POST') {
    const newKey = generateApiKey();
    VALID_API_KEYS.add(newKey);
    res.status(200).json({ 
      apiKey: newKey, 
      message: 'API Key generated successfully' 
    });
  } else if (req.url === '/api/keys' && req.method === 'GET') {
    res.status(200).json({ 
      keys: Array.from(VALID_API_KEYS) 
    });
  } else {
    res.status(404).json({ error: 'Not Found' });
  }
};