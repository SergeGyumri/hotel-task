class RoomController {
  static addRoom = async (req, res, next) => {
    try {
      res.json({
        status: 'ok',
      });
    } catch (e) {
      next(e);
    }
  };
}

export default RoomController;
