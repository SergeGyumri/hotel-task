import HttpErrors from 'http-errors';
import _ from 'lodash';
import validate from '../services/validate';
import { Hotel, Images, Rooms } from '../models';
import Helper from '../utils/Helper';

class HotelController {
  static list = async (req, res, next) => {
    try {
      const hotel = await Hotel.findAll({
        attributes: ['id', 'name', 'address', 'phone'],
        include: [{
          model: Rooms,
          as: 'rooms',
          attributes: ['id', 'number', 'doubleBed', 'singleBed', 'price', 'hotelId'],
          include: [{
            model: Images,
            as: 'images',
            attributes: ['id', 'url'],
          }],
        }, {
          model: Images,
          as: 'images',
          where: {
            roomId: null,
          },
          attributes: ['id', 'url'],
        }],
      });
      res.json({
        status: 'ok',
        hotel,
      });
    } catch (e) {
      next(e);
    }
  };

  static single = async (req, res, next) => {
    try {
      const { id } = req.params;
      validate(req.params, {
        id: 'numeric|required',
      });
      const hotel = await Hotel.findOne({
        where: {
          id,
        },
        attributes: ['id', 'name', 'address', 'phone'],
        include: [{
          model: Rooms,
          as: 'rooms',
          attributes: ['id', 'number', 'doubleBed', 'singleBed', 'price'],
          include: [{
            model: Images,
            as: 'images',
            attributes: ['id', 'url'],
          }],
        }, {
          where: {
            roomId: null,
          },
          model: Images,
          as: 'images',
          attributes: ['id', 'url'],
        }],
      });
      res.json({
        status: 'ok',
        hotel,
      });
    } catch (e) {
      next(e);
    }
  };

  static create = async (req, res, next) => {
    try {
      const { name, address, phone } = req.body;
      validate(req.body, {
        name: 'string|min:1|max:20|required',
        address: 'string|min:5|max:20|required',
        phone: 'string|min:3|max:20|required',
      });
      validate(req.files, {
        'images.*.path': 'string|required',
      });
      let hotel = await Hotel.findOne({
        where: {
          $or: [
            { name },
            { address },
          ],
        },
      });
      if (!_.isEmpty(hotel)) {
        throw HttpErrors(422, 'choose another address or name');
      }
      hotel = await Hotel.create({
        name, address, phone,
      });
      const createdImagesPaths = Helper.createImages(req.files, hotel.id);
      await Images.bulkCreate(createdImagesPaths);
      const images = await Images.findAll({
        where: {
          hotelId: hotel.id,
        },
        attributes: ['id', 'url'],
      });
      res.json({
        status: 'ok',
        hotel,
        images,
      });
    } catch (e) {
      next(e);
    }
  };

  static update = async (req, res, next) => {
    try {
      const {
        id, name, address, phone, images,
      } = req.body;
      validate(req.body, {
        name: 'string|min:1|max:20|required',
        address: 'string|min:5|max:20|required',
        phone: 'string|min:3|max:20|required',
        id: 'numeric|required',
        images: 'array|max:10',
        'images.*.url': 'required|string',
      });
      if (_.isEmpty(req.files) && _.isEmpty(images)) {
        throw HttpErrors(409, 'images is required');
      }
      if ((!_.isEmpty(req.files) && !_.isEmpty(images))
        && (req.files.length + images.length > 10)) {
        throw HttpErrors(409, 'cannot be more than 10');
      }
      let hotel = await Hotel.findOne({
        where: {
          id,
        },
      });
      if (_.isEmpty(hotel)) {
        throw HttpErrors(422, 'hotel not found');
      }
      const previousImages = await Images.findAll({
        where: {
          hotelId: id,
        },
        attributes: ['url'],
      });
      const deletedImages = Helper.deleteImages(previousImages, images);
      await Hotel.update({ name, address, phone }, {
        where: {
          id,
        },
      });
      await Images.destroy({
        where: {
          url: { $in: deletedImages.map((d) => d.url) },
          hotelId: id,
        },
      });
      const newImages = Helper.createImages(req.files, id);
      await Images.bulkCreate(newImages);
      hotel = await Hotel.findAll({
        where: {
          id,
        },
        attributes: ['id', 'name', 'address', 'phone'],
        include: [{
          model: Images,
          as: 'images',
          attributes: ['id', 'url'],
        }],
      });
      res.json({
        status: 'ok',
        hotel,
      });
    } catch (e) {
      next(e);
    }
  };

  static delete = async (req, res, next) => {
    try {
      const { id } = req.params;
      validate(req.params, {
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
      Helper.delete(images, id);
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
