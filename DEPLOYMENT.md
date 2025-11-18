# Render Deployment Guide for PostAI Backend

## Step 1: Create a New Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your Git repository (postai-backend)
4. Or use "Manual Deploy" and upload the files

## Step 2: Configure Build & Start Commands

- **Environment**: Node
- **Build Command**: (leave empty)
- **Start Command**: `npm start`
- **Node Version**: 18.x or higher (auto-detected)

## Step 3: Set Environment Variables

Click on "Environment" tab and add:

| Key | Value | Description |
|-----|-------|-------------|
| `API_KEY` | `your_api_key_here` | Your OpenAI, Notion, or email service API key |
| `PORT` | `5000` | Port (optional, Render sets this automatically) |

### Getting API Keys:

- **OpenAI**: https://platform.openai.com/api-keys
- **Notion**: https://www.notion.so/my-integrations
- **Email Service**: Check your email provider's documentation

## Step 4: Deploy

Click "Create Web Service" and Render will:
1. Install dependencies (`npm install`)
2. Start the service with `npm start`
3. Provide a URL like: `https://postai-backend.onrender.com`

## Step 5: Update Frontend

After deployment, update the frontend's `config.js` or `index.html` with your backend URL:
```javascript
const BACKEND_URL = 'https://postai-backend.onrender.com/api';
```

## Troubleshooting

- **Build fails**: Make sure `package.json` is in the root directory
- **Service crashes**: Check logs in Render dashboard
- **API not working**: Verify `API_KEY` environment variable is set

