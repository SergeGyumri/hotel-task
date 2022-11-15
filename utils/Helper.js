import fs from 'fs';
import path from 'path';
import os from 'os';
import _ from 'lodash';

class Helper {
  static createImages = (images, hotelId, roomId) => {
    const createdImagesPath = [];
    const hotelFilesDir = path.join(__dirname, `../public/uploads/${hotelId}`);
    if (!fs.existsSync(hotelFilesDir)) {
      fs.mkdirSync(hotelFilesDir);
    }
    images.forEach((img) => {
      fs.renameSync(path.join(os.tmpdir(), img.filename), path.join(hotelFilesDir, img.filename));
      createdImagesPath.push({ url: path.join(`uploads/${hotelId}`, img.filename), hotelId, roomId });
    });
    return createdImagesPath;
  };

  static delete = (images, hotelId, roomId) => {
    const hotelFilesDir = path.join(__dirname, '../public');
    if (fs.existsSync(hotelFilesDir)) {
      if (_.isEmpty(roomId)) {
        fs.rmSync(path.join(hotelFilesDir, `uploads/${hotelId}`), { recursive: true });
      }
      if (!_.isEmpty(roomId)) {
        images.forEach((url) => {
          if (fs.existsSync(path.join(hotelFilesDir, url.url))) {
            fs.unlinkSync(path.join(hotelFilesDir, url.url));
          }
        });
      }
    }
  };

  static deleteImages = (previousImages, stayPaths) => {
    const deletes = _.differenceBy(previousImages, stayPaths, 'url');
    const hotelFilesDir = path.join(__dirname, '../public');
    deletes.forEach((img) => {
      if (fs.existsSync(path.join(hotelFilesDir, img.url))) {
        fs.unlinkSync(path.join(hotelFilesDir, img.url));
      }
    });
    return deletes;
  };
}

export default Helper;
