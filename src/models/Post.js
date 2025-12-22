import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true
        },
        platform: {
            type: String,
            enum: ['twitter', 'linkedin', 'instagram', 'facebook', 'tiktok', 'threads'],
            required: true
        },
        status: {
            type: String,
            enum: ['draft', 'scheduled', 'published', 'failed'],
            default: 'draft'
        },
        scheduledAt: {
            type: Date
        },
        publishedAt: {
            type: Date
        },
        imageUrl: {
            type: String
        },
        metadata: {
            hashtags: [String],
            mentions: [String],
            engagement: {
                likes: { type: Number, default: 0 },
                shares: { type: Number, default: 0 },
                comments: { type: Number, default: 0 }
            }
        }
    },
    {
        timestamps: true
    }
);

// Index for efficient scheduler queries
postSchema.index({ status: 1, scheduledAt: 1 });
postSchema.index({ userId: 1, createdAt: -1 });

const Post = mongoose.model('Post', postSchema);

export default Post;
