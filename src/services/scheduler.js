import cron from 'node-cron';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { logger } from '../lib/logger.js';

// Initialize Scheduler
export function initScheduler() {
    logger.info('Starting Scheduler Service...');

    // Run every minute
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();

            // Find posts that are 'scheduled' and due
            const postsToPublish = await Post.find({
                status: 'scheduled',
                scheduledAt: { $lte: now }
            });

            if (postsToPublish.length > 0) {
                logger.info(`Found ${postsToPublish.length} posts to publish.`);

                for (const post of postsToPublish) {
                    await publishPost(post);
                }
            }
        } catch (error) {
            logger.error('Scheduler Error:', error);
        }
    });
}

async function publishPost(post) {
    try {
        const user = await User.findById(post.userId);
        if (!user) return;

        // TODO: Integrate real social media APIs here
        // For now, we simulate success

        logger.info(`Publishing post ${post._id} to ${post.platform} for user ${user.email}`);

        // Update post status
        post.status = 'published';
        post.publishedAt = new Date();
        await post.save();

    } catch (error) {
        logger.error(`Failed to publish post ${post._id}:`, error);
        post.status = 'failed';
        await post.save();
    }
}
