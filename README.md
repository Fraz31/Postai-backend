# PostAI Backend

Express.js backend for PostAI SaaS application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

3. Add your API keys to `.env`:
```
API_KEY=your_api_key_here
PORT=5000
```

## Running Locally

```bash
npm start
```

The server will run on `http://localhost:5000`

## Render Deployment

### Environment Variables

Set these in your Render dashboard:

- **API_KEY**: Your OpenAI, Notion, or email service API key
- **PORT**: Automatically set by Render (default: 5000)

### Build & Start Commands

- **Build Command**: (leave empty)
- **Start Command**: `npm start`

The service will automatically detect Node.js and install dependencies.

## API Endpoints

- `GET /api` - Test endpoint that returns backend status and API key status

