import os from 'os';
import multer from 'multer';
import HttpErrors from 'http-errors';
import { v4 as uuidV4 } from 'uuid';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, os.tmpdir()),
  filename: (req, file, cb) => cb(null, `${uuidV4()}_${file.originalname}`),

});

const upload = multer({
  storage,
  fileFilter(req, file, callback) {
    const arr = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp'];
    console.log(file);
    if (!arr.includes(file.mimetype)) {
      callback(HttpErrors(422, {
        errors: {
          images: ['images error'],
        },
      }), true);
    } else {
      callback(null, true);
    }
  },
});

export default upload;
