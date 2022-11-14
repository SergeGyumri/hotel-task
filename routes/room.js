import express from 'express';
import RoomController from '../controllers/RoomController';
import upload from '../middlewares/upload';

const router = express.Router();

router.post('/add-room', upload.array('images[]', 10), RoomController.addRoom);
router.put('/edit-room', upload.array('images[]', 10), RoomController.editRoom);
router.delete('/delete-room', RoomController.deleteRoom);

export default router;
