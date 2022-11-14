import express from 'express';
import HotelController from '../controllers/HotelController';
import upload from '../middlewares/upload';

const router = express.Router();

router.post('/add-hotel', upload.array('images[]', 10), HotelController.addHotel);
router.put('/edit-hotel', upload.array('images[]', 10), HotelController.editHotel);
router.delete('/delete-hotel', HotelController.deleteHotel);

export default router;
