import express from 'express';
import hotel from './hotel';
import room from './room';
import reserve from './reserve';

const router = express.Router();

router.use('/hotel', hotel);
router.use('/room', room);
router.use('/reserve', reserve);

export default router;
