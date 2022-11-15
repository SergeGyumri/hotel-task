import express from 'express';
import RoomController from '../controllers/RoomController';
import upload from '../middlewares/upload';

const router = express.Router();

router.get('/list/:hotelId', RoomController.list);
router.get('/single/:id', RoomController.single);
router.post('/create', upload.array('images[]', 10), RoomController.create);
router.put('/update', upload.array('images[]', 10), RoomController.update);
router.delete('/delete/:id', RoomController.delete);

export default router;
