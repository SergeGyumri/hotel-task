import express from 'express';
import ReserveController from '../controllers/ReserveController';

const router = express.Router();

router.post('/create', ReserveController.create);
router.put('/update', ReserveController.update);
router.delete('/delete/:id', ReserveController.delete);

export default router;
