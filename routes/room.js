import express from 'express';
import RoomController from '../controllers/RoomController';
import upload from '../middlewares/upload';

const router = express.Router();

router.get('/list/:hotelId', RoomController.list);
router.get('/single/:id', RoomController.single);
router.get('/list', RoomController.search);
router.post('/create', upload.any(), RoomController.create);
router.put('/update', upload.any(), RoomController.update);
router.delete('/delete/:id', RoomController.delete);

export default router;
