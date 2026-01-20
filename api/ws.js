module.exports = (req, res) => {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'GET') {
      return res.status(200).json({
        message: 'WebSocket endpoint for real-time forex data',
        usage: 'Connect via WebSocket and send auth message with API key',
        pairs: [
          'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD',
          'USDCHF', 'NZDUSD', 'EURGBP', 'EURJPY', 'GBPJPY',
          'XAUUSD', 'XAGUSD', 'BTCUSDT', 'ETHUSDT'
        ],
        status: 'available',
        timestamp: new Date().toISOString()
      });
    }

    return res.status(405).json({ 
      error: 'Method not allowed',
      allowed: ['GET'],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('WebSocket endpoint error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};