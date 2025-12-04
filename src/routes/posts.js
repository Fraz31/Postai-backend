import express from 'express';
import { createPost, getUserPosts, getPost, updatePost, deletePost, enrichPostContent } from '../services/posts.js';
import { requireAuth } from '../middleware/auth.js';
import { logger } from '../lib/logger.js';

const router = express.Router();

router.post('/', requireAuth, async (req, res, next) => {
  try {
    // req.validatedData was populated by validateSchema, but we removed it.
    // We should use req.body directly for now or add manual validation.
    const post = await createPost(req.user.id, req.body);
    res.status(201).json(post);
  } catch (error) {
    logger.error('Create post error', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = parseInt(req.query.offset) || 0;
    const { posts, total } = await getUserPosts(req.user.id, limit, offset);
    res.json({ posts, total, limit, offset });
  } catch (error) {
    logger.error('Get posts error', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const post = await getPost(req.user.id, req.params.id);
    res.json(post);
  } catch (error) {
    logger.error('Get post error', error);
    res.status(404).json({ error: error.message });
  }
});

router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const post = await updatePost(req.user.id, req.params.id, req.body);
    res.json(post);
  } catch (error) {
    logger.error('Update post error', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    await deletePost(req.user.id, req.params.id);
    res.json({ success: true });
  } catch (error) {
    logger.error('Delete post error', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

router.post('/enrich', requireAuth, async (req, res, next) => {
  try {
    const enrichment = await enrichPostContent(req.user.id, req.body.content);
    res.json(enrichment);
  } catch (error) {
    logger.error('Enrich content error', error);
    res.status(500).json({ error: 'Failed to enrich content' });
  }
});

export default router;
