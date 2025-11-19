import express from 'express';
import { signUpSchema, signInSchema, updateProfileSchema } from '../schemas/auth.js';
import { registerUser, loginUser, getUserProfile, updateUserProfile } from '../services/auth.js';
import { validateSchema, authMiddleware } from '../middleware/auth.js';
import { logger } from '../lib/logger.js';

const router = express.Router();

router.post('/signup', validateSchema(signUpSchema), async (req, res, next) => {
  try {
    const { email, password, username } = req.validatedData;
    const result = await registerUser(email, password, username);
    res.status(201).json(result);
  } catch (error) {
    logger.error('Signup error', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/signin', validateSchema(signInSchema), async (req, res, next) => {
  try {
    const { email, password } = req.validatedData;
    const result = await loginUser(email, password);
    res.json(result);
  } catch (error) {
    logger.error('Signin error', error);
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

router.get('/profile', authMiddleware, async (req, res, next) => {
  try {
    const profile = await getUserProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    logger.error('Get profile error', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.patch('/profile', authMiddleware, validateSchema(updateProfileSchema), async (req, res, next) => {
  try {
    const profile = await updateUserProfile(req.user.id, req.validatedData);
    res.json(profile);
  } catch (error) {
    logger.error('Update profile error', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
