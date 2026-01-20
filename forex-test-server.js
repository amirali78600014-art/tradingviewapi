const TradingView = require('./TradingView-API/main');
const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');
const crypto = require('crypto');

// Valid API Keys (aap yahan apni keys add kar sakte ho)
const VALID_API_KEYS = new Set([
  'demo-key-123',
  'test-key-456',
  'live-key-789'
]);

// Generate new API key function
function generateApiKey() {
  return 'fxapi-' + crypto.randomBytes(16).toString('hex');
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.url === '/') {
    fs.readFile('./forex-test.html', (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading page');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } else if (req.url === '/admin') {
    fs.readFile('./api-keys.html', (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading page');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } else if (req.url === '/generate-key' && req.method === 'POST') {
    const newKey = generateApiKey();
    VALID_API_KEYS.add(newKey);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ apiKey: newKey, message: 'API Key generated successfully' }));
  } else if (req.url === '/keys' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ keys: Array.from(VALID_API_KEYS) }));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

const wss = new WebSocket.Server({ server });

const pairs = [
  // Major Forex Pairs (Working)
  'FX_IDC:EURUSD',
  'FX_IDC:GBPUSD',
  'FX_IDC:USDJPY',
  'FX_IDC:AUDUSD',
  'FX_IDC:USDCAD',
  'FX_IDC:USDCHF',
  'FX_IDC:NZDUSD',
  'FX_IDC:EURGBP',
  'FX_IDC:EURJPY',
  'FX_IDC:GBPJPY',
  
  // Commodities (Working)
  'FX_IDC:XAUUSD', // Gold
  'FX_IDC:XAGUSD', // Silver
  
  // Crypto (Working)
  'BINANCE:BTCUSDT',
  'BINANCE:ETHUSDT',
  'BINANCE:BNBUSDT',
  'BINANCE:ADAUSDT',
  'BINANCE:XRPUSDT',
  'BINANCE:SOLUSDT',
  'BINANCE:DOGEUSDT',
  'BINANCE:MATICUSDT',
  'BINANCE:LTCUSDT',
  'BINANCE:LINKUSDT',
  
  // US Stocks (Working)
  'NASDAQ:AAPL',
  'NASDAQ:MSFT',
  'NASDAQ:GOOGL',
  'NASDAQ:AMZN',
  'NASDAQ:TSLA',
  'NASDAQ:META',
  'NASDAQ:NVDA',
  'NASDAQ:NFLX',
  
  // Indices (Working)
  'TVC:SPX500',
  'TVC:DJI',
  'TVC:IXIC'
];

wss.on('connection', (ws, req) => {
  console.log('Client attempting connection...');
  
  let isAuthenticated = false;
  let client = null;
  let charts = {};

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      // API Key verification
      if (data.type === 'auth' && data.apiKey) {
        if (VALID_API_KEYS.has(data.apiKey)) {
          isAuthenticated = true;
          ws.send(JSON.stringify({ type: 'auth', status: 'success', message: 'Authenticated successfully' }));
          console.log('Client authenticated with key:', data.apiKey);
          
          // Start streaming data
          startStreaming(ws);
        } else {
          ws.send(JSON.stringify({ type: 'auth', status: 'error', message: 'Invalid API Key' }));
          ws.close();
        }
      }
    } catch (err) {
      console.error('Message error:', err);
    }
  });

  function startStreaming(ws) {
    client = new TradingView.Client();
    charts = {};
    let connectedPairs = 0;

    pairs.forEach((pair, index) => {
      try {
        const chart = new client.Session.Chart();
        chart.setMarket(pair, { timeframe: '1' });

        chart.onUpdate(() => {
          if (chart.periods && chart.periods[0] && isAuthenticated) {
            const data = {
              type: 'price',
              pair: pair.replace(/^(FX_IDC:|BINANCE:|NASDAQ:|NYSE:|TVC:|COMEX:|COINBASE:|KRAKEN:)/, ''),
              price: chart.periods[0].close,
              open: chart.periods[0].open,
              high: chart.periods[0].high,
              low: chart.periods[0].low,
              time: new Date().toISOString()
            };
            
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify(data));
            }
          }
        });

        chart.onError((err) => {
          console.log(`Error with ${pair}:`, err);
        });

        charts[pair] = chart;
        connectedPairs++;
        console.log(`Connected to ${pair} (${connectedPairs}/${pairs.length})`);
        
      } catch (error) {
        console.log(`Failed to connect to ${pair}:`, error.message);
      }
    });

    console.log(`Successfully connected to ${connectedPairs} out of ${pairs.length} pairs`);
  }

  ws.on('close', () => {
    console.log('Client disconnected');
    if (client) {
      Object.values(charts).forEach(chart => chart.delete());
      client.end();
    }
  });
});

server.listen(process.env.PORT || 3001, () => {
  console.log(`Server running at http://localhost:${process.env.PORT || 3001}`);
  console.log('Open browser and check real-time forex data!');
});
