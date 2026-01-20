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
    const { path, httpMethod, queryStringParameters, body } = event;
    
    // Remove function path prefix
    const cleanPath = path.replace('/.netlify/functions/api', '') || '/';
    
    console.log('Request:', { path: cleanPath, method: httpMethod });

    // Main API endpoint
    if (cleanPath === '/' || cleanPath === '') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'Forex API Server - Netlify Functions',
          version: '2.0.0',
          endpoints: {
            'GET /': 'API Information',
            'GET /admin': 'Admin Panel',
            'POST /generate-key': 'Generate New API Key',
            'GET /keys': 'List All API Keys',
            'GET /ws': 'WebSocket Information',
            'GET /health': 'Health Check'
          },
          status: 'online',
          timestamp: new Date().toISOString(),
          server: 'Netlify Functions'
        })
      };
    }

    // Health check
    if (cleanPath === '/health') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'healthy',
          uptime: process.uptime(),
          timestamp: new Date().toISOString()
        })
      };
    }

    // Admin panel
    if (cleanPath === '/admin') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'Forex API - Admin Panel',
          description: 'API Key Management System',
          features: ['Generate API Keys', 'List Active Keys', 'Monitor Usage'],
          defaultKeys: ['demo-key-123', 'test-key-456', 'live-key-789'],
          timestamp: new Date().toISOString()
        })
      };
    }

    // Generate API key
    if (cleanPath === '/generate-key' && httpMethod === 'POST') {
      const crypto = require('crypto');
      const newKey = 'fxapi-' + crypto.randomBytes(16).toString('hex');
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          apiKey: newKey,
          message: 'New API key generated successfully',
          usage: 'Include this key in your API requests',
          timestamp: new Date().toISOString()
        })
      };
    }

    // List API keys
    if (cleanPath === '/keys' && httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          keys: [
            { key: 'demo-key-123', type: 'demo', created: '2024-01-01' },
            { key: 'test-key-456', type: 'test', created: '2024-01-01' },
            { key: 'live-key-789', type: 'live', created: '2024-01-01' }
          ],
          total: 3,
          timestamp: new Date().toISOString()
        })
      };
    }

    // WebSocket info
    if (cleanPath === '/ws') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'WebSocket Endpoint Information',
          description: 'Real-time forex data streaming',
          supportedPairs: [
            'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD',
            'USDCHF', 'NZDUSD', 'EURGBP', 'EURJPY', 'GBPJPY',
            'XAUUSD', 'XAGUSD', 'BTCUSDT', 'ETHUSDT'
          ],
          features: ['Real-time prices', 'Historical data', 'Market alerts'],
          status: 'available',
          timestamp: new Date().toISOString()
        })
      };
    }

    // 404 for unknown routes
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        error: 'Endpoint not found',
        path: cleanPath,
        method: httpMethod,
        availableEndpoints: ['/', '/admin', '/generate-key', '/keys', '/ws', '/health'],
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};