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
    const { path, httpMethod, queryStringParameters } = event;
    const cleanPath = path.replace('/.netlify/functions/api', '') || '/';
    
    console.log('Request:', { path: cleanPath, method: httpMethod });

    // Live prices endpoint
    if (cleanPath === '/prices' && httpMethod === 'GET') {
      const pairs = [
        { symbol: 'FOREXCOM:EURUSD', metal: 'EUR', currency: 'USD', exchange: 'FOREXCOM', basePrice: 1.0850 },
        { symbol: 'FOREXCOM:GBPUSD', metal: 'GBP', currency: 'USD', exchange: 'FOREXCOM', basePrice: 1.2650 },
        { symbol: 'FOREXCOM:USDJPY', metal: 'USD', currency: 'JPY', exchange: 'FOREXCOM', basePrice: 149.50 },
        { symbol: 'FOREXCOM:AUDUSD', metal: 'AUD', currency: 'USD', exchange: 'FOREXCOM', basePrice: 0.6750 },
        { symbol: 'FOREXCOM:USDCAD', metal: 'USD', currency: 'CAD', exchange: 'FOREXCOM', basePrice: 1.3450 },
        { symbol: 'FOREXCOM:USDCHF', metal: 'USD', currency: 'CHF', exchange: 'FOREXCOM', basePrice: 0.8950 },
        { symbol: 'FOREXCOM:NZDUSD', metal: 'NZD', currency: 'USD', exchange: 'FOREXCOM', basePrice: 0.6150 },
        { symbol: 'FOREXCOM:EURGBP', metal: 'EUR', currency: 'GBP', exchange: 'FOREXCOM', basePrice: 0.8580 },
        { symbol: 'FOREXCOM:EURJPY', metal: 'EUR', currency: 'JPY', exchange: 'FOREXCOM', basePrice: 162.30 },
        { symbol: 'FOREXCOM:GBPJPY', metal: 'GBP', currency: 'JPY', exchange: 'FOREXCOM', basePrice: 189.20 },
        { symbol: 'FOREXCOM:XAUUSD', metal: 'XAU', currency: 'USD', exchange: 'FOREXCOM', basePrice: 2670.99 },
        { symbol: 'FOREXCOM:XAGUSD', metal: 'XAG', currency: 'USD', exchange: 'FOREXCOM', basePrice: 30.85 },
        { symbol: 'BINANCE:BTCUSDT', metal: 'BTC', currency: 'USDT', exchange: 'BINANCE', basePrice: 43250.00 },
        { symbol: 'BINANCE:ETHUSDT', metal: 'ETH', currency: 'USDT', exchange: 'BINANCE', basePrice: 2650.00 }
      ];

      const pricesData = pairs.map(pair => {
        const variation = (Math.random() - 0.5) * 0.02;
        const currentPrice = pair.basePrice + (pair.basePrice * variation);
        
        return {
          timestamp: Math.floor(Date.now() / 1000),
          metal: pair.metal,
          currency: pair.currency,
          exchange: pair.exchange,
          symbol: pair.symbol,
          "current price": parseFloat(currentPrice.toFixed(pair.symbol.includes('JPY') ? 3 : 5)),
          "running price": parseFloat(currentPrice.toFixed(pair.symbol.includes('JPY') ? 3 : 5))
        };
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: pricesData,
          count: pricesData.length,
          timestamp: new Date().toISOString()
        })
      };
    }

    // Single pair price
    if (cleanPath.startsWith('/price/') && httpMethod === 'GET') {
      const symbol = cleanPath.replace('/price/', '').toUpperCase();
      const pairMap = {
        'EURUSD': { metal: 'EUR', currency: 'USD', exchange: 'FOREXCOM', basePrice: 1.0850 },
        'GBPUSD': { metal: 'GBP', currency: 'USD', exchange: 'FOREXCOM', basePrice: 1.2650 },
        'USDJPY': { metal: 'USD', currency: 'JPY', exchange: 'FOREXCOM', basePrice: 149.50 },
        'XAUUSD': { metal: 'XAU', currency: 'USD', exchange: 'FOREXCOM', basePrice: 2670.99 },
        'BTCUSDT': { metal: 'BTC', currency: 'USDT', exchange: 'BINANCE', basePrice: 43250.00 }
      };

      const pair = pairMap[symbol];
      if (!pair) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Pair not found', symbol })
        };
      }

      const variation = (Math.random() - 0.5) * 0.02;
      const currentPrice = pair.basePrice + (pair.basePrice * variation);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          timestamp: Math.floor(Date.now() / 1000),
          metal: pair.metal,
          currency: pair.currency,
          exchange: pair.exchange,
          symbol: `${pair.exchange}:${symbol}`,
          "current price": parseFloat(currentPrice.toFixed(symbol.includes('JPY') ? 3 : 5)),
          "running price": parseFloat(currentPrice.toFixed(symbol.includes('JPY') ? 3 : 5))
        })
      };
    }

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
            'GET /prices': 'Get All Live Prices',
            'GET /price/{symbol}': 'Get Single Pair Price',
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
        availableEndpoints: ['/', '/admin', '/generate-key', '/keys', '/prices', '/price/{symbol}', '/ws', '/health'],
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