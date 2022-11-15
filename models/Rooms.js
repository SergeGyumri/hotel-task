import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/sequelize';
import Hotel from './Hotel';

class Rooms extends Model {

}

Rooms.init({
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  number: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  doubleBed: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
  },
  singleBed: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT(10, 2),
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'rooms',
  modelName: 'rooms',
  indexes: [{
    unique: true,
    fields: ['number', 'hotelId'],
  }],
});

Rooms.belongsTo(Hotel, {
  foreignKey: 'hotelId',
  as: 'hotel',
  onDelete: 'cascade',
  onUpdate: 'cascade',
});
Hotel.hasMany(Rooms, {
  foreignKey: 'hotelId',
  as: 'rooms',
  onDelete: 'cascade',
  onUpdate: 'cascade',
});

export default Rooms;
