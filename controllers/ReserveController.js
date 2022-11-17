import moment from 'moment-timezone';
import JoiBase from 'joi';
import JoiDate from '@joi/date';
import _ from 'lodash';
import HttpErrors from 'http-errors';
import { Reserve, Rooms } from '../models';

const Joi = JoiBase.extend(JoiDate);

class ReserveController {
  static create = async (req, res, next) => {
    try {
      const {
        roomId, fromDate, toDate, phone,
      } = req.body;
      const schema = Joi.object().keys({
        roomId: Joi.number().integer().min(1).required(),
        phone: Joi.string().min(3).required(),
        fromDate: Joi.date().format('YYYY-MM-DD').required(),
        toDate: Joi.date().format('YYYY-MM-DD').required(),
      });
      const { error } = schema.validate(req.body);
      if (!_.isEmpty(error)) {
        throw HttpErrors(422, error.message);
      }
      const start = moment(fromDate);
      const end = moment(toDate);
      const dateNow = moment(new Date().toLocaleDateString('en-CA'));
      if (Math.ceil(moment.duration(start.diff(dateNow)).asDays()) < 0) {
        throw HttpErrors(422, 'the day you selected has passed, select a new period');
      }
      if (Math.ceil(moment.duration(end.diff(start)).asDays()) <= 0) {
        throw HttpErrors(422, 'wrong number of days, select correct period');
      }
      const room = await Rooms.findOne({
        where: {
          id: roomId,
        },
      });
      if (_.isEmpty(room)) {
        throw HttpErrors(415, {
          message: 'room not found',
        });
      }
      let reserve = await Reserve.findAll({
        where: {
          roomId: room.id,
          status: 'active',
          $or: [
            { fromDate: { $gte: start.toDate(), $lte: end.toDate() } },
            { fromDate: { $lte: start.toDate() }, toDate: { $gte: start.toDate() } },
          ],
        },
        attributes: ['toDate', 'fromDate'],
      });
      if (!_.isEmpty(reserve)) {
        throw HttpErrors(422, `the room you selected is busy${reserve.map((date) => ` from ${date.fromDate} to ${date.toDate}`)}, please select another period or another room`);
      }
      reserve = await Reserve.create({
        fromDate: start.toDate(),
        toDate: end.toDate(),
        phone,
        roomId: room.id,
        hotelId: room.hotelId,
      });
      res.json({
        status: 'ok',
        reserve,
        price: Math.ceil(moment.duration(end.diff(start)).asDays()) * room.price,
      });
    } catch (e) {
      next(e);
    }
  };

  static update = async (req, res, next) => {
    try {
      const {
        fromDate, toDate, phone, id,
      } = req.body;
      const schema = Joi.object().keys({
        phone: Joi.string().min(3).required(),
        fromDate: Joi.date().format('YYYY-MM-DD').required(),
        toDate: Joi.date().format('YYYY-MM-DD').required(),
        id: Joi.number().required(),
      });
      const { error } = schema.validate(req.body);
      if (!_.isEmpty(error)) {
        throw HttpErrors(422, error.message);
      }
      const start = moment(fromDate);
      const end = moment(toDate);
      const dateNow = moment(new Date().toLocaleDateString('en-CA'));
      if (Math.ceil(moment.duration(start.diff(dateNow)).asDays()) < 0) {
        throw HttpErrors(422, 'the day you selected has passed, select a new period');
      }
      if (Math.ceil(moment.duration(end.diff(start)).asDays()) <= 0) {
        throw HttpErrors(422, 'wrong number of days, select correct period');
      }
      let reserve = await Reserve.findOne({
        where: {
          status: 'active',
          id,
        },
      });
      if (_.isEmpty(reserve)) {
        throw HttpErrors(415, {
          message: 'not reserved',
        });
      }
      reserve = await Reserve.findAll({
        where: {
          id: {
            $ne: reserve.id,
          },
          status: 'active',
          $or: [
            { fromDate: { $gte: start.toDate(), $lte: end.toDate() } },
            { fromDate: { $lte: start.toDate() }, toDate: { $gte: start.toDate() } },
          ],
        },
        attributes: ['fromDate', 'toDate', 'roomId'],
      });
      if (!_.isEmpty(reserve)) {
        throw HttpErrors(422, `the room you selected is busy${reserve.map((date) => ` from ${date.fromDate} to ${date.toDate}`)}, please select another period or another room`);
      }
      await Reserve.update({ fromDate, toDate, phone }, {
        where: {
          id,
        },
      });
      const room = await Rooms.findOne({
        where: {
          id: reserve.roomId,
        },
      });
      res.json({
        status: 'ok',
        reserve,
        price: Math.ceil(moment.duration(end.diff(start)).asDays()) * room.price,
      });
    } catch (e) {
      next(e);
    }
  };

  static delete = async (req, res, next) => {
    try {
      const {
        id,
      } = req.params;
      const schema = Joi.object().keys({
        id: Joi.number().required(),
      });
      const { error } = schema.validate(req.params);
      if (!_.isEmpty(error)) {
        throw HttpErrors(422, error.message);
      }
      const reserve = await Reserve.findOne({
        where: {
          status: 'active',
          id,
        },
      });
      if (_.isEmpty(reserve)) {
        throw HttpErrors(415, {
          message: 'not reserved',
        });
      }
      await Reserve.update({ status: 'canceled' }, {
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

export default ReserveController;
