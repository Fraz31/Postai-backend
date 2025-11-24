import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    subscriptionPlan: { type: String, default: 'free' }, // free, pro, premium
    subscriptionStatus: { type: String, default: 'free' }, // free, active, canceled, etc.
    subscriptionUpdated: { type: Date }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model('User', userSchema);

export default User;
