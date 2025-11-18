# Environment Variables Setup

## Creating .env file

Since `.env.example` couldn't be created automatically, create it manually:

1. Create a file named `.env` in the `postai-backend` folder
2. Add the following content:

```
API_KEY=your_api_key_here
PORT=5000
```

## For Local Development

1. Copy the content above into a new `.env` file
2. Replace `your_api_key_here` with your actual API key
3. The `.env` file is already in `.gitignore`, so it won't be committed

## For Render Deployment

Set environment variables in the Render dashboard:

1. Go to your service → "Environment" tab
2. Add:
   - **Key**: `API_KEY`
   - **Value**: Your actual API key
3. **PORT** is automatically set by Render, but you can add it if needed

## Getting API Keys

### OpenAI
- Visit: https://platform.openai.com/api-keys
- Click "Create new secret key"
- Copy the key (starts with `sk-`)

### Notion
- Visit: https://www.notion.so/my-integrations
- Click "New integration"
- Copy the "Internal Integration Token"

### Email Services
- **SendGrid**: Dashboard → Settings → API Keys
- **Mailgun**: Dashboard → Settings → API Keys
- **Resend**: Dashboard → API Keys

