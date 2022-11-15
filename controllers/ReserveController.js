import moment from 'moment-timezone';
import validate from '../services/validate';
import { Reserve } from '../models';

class ReserveController {
  static create = async (req, res, next) => {
    try {
      const {
        roomId, fromDate, toDate, phone,
      } = req.body;
      validate(req.body, {
        roomId: 'numeric|required',
        toDate: 'required',
        fromDate: 'required',
        phone: 'string|required|max:20',
      });

      const start = moment(fromDate);
      const end = moment(toDate);
      const reserve = Reserve.findOne({
        where: {
          $or: [
            { fromDate: { $gte: start.toDate(), $lte: end.toDate() } },
            { fromDate: { $lte: start.toDate() }, toDate: { $gte: start.toDate() } },
          ],
        },
      });
      // await Reserve.create({
      //   fromDate: moment(start).toDate(),
      //   toDate: moment(end).toDate(),
      //   phone,
      //   roomId,
      //   hotelId,
      // });

      res.json({
        status: 'ok',
        reserve,
      });
    } catch (e) {
      next(e);
    }
  };
}

export default ReserveController;
