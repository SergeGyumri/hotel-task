import _ from 'lodash';
import HttpErrors from 'http-errors';
import { Hotel, Images, Rooms } from '../models';
import validate from '../services/validate';
import Helper from '../utils/Helper';

class RoomController {
  static list = async (req, res, next) => {
    try {
      const { hotelId } = req.body;
      const rooms = Rooms.findAll({
        where: {
          hotelId,
        },
        include: [{
          model: Images,
          as: 'images',
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
      const { roomId } = req.params;
      const room = Rooms.findOne({
        where: {
          roomId,
        },
        include: [{
          model: Images,
          as: 'images',
        }, {
          model: Hotel,
          as: 'hotel',
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

  static addRoom = async (req, res, next) => {
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
      let hotel = await Hotel.findOne({
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
      });
      console.log(room);
      res.json({
        status: 'ok',
        room,
      });
    } catch (e) {
      next(e);
    }
  };

  static editRoom = async (req, res, next) => {
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
      if ((!_.isEmpty(req.files) && !_.isEmpty(images)) && (req.files.length + images.length > 10)) {
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
        raw: true,
        attributes: ['url'],
      });
      const deletedImages = Helper.updateImages(previousImages, images);
      await Rooms.update({
        number, doubleBed, singleBed, price,
      }, {
        where: {
          id,
        },
      });
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
        include: [{
          model: Images,
          as: 'images',
        }, {
          model: Hotel,
          as: 'hotel',
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

  static deleteRoom = async (req, res, next) => {
    try {
      const { id } = req.body;
      validate(req.body, {
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
        raw: true,
      });
      Helper.deleteHotel(deleteImages, room.hotelId, id);
      await Rooms.destroy({
        where: {
          id,
        },
      });
      await Images.destroy({
        where: {
          roomId: id,
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
