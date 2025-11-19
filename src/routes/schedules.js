import express from 'express';
import { createScheduleSchema, updateScheduleSchema } from '../schemas/schedule.js';
import { createSchedule, getUserSchedules, getSchedule, updateSchedule, deleteSchedule } from '../services/schedules.js';
import { validateSchema, authMiddleware } from '../middleware/auth.js';
import { logger } from '../lib/logger.js';

const router = express.Router();

router.post('/', authMiddleware, validateSchema(createScheduleSchema), async (req, res, next) => {
  try {
    const schedule = await createSchedule(req.user.id, req.validatedData);
    res.status(201).json(schedule);
  } catch (error) {
    logger.error('Create schedule error', error);
    res.status(500).json({ error: 'Failed to create schedule' });
  }
});

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = parseInt(req.query.offset) || 0;
    const { schedules, total } = await getUserSchedules(req.user.id, limit, offset);
    res.json({ schedules, total, limit, offset });
  } catch (error) {
    logger.error('Get schedules error', error);
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const schedule = await getSchedule(req.user.id, req.params.id);
    res.json(schedule);
  } catch (error) {
    logger.error('Get schedule error', error);
    res.status(404).json({ error: error.message });
  }
});

router.patch('/:id', authMiddleware, validateSchema(updateScheduleSchema), async (req, res, next) => {
  try {
    const schedule = await updateSchedule(req.user.id, req.params.id, req.validatedData);
    res.json(schedule);
  } catch (error) {
    logger.error('Update schedule error', error);
    res.status(500).json({ error: 'Failed to update schedule' });
  }
});

router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    await deleteSchedule(req.user.id, req.params.id);
    res.json({ success: true });
  } catch (error) {
    logger.error('Delete schedule error', error);
    res.status(500).json({ error: 'Failed to delete schedule' });
  }
});

export default router;
