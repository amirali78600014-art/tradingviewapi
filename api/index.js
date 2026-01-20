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
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    const url = req.url || '/';
    const method = req.method || 'GET';

    if (url === '/' || url === '/api') {
      return res.status(200).json({
        message: 'Forex API Server is running',
        endpoints: {
          '/': 'Main page',
          '/admin': 'Admin panel',
          '/api/generate-key': 'Generate API Key (POST)',
          '/api/keys': 'List API Keys (GET)',
          '/ws': 'WebSocket info'
        },
        status: 'active',
        timestamp: new Date().toISOString()
      });
    }

    if (url === '/admin') {
      return res.status(200).json({
        message: 'Admin Panel',
        description: 'API Key Management',
        availableKeys: Array.from(VALID_API_KEYS).length
      });
    }

    if (url === '/api/generate-key' && method === 'POST') {
      const newKey = generateApiKey();
      VALID_API_KEYS.add(newKey);
      return res.status(200).json({ 
        apiKey: newKey, 
        message: 'API Key generated successfully',
        timestamp: new Date().toISOString()
      });
    }

    if (url === '/api/keys' && method === 'GET') {
      return res.status(200).json({ 
        keys: Array.from(VALID_API_KEYS),
        count: VALID_API_KEYS.size,
        timestamp: new Date().toISOString()
      });
    }

    if (url === '/favicon.ico') {
      return res.status(204).end();
    }

    return res.status(404).json({ 
      error: 'Not Found',
      path: url,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};