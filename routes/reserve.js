import express from 'express';
import ReserveController from '../controllers/ReserveController';

const router = express.Router();

router.post('/create', ReserveController.create);

export default router;
