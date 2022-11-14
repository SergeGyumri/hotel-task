import HttpErrors from 'http-errors';
import _ from 'lodash';
import validate from '../services/validate';
import { Hotel, Images } from '../models';
import Helper from '../utils/Helper';

class HotelController {
  static addHotel = async (req, res, next) => {
    try {
      const images = req.files;
      const { name, address, phone } = req.body;
      validate(req.body, {
        name: 'string|min:1|max:20|required',
        address: 'string|min:5|max:20|required',
        phone: 'string|min:3|max:20|required',
      });
      validate({ images }, {
        'images.*.path': 'string|required',
      });
      const checkHotel = await Hotel.findOne({
        where: {
          $or: [
            { name },
            { address },
          ],
        },
      });
      if (!_.isEmpty(checkHotel)) {
        throw HttpErrors(422, 'choose another address or name');
      }
      const hotel = await Hotel.create({
        name, address, phone,
      });
      const createdImagesPath = Helper.imgWork(images, hotel.id);
      await Images.bulkCreate(createdImagesPath);
      const imagesPath = createdImagesPath.map((img) => img.url);

      res.json({
        status: 'ok',
        hotel,
        imagesPath,
      });
    } catch (e) {
      next(e);
    }
  };

  static editHotel = async (req, res, next) => {
    try {
      const {
        id, name, address, phone, newPaths,
      } = req.body;
      const images = req.files;
      validate(req.body, {
        name: 'string|min:1|max:20|required',
        address: 'string|min:5|max:20|required',
        phone: 'string|min:3|max:20|required',
        id: 'numeric|required',
        newPaths: 'array|max:10',
      });
      validate({ images }, {
        'images.*.path': 'string',
      });
      if (_.isEmpty(images) && _.isEmpty(newPaths)) {
        throw HttpErrors(409, 'images error');
      }
      if ((!_.isEmpty(images) && !_.isEmpty(newPaths)) && (images.length + newPaths.length > 10)) {
        throw HttpErrors(409, 'images error');
      }
      const checkHotel = await Hotel.findOne({
        where: {
          id,
        },
      });
      if (_.isEmpty(checkHotel)) {
        throw HttpErrors(422, 'hotel not found');
      }
      const previousImages = await Images.findAll({
        where: {
          hotelId: id,
        },
        raw: true,
        attributes: ['url'],
      });
      const deletedImages = Helper.updateImages(previousImages, newPaths, id);
      await Hotel.update({ name, address, phone }, {
        where: {
          id,
        },
      });
      await Images.destroy({
        where: {
          url: deletedImages,
          hotelId: id,
        },
      });
      const createdImagesPath = Helper.imgWork(images, id);
      await Images.bulkCreate(createdImagesPath);
      const imagesPath = await Images.findAll({
        where: {
          hotelId: id,
        },
        raw: true,
        attributes: ['url', 'id'],
      });
      const hotel = await Hotel.findOne({
        where: {
          id,
        },
        raw: true,
      });
      res.json({
        status: 'ok',
        hotel,
        imagesPath,
      });
    } catch (e) {
      next(e);
    }
  };

  static deleteHotel = async (req, res, next) => {
    try {
      const { id } = req.body;
      validate(req.body, {
        id: 'numeric|required',
      });
      const checkHotel = await Hotel.findOne({
        where: {
          id,
        },
      });
      if (_.isEmpty(checkHotel)) {
        throw HttpErrors(422, 'hotel not found');
      }
      const images = await Images.findAll({
        where: {
          hotelId: id,
        },
        raw: true,
      });
      Helper.deleteHotel(images, id);
      await Hotel.destroy({
        where: {
          id,
        },
      });
      res.json({
        status: 'ok',
      });
    } catch (e) {
      next(e);
    }
  };
}

export default HotelController;
