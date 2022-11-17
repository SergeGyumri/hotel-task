import _ from 'lodash';
import HttpErrors from 'http-errors';
import { Hotel, Images, Rooms } from '../models';
import validate from '../services/validate';
import Helper from '../utils/Helper';

class RoomController {
  static search = async (req, res, next) => {
    try {
      const {
        hotelId, singleBed, doubleBed, price,
      } = req.query;
      validate(req.query, {
        hotelId: 'numeric|required',
        price: 'numeric|required',
        singleBed: 'numeric|required|max:10|min:0',
        doubleBed: 'numeric|required|max:10|min:0',
      });
      const room = await Rooms.findAll({
        where: {
          hotelId,
          singleBed,
          doubleBed,
          price: { $lte: price },
        },
        attributes: ['price', 'doubleBed', 'singleBed', 'number'],
        include: [{
          model: Images,
          as: 'images',
          attributes: ['id', 'url'],
        }],
      });
      res.json({
        status: 'ok',
        room,
      });
    } catch (e) {
      next(e);
    }
  };

  static list = async (req, res, next) => {
    try {
      const { hotelId } = req.params;
      validate(req.params, {
        hotelId: 'numeric|required',
      });
      const rooms = await Rooms.findAll({
        where: {
          hotelId,
        },
        attributes: ['id', 'number', 'doubleBed', 'singleBed', 'price'],
        include: [{
          model: Images,
          as: 'images',
          attributes: ['id', 'url'],
        }],
      });
      res.json({
        status: 'ok',
        rooms,
      });
    } catch (e) {
      next(e);
    }
  };

  static single = async (req, res, next) => {
    try {
      const { id } = req.params;
      validate(req.params, {
        hotelId: 'numeric|required',
      });
      const room = await Rooms.findOne({
        where: {
          id,
        },
        attributes: ['hotelId', 'price', 'doubleBed', 'singleBed', 'number'],
        include: [{
          model: Images,
          as: 'images',
          attributes: ['id', 'url'],
        }],
      });
      res.json({
        status: 'ok',
        room,
      });
    } catch (e) {
      next(e);
    }
  };

  static create = async (req, res, next) => {
    try {
      const {
        hotelId, number, price, singleBed, doubleBed,
      } = req.body;
      validate(req.body, {
        hotelId: 'numeric|required',
        number: 'numeric|required',
        price: 'numeric|required',
        singleBed: 'numeric|required|max:10',
        doubleBed: 'numeric|required|max:10',
      });
      validate(req.files, {
        'images.*.path': 'string|required',
      });
      const hotel = await Hotel.findOne({
        where: {
          id: hotelId,
        },
      });
      if (_.isEmpty(hotel)) {
        throw HttpErrors(422, 'hotel not found');
      }
      let room = await Rooms.findOne({
        where: {
          number,
          hotelId,
        },
      });
      if (!_.isEmpty(room)) {
        throw HttpErrors(422, 'choose another room number');
      }

      room = await Rooms.create({
        number, hotelId, price, doubleBed, singleBed,
      });
      const createdImagesPath = Helper.createImages(req.files, hotelId, room.id);
      await Images.bulkCreate(createdImagesPath);
      room = await Rooms.findOne({
        where: {
          id: room.id,
        },
        attributes: ['hotelId', 'price', 'doubleBed', 'singleBed', 'number', 'id'],
        include: [{
          model: Images,
          as: 'images',
          attributes: ['id', 'url'],
        }],
      });
      res.json({
        status: 'ok',
        room,
      });
    } catch (e) {
      next(e);
    }
  };

  static update = async (req, res, next) => {
    try {
      const {
        id, number, doubleBed, singleBed, price, images,
      } = req.body;
      validate(req.body, {
        number: 'numeric|required',
        id: 'numeric|required',
        doubleBed: 'numeric|max:10|required',
        singleBed: 'numeric|max:10|required',
        images: 'array|max:10',
        'images.*.url': 'string',
        price: 'numeric|required',
      });
      if (_.isEmpty(req.files) && _.isEmpty(images)) {
        throw HttpErrors(409, 'images error');
      }
      if ((!_.isEmpty(req.files) && !_.isEmpty(images))
        && (req.files.length + images.length > 10)) {
        throw HttpErrors(409, 'images error');
      }
      let room = await Rooms.findOne({
        where: {
          id,
        },
      });
      if (_.isEmpty(room)) {
        throw HttpErrors(422, 'room not found');
      }
      const previousImages = await Images.findAll({
        where: {
          roomId: id,
        },
        attributes: ['url'],
      });
      await Rooms.update({
        number, doubleBed, singleBed, price,
      }, {
        where: {
          id,
        },
      });
      const deletedImages = Helper.deleteImages(previousImages, images);
      await Images.destroy({
        where: {
          url: { $in: deletedImages.map((d) => d.url) },
          roomId: id,
        },
      });
      const createdImagesPath = Helper.createImages(req.files, room.hotelId, id);
      await Images.bulkCreate(createdImagesPath);

      room = await Rooms.findOne({
        where: {
          id,
        },
        attributes: ['hotelId', 'price', 'name', 'doubleBed', 'singleBed'],
        include: [{
          model: Images,
          as: 'images',
          attributes: ['id', 'url'],
        }],
      });
      res.json({
        status: 'ok',
        room,
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
      const room = await Rooms.findOne({
        where: {
          id,
        },
      });
      if (_.isEmpty(room)) {
        throw HttpErrors(422, 'room not found');
      }
      const deleteImages = await Images.findAll({
        where: {
          roomId: id,
        },
        attributes: ['url'],
      });
      Helper.delete(deleteImages, room.hotelId, id);
      await Rooms.destroy({
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

export default RoomController;
