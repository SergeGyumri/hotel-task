import express from 'express';
import HotelController from '../controllers/HotelController';
import upload from '../middlewares/upload';

const router = express.Router();
router.post('/create', upload.any(), HotelController.create);
router.put('/update', upload.any(), HotelController.update);
router.delete('/delete/:id', HotelController.delete);
router.get('/list', HotelController.list);
router.get('/single/:id', HotelController.single);

export default router;
