import express from 'express';
import HotelController from '../controllers/HotelController';
import upload from '../middlewares/upload';

const router = express.Router();

router.get('/list', HotelController.list);
router.get('/single/:id', HotelController.single);
router.post('/create', upload.array('images[]', 10), HotelController.create);
router.put('/update', upload.array('images[]', 10), HotelController.update);
router.delete('/delete/:id', HotelController.delete);

export default router;
