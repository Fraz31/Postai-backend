import { openai, generateContent as libGenerate, enrichContent as libEnrich } from '../lib/openai.js';
import { generateImage } from '../lib/imageGen.js';

export async function generateContent(req, res, next) {
  try {
    const { contentType, prompt, platforms, schedule, scheduledTime, generateImage: shouldGenerateImage } = req.body || {};

    const trimmedPrompt = (prompt || '').trim();

    if (!trimmedPrompt) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    if (trimmedPrompt.length > 1000) {
      return res.status(400).json({ success: false, message: 'Prompt is too long' });
    }

    // Call OpenAI Library
    const generated = await libGenerate(trimmedPrompt, contentType);

    let imageUrl = null;
    if (shouldGenerateImage) {
      try {
        imageUrl = await generateImage(trimmedPrompt);
      } catch (err) {
        console.error('Image generation failed:', err);
        // Don't fail the whole request if image fails
      }
    }

    const content = generated.text;

    const meta = {
      contentType: contentType || 'post',
      platforms: platforms || [],
      schedule: !!schedule,
      scheduledTime: schedule ? scheduledTime || null : null,
      model: 'gpt-4o-mini',
      imageUrl,
      tokensUsed: null
    };

    return res.json({ success: true, content, meta });
  } catch (error) {
    return next(error);
  }
}

export async function enrichContent(req, res, next) {
  try {
    const { content } = req.body || {};

    const trimmed = (content || '').trim();

    if (!trimmed) {
      return res.status(400).json({ success: false, message: 'Content is required' });
    }

    if (trimmed.length > 2000) {
      return res.status(400).json({ success: false, message: 'Content is too long' });
    }

    const enriched = await libEnrich(trimmed);

    const meta = {
      operation: 'enrich',
      model: 'gpt-4o-mini',
      tokensUsed: null
    };

    return res.json({ success: true, content: enriched.enriched, meta });
  } catch (error) {
    return next(error);
  }
}
