import {v4 as uuidv4} from 'uuid';
import * as fs from 'fs';
import path from 'path';
import os from 'os';
import validate from '../services/validate';
import {Images} from '../models';

class HotelController {
  static addHotel = async (req, res, next) => {
    try {
      validate({images: req.files}, {
        'images.*.path': 'string|required',
      });

      fs.readdirSync(os.tmpdir()).map((fileName) => {
        console.log(path.join(fileName))
      });

      // ete mnacac fildery chisht en u images array ka
      // req.files.forEach((img, index) => {
      //   const fileName = `${uuidv4()}_${req.files[index].originalname}`;
      //   fs.writeFileSync(path.join(__dirname, '../public', fileName), 'hello worls');
      // });
      // const images = req.files;
      // const imagesPath = [];
      // images.forEach((file) => {
      //   imagesPath.push({ image: path.join('./uploads', file.filename) });
      // });
      // await Images.bulkCreate(imagesPath);

      res.json({
        status: 'ok',
      });
    } catch (e) {
      next(e);
    }
  };
}

export default HotelController;
