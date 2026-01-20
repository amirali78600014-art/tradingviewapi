const crypto = require('crypto');

const VALID_API_KEYS = new Set([
  'demo-key-123',
  'test-key-456', 
  'live-key-789'
]);

function generateApiKey() {
  return 'fxapi-' + crypto.randomBytes(16).toString('hex');
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const path = event.path.replace('/.netlify/functions/api', '') || '/';
    const method = event.httpMethod;

    if (path === '/' || path === '/api') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'Forex API Server running on Netlify',
          endpoints: {
            '/': 'Main API',
            '/admin': 'Admin panel',
            '/generate-key': 'Generate API Key (POST)',
            '/keys': 'List API Keys (GET)',
            '/ws': 'WebSocket info'
          },
          status: 'active',
          timestamp: new Date().toISOString()
        })
      };
    }

    if (path === '/admin') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'Admin Panel - API Key Management',
          availableKeys: VALID_API_KEYS.size,
          timestamp: new Date().toISOString()
        })
      };
    }

    if (path === '/generate-key' && method === 'POST') {
      const newKey = generateApiKey();
      VALID_API_KEYS.add(newKey);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          apiKey: newKey,
          message: 'API Key generated successfully',
          timestamp: new Date().toISOString()
        })
      };
    }

    if (path === '/keys' && method === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          keys: Array.from(VALID_API_KEYS),
          count: VALID_API_KEYS.size,
          timestamp: new Date().toISOString()
        })
      };
    }

    if (path === '/ws') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'WebSocket endpoint info',
          pairs: ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'BTCUSDT'],
          status: 'available'
        })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not Found', path })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error', message: error.message })
    };
  }
};