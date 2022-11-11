import express from 'express';
import RoomController from '../controllers/RoomController';

const router = express.Router();

router.post('/add-room', RoomController.addRoom);

export default router;
