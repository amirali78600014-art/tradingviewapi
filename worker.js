const VALID_API_KEYS = new Set([
  'demo-key-123',
  'test-key-456', 
  'live-key-789'
]);

function generateApiKey() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return 'fxapi-' + Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      if (path === '/' || path === '/api') {
        return new Response(JSON.stringify({
          message: 'Forex API Server is running on Cloudflare Workers',
          endpoints: {
            '/': 'Main page',
            '/admin': 'Admin panel',
            '/api/generate-key': 'Generate API Key (POST)',
            '/api/keys': 'List API Keys (GET)',
            '/ws': 'WebSocket info'
          },
          status: 'active',
          timestamp: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (path === '/admin') {
        return new Response(JSON.stringify({
          message: 'Admin Panel',
          description: 'API Key Management',
          availableKeys: VALID_API_KEYS.size
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (path === '/api/generate-key' && method === 'POST') {
        const newKey = generateApiKey();
        VALID_API_KEYS.add(newKey);
        return new Response(JSON.stringify({
          apiKey: newKey,
          message: 'API Key generated successfully',
          timestamp: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (path === '/api/keys' && method === 'GET') {
        return new Response(JSON.stringify({
          keys: Array.from(VALID_API_KEYS),
          count: VALID_API_KEYS.size,
          timestamp: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (path === '/ws') {
        return new Response(JSON.stringify({
          message: 'WebSocket endpoint for real-time forex data',
          pairs: [
            'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD',
            'USDCHF', 'NZDUSD', 'EURGBP', 'EURJPY', 'GBPJPY',
            'XAUUSD', 'XAGUSD', 'BTCUSDT', 'ETHUSDT'
          ],
          status: 'available'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({
        error: 'Not Found',
        path: path
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};