import OpenAI from 'openai';
import { env } from '../config/env.js';
import { logger } from './logger.js';

const openai = env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: env.OPENAI_API_KEY })
    : null;

export async function generateImage(prompt) {
    if (!openai) {
        logger.warn('OpenAI API Key missing for image generation');
        return null;
    }

    try {
        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: "1024x1024",
        });

        return response.data[0].url;
    } catch (error) {
        logger.error('Image Generation Error:', error);
        throw error;
    }
}
