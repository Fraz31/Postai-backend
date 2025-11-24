# Backend API Examples

Common API endpoint patterns for your PostAI backend.

## OpenAI Integration

```javascript
import express from 'express';
const app = express();

app.post('/api/openai/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: message }],
        max_tokens: 150
      })
    });
    
    const data = await response.json();
    res.json({ reply: data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Notion Integration

```javascript
app.post('/api/notion/page', async (req, res) => {
  try {
    const { title, content } = req.body;
    
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.API_KEY}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        parent: { database_id: process.env.NOTION_DATABASE_ID },
        properties: {
          title: { title: [{ text: { content: title } }] }
        },
        children: [{
          object: 'block',
          type: 'paragraph',
          paragraph: { rich_text: [{ text: { content } }] }
        }]
      })
    });
    
    const data = await response.json();
    res.json({ pageId: data.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Email Service (SendGrid)

```javascript
// Install: npm install @sendgrid/mail
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.API_KEY);

app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, text } = req.body;
    
    await sgMail.send({
      to,
      from: process.env.FROM_EMAIL,
      subject,
      text
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## File Upload

```javascript
// Install: npm install multer
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });

app.post('/api/upload', upload.single('file'), (req, res) => {
  res.json({ 
    filename: req.file.filename,
    size: req.file.size 
  });
});
```

## Database (MongoDB)

```javascript
// Install: npm install mongodb
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);

app.get('/api/data', async (req, res) => {
  await client.connect();
  const db = client.db('mydb');
  const items = await db.collection('items').find({}).toArray();
  res.json(items);
});

app.post('/api/data', async (req, res) => {
  await client.connect();
  const db = client.db('mydb');
  const result = await db.collection('items').insertOne(req.body);
  res.json({ id: result.insertedId });
});
```

## Authentication (JWT)

```javascript
// Install: npm install jsonwebtoken bcrypt
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  // Verify credentials...
  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '24h' });
  res.json({ token });
});

// Middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

app.get('/api/protected', authenticate, (req, res) => {
  res.json({ message: 'Protected route', user: req.user });
});
```

## Rate Limiting

```javascript
// Install: npm install express-rate-limit
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## Error Handling

```javascript
// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});
```

## CORS Configuration

```javascript
// More specific CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://your-frontend.onrender.com',
  credentials: true
}));
```

Add these to your `server.js` as needed!

