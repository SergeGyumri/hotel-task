import multer from 'multer';
import HttpErrors from 'http-errors';
import { v4 as uuidV4 } from 'uuid';
import os from 'os';

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, os.tmpdir());
    },
    filename: (req, file, cb) => {
      if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
        cb(HttpErrors(407, 'invalid file'));
        return;
      }
      const fileName = `${uuidV4()}_${file.originalname}`;
      cb(null, fileName);
    },
  }),
});

export default upload;
