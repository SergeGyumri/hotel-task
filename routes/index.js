import express from 'express';
import hotel from './hotel';
import room from './room';

const router = express.Router();

router.use('/hotel', hotel);
router.use('/room', room);

export default router;
