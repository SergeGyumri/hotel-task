import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/sequelize';
import Rooms from './Rooms';
import Hotel from './Hotel';

class Images extends Model {

}

Images.init({
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'images',
  modelName: 'images',
});
Images.belongsTo(Hotel, {
  foreignKey: 'hotelId',
  onDelete: 'cascade',
  onUpdate: 'cascade',
});
Images.belongsTo(Rooms, {
  foreignKey: 'roomId',
  onDelete: 'cascade',
  onUpdate: 'cascade',
});
Rooms.hasMany(Images, {
  foreignKey: 'roomId',
  as: 'images',
  onDelete: 'cascade',
  onUpdate: 'cascade',
});
Hotel.hasMany(Images, {
  foreignKey: 'hotelId',
  as: 'images',
  onDelete: 'cascade',
  onUpdate: 'cascade',
});

export default Images;
