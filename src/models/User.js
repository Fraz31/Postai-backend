import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    subscriptionPlan: { type: String, default: 'free' }, // free, pro, premium
    subscriptionStatus: { type: String, default: 'inactive' }, // inactive, active, canceled, expired
    subscriptionRenewsAt: { type: Date },
    dailyCredits: {
      date: { type: String }, // yyyy-mm-dd
      used: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model('User', userSchema);

export default User;
