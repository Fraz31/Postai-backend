import User from '../models/User.js';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt.js';

function normalizeEmail(email) {
  return email.toLowerCase().trim();
}

export async function register(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const normalizedEmail = normalizeEmail(email);
    const existing = await User.findOne({ email: normalizedEmail });

    if (existing) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      email: normalizedEmail,
      subscriptionPlan: 'free',
      subscriptionStatus: 'inactive'
    });

    const { accessToken, refreshToken } = generateTokenPair(user._id.toString());

    return res.json({
      success: true,
      user,
      accessToken,
      refreshToken,
      // Legacy field for existing frontend integration
      token: accessToken
    });
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const normalizedEmail = normalizeEmail(email);

    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      user = await User.create({
        email: normalizedEmail,
        subscriptionPlan: 'free',
        subscriptionStatus: 'inactive'
      });
    }

    const { accessToken, refreshToken } = generateTokenPair(user._id.toString());

    return res.json({
      success: true,
      user,
      accessToken,
      refreshToken,
      // Legacy field for existing frontend integration
      token: accessToken
    });
  } catch (error) {
    return next(error);
  }
}

export async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body || {};

    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token is required' });
    }

    const payload = verifyRefreshToken(refreshToken);
    const userId = payload.sub;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    const tokens = generateTokenPair(user._id.toString());

    return res.json({
      success: true,
      user,
      ...tokens,
      // Legacy field for existing frontend integration
      token: tokens.accessToken
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

export async function getMe(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    return res.json({ success: true, user: req.user });
  } catch (error) {
    return next(error);
  }
}

export async function updateConnection(req, res, next) {
  try {
    const { platform, token } = req.body;
    const userId = req.user._id;

    if (!platform || !token) {
      return res.status(400).json({ success: false, message: 'Platform and token are required' });
    }

    const validPlatforms = ['twitter', 'linkedin', 'instagram', 'facebook', 'tiktok'];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({ success: false, message: 'Invalid platform' });
    }

    const update = {};
    update[`socialAccounts.${platform}`] = {
      connected: true,
      accessToken: token,
      username: 'Connected User' // Placeholder until we fetch real profile
    };

    const user = await User.findByIdAndUpdate(userId, { $set: update }, { new: true });

    return res.json({ success: true, user });
  } catch (error) {
    return next(error);
  }
}
