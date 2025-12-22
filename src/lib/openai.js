import OpenAI from 'openai';
import { env } from '../config/env.js';

export const openai = env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: env.OPENAI_API_KEY })
  : null;

export async function generateContent(prompt, contentType = 'post', apiKey = null) {
  let client = openai;

  if (apiKey) {
    client = new OpenAI({ apiKey });
  }

  if (!client) {
    return generatePlaceholderContent(prompt, contentType);
  }

  try {
    const systemPrompt = getSystemPrompt(contentType);

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const content = response.choices[0].message.content;
    const hashtags = extractHashtags(content);

    return {
      text: content,
      hashtags,
      suggestions: generateSuggestions(content),
      aiEnhanced: true
    };
  } catch (error) {
    console.error('OpenAI error:', error);
    return generatePlaceholderContent(prompt, contentType);
  }
}

export async function enrichContent(content, apiKey = null) {
  let client = openai;

  if (apiKey) {
    client = new OpenAI({ apiKey });
  }

  if (!client) {
    return generatePlaceholderEnrichment(content);
  }

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert social media content optimizer. Improve the given content for maximum engagement while maintaining the original message. Return only the improved content.'
        },
        { role: 'user', content: `Enhance this content: ${content}` }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    const enriched = response.choices[0].message.content;
    const score = calculateEngagementScore(enriched);

    return {
      enriched,
      score,
      suggestions: [
        'Add relevant hashtags',
        'Include a call-to-action',
        'Optimize for engagement'
      ]
    };
  } catch (error) {
    console.error('OpenAI enrichment error:', error);
    return generatePlaceholderEnrichment(content);
  }
}

function getSystemPrompt(contentType) {
  const prompts = {
    post: 'Create an engaging social media post that is concise, relatable, and encourages interaction.',
    article: 'Create an informative article outline with key points and call-to-action.',
    email: 'Create a compelling email that converts readers to action.'
  };
  return prompts[contentType] || prompts.post;
}

function extractHashtags(text) {
  const hashtagRegex = /#\w+/g;
  return text.match(hashtagRegex) || [];
}

function generateSuggestions(content) {
  return [
    'Engaging post about the topic',
    'Professional version for LinkedIn',
    'Casual version for Twitter/X'
  ];
}

function calculateEngagementScore(content) {
  let score = 50;
  if (content.length > 100) score += 10;
  if (content.includes('?')) score += 5;
  if (content.includes('!')) score += 5;
  if (/(http|https):\/\//.test(content)) score += 10;
  return Math.min(score, 100);
}

function generatePlaceholderContent(prompt, contentType) {
  const templates = {
    post: [
      `🚀 Just discovered something amazing about ${prompt}! \n\nIt's incredible how technology is evolving. Here are 3 key takeaways:\n\n1️⃣ Efficiency is skyrocketing\n2️⃣ Accessibility is better than ever\n3️⃣ The future looks bright\n\nWhat are your thoughts? 👇\n\n#Innovation #TechTrends #Future`,
      `💡 Quick tip: When dealing with ${prompt}, always remember to focus on the fundamentals.\n\nSimplicity often wins over complexity. \n\nShare if you agree! 🔄\n\n#Productivity #Growth #Mindset`,
      `🔥 Hot take: ${prompt} is going to change everything in 2025.\n\nAre you ready for the shift? Let's discuss in the comments! 🗣️\n\n#Trends #Predictions #IndustryNews`
    ],
    thread: [
      `1/5 🧵 Let's talk about ${prompt}.\n\nA thread on why this matters now more than ever. 👇`,
      `2/5 First, the context. We've seen a massive shift in how people approach this. It's no longer just a nice-to-have.`,
      `3/5 The data speaks for itself. 📈 Engagement rates are up 40% when you optimize for this specific factor.`,
      `4/5 So, what can you do? Start small. Test, iterate, and scale what works. Don't overcomplicate it.`,
      `5/5 Thanks for reading! \n\nIf you found this helpful:\n1. Follow me for more\n2. RT the first tweet to share the knowledge! ♻️`
    ],
    caption: [
      `✨ Magic happens when you focus on ${prompt}.\n.\n.\nDouble tap if you needed to hear this today! ❤️\n.\n#Inspiration #DailyGrind #Success`,
      `POV: You just mastered ${prompt} and life is good. 😎\n.\nTag a friend who needs to see this! 👇\n.\n#Lifestyle #Goals #Vibes`,
      `Sunday reset with some thoughts on ${prompt}. 🌿\n.\nReady to crush the week ahead!\n.\n#SundayVibes #Motivation #FreshStart`
    ],
    article: [
      `# The Future of ${prompt}: A Comprehensive Guide\n\n## Introduction\nIn today's rapidly evolving landscape, understanding ${prompt} is crucial for success. This article explores the key drivers and implications.\n\n## Why It Matters\nWe are witnessing a paradigm shift. The old rules no longer apply.\n\n## Key Strategies\n1. **Embrace Change**: Adaptability is your best asset.\n2. **Leverage Data**: Make informed decisions.\n3. **Focus on Value**: Solve real problems.\n\n## Conclusion\nThe opportunity is massive for those who act now.`,
      `# Mastering ${prompt} in 5 Easy Steps\n\n## 1. Start with the Basics\nDon't run before you can walk. Build a solid foundation.\n\n## 2. Analyze the Market\nLook at what the leaders are doing, but find your unique angle.\n\n## 3. Iterate Quickly\nFail fast, learn faster.\n\n## Summary\nSuccess is a journey, not a destination. Keep pushing forward.`
    ]
  };

  // Select a random template based on content type, or default to 'post'
  const type = templates[contentType] ? contentType : 'post';
  const options = templates[type];
  const selectedTemplate = Array.isArray(options)
    ? options[Math.floor(Math.random() * options.length)]
    : options[0];

  // If it's a thread, join the array. If it's a string, use it directly.
  const text = Array.isArray(selectedTemplate) ? selectedTemplate.join('\n\n') : selectedTemplate;

  return {
    text: text,
    hashtags: ['#AI', '#Growth', '#Innovation', '#SocialMonkey'],
    suggestions: [
      `Make it more punchy`,
      `Add an emoji to the hook`,
      `Include a specific call to action`
    ],
    aiEnhanced: false, // Flag to show this is a demo/placeholder
    demoMode: true
  };
}

function generatePlaceholderEnrichment(content) {
  return {
    enriched: `${content}\n\n✨ [AI Polished]: Added more engaging hook and relevant emojis!`,
    score: 85,
    suggestions: [
      'Add relevant hashtags',
      'Include a call-to-action',
      'Optimize for engagement'
    ]
  };
}
