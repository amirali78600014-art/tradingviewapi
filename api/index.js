const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

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

  const { url, method } = req;

  if (url === '/' || url === '/api') {
    const htmlPath = path.join(process.cwd(), 'forex-test.html');
    if (fs.existsSync(htmlPath)) {
      const html = fs.readFileSync(htmlPath, 'utf8');
      res.setHeader('Content-Type', 'text/html');
      res.status(200).send(html);
    } else {
      res.status(200).json({
        message: 'Forex API Server is running',
        endpoints: {
          '/': 'Main page',
          '/admin': 'Admin panel',
          '/api/generate-key': 'Generate API Key (POST)',
          '/api/keys': 'List API Keys (GET)'
        },
        status: 'active'
      });
    }
  } else if (url === '/admin') {
    const htmlPath = path.join(process.cwd(), 'api-keys.html');
    if (fs.existsSync(htmlPath)) {
      const html = fs.readFileSync(htmlPath, 'utf8');
      res.setHeader('Content-Type', 'text/html');
      res.status(200).send(html);
    } else {
      res.status(200).json({ message: 'Admin panel not found' });
    }
  } else if (url === '/api/generate-key' && method === 'POST') {
    const newKey = generateApiKey();
    VALID_API_KEYS.add(newKey);
    res.status(200).json({ 
      apiKey: newKey, 
      message: 'API Key generated successfully' 
    });
  } else if (url === '/api/keys' && method === 'GET') {
    res.status(200).json({ 
      keys: Array.from(VALID_API_KEYS) 
    });
  } else if (url === '/favicon.ico') {
    res.status(204).end();
  } else {
    res.status(404).json({ error: 'Not Found' });
  }
};