import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String }, // Optional for now if we add Google Auth later
    subscriptionPlan: { type: String, default: 'free' }, // free, pro, premium
    subscriptionStatus: { type: String, default: 'inactive' }, // inactive, active, canceled, expired
    subscriptionRenewsAt: { type: Date },
    dailyCredits: {
      date: { type: String }, // yyyy-mm-dd
      used: { type: Number, default: 0 }
    },
    // New fields for Real Functionality
    apiKeys: {
      openai: { type: String }, // User provided OpenAI Key
      stability: { type: String } // User provided Stability Key
    },
    socialAccounts: {
      twitter: {
        connected: { type: Boolean, default: false },
        accessToken: String,
        refreshToken: String,
        username: String
      },
      linkedin: {
        connected: { type: Boolean, default: false },
        accessToken: String,
        username: String
      },
      instagram: {
        connected: { type: Boolean, default: false },
        accessToken: String,
        username: String
      },
      facebook: {
        connected: { type: Boolean, default: false },
        accessToken: String,
        username: String
      },
      tiktok: {
        connected: { type: Boolean, default: false },
        accessToken: String,
        username: String
      }
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model('User', userSchema);

export default User;
