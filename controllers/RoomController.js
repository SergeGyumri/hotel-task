import _ from 'lodash';
import HttpErrors from 'http-errors';
import { Hotel, Images, Rooms } from '../models';
import validate from '../services/validate';
import Helper from '../utils/Helper';

class RoomController {
  static getRoomsList = async (req, res, next) => {
    try {
      const { hotelId } = req.body;
      const rooms = Rooms.findAll({
        where: {
          hotelId,
        },
      });
      res.json({
        status: 'ok',
        rooms,
      });
    } catch (e) {
      next(e);
    }
  };

  static addRoom = async (req, res, next) => {
    try {
      const images = req.files;
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
      validate({ images }, {
        'images.*.path': 'string|required',
      });
      const checkHotel = await Hotel.findOne({
        where: {
          id: hotelId,
        },
      });
      if (_.isEmpty(checkHotel)) {
        throw HttpErrors(422, 'hotel not found');
      }
      const checkRoom = await Rooms.findOne({
        where: {
          number,
          hotelId,
        },
      });
      if (!_.isEmpty(checkRoom)) {
        throw HttpErrors(422, 'choose another room number');
      }
      const room = await Rooms.create({
        number, hotelId, price, doubleBed, singleBed,
      });
      const createdImagesPath = Helper.imgWork(images, hotelId, room.id);
      await Images.bulkCreate(createdImagesPath);
      const imagesPath = createdImagesPath.map((img) => img.url);

      res.json({
        status: 'ok',
        room,
        imagesPath,
      });
    } catch (e) {
      next(e);
    }
  };

  static editRoom = async (req, res, next) => {
    try {
      const {
        id, number, doubleBed, singleBed, price, newPaths,
      } = req.body;
      const images = req.files;
      validate(req.body, {
        number: 'numeric|required',
        id: 'numeric|required',
        doubleBed: 'numeric|max:10|required',
        singleBed: 'numeric|max:10|required',
        newPaths: 'array|max:10',
        price: 'numeric|required',
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
      const checkRoom = await Rooms.findOne({
        where: {
          id,
        },
      });
      if (_.isEmpty(checkRoom)) {
        throw HttpErrors(422, 'room not found');
      }
      const previousImages = await Images.findAll({
        where: {
          roomId: id,
        },
        raw: true,
        attributes: ['url'],
      });
      const deletedImages = Helper.updateImages(previousImages, newPaths);
      await Rooms.update({
        number, doubleBed, singleBed, price,
      }, {
        where: {
          id,
        },
      });
      await Images.destroy({
        where: {
          url: deletedImages,
          roomId: id,
        },
      });
      const createdImagesPath = Helper.imgWork(images, checkRoom.hotelId, id);
      await Images.bulkCreate(createdImagesPath);
      const imagesPath = await Images.findAll({
        where: {
          roomId: id,
        },
        attributes: ['url', 'id'],
        raw: true,
      });
      const room = await Rooms.findOne({
        where: {
          id,
        },
      });
      res.json({
        status: 'ok',
        room,
        imagesPath,
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
      const checkRoom = await Rooms.findOne({
        where: {
          id,
        },
      });
      if (_.isEmpty(checkRoom)) {
        throw HttpErrors(422, 'room not found');
      }
      const deleteImages = await Images.findAll({
        where: {
          roomId: id,
        },
        attributes: ['url'],
        raw: true,
      });
      Helper.deleteHotel(deleteImages, checkRoom.hotelId, id);
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
