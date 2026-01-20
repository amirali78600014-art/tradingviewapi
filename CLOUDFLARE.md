# Cloudflare Workers Deployment

## Setup

1. Install Wrangler CLI:
```bash
npm install -g wrangler
```

2. Login to Cloudflare:
```bash
wrangler login
```

3. Deploy:
```bash
wrangler deploy
```

## Local Development

```bash
npm install
npm run dev
```

## Endpoints

- `/` - API info
- `/admin` - Admin panel
- `/api/generate-key` - Generate API key (POST)
- `/api/keys` - List API keys (GET)
- `/ws` - WebSocket info

## Features

✅ Cloudflare Workers compatible
✅ Edge computing
✅ Global CDN
✅ Fast response times
✅ No cold starts