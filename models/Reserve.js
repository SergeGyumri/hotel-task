import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/sequelize';
import Hotel from './Hotel';
import Rooms from './Rooms';

class Reserve extends Model {

}

Reserve.init({
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  fromDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  toDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'canceled'),
    defaultValue: 'active',
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'reserve',
  modelName: 'reserve',
});

Reserve.belongsTo(Hotel, {
  foreignKey: 'hotelId',
  onDelete: 'cascade',
  onUpdate: 'cascade',
});
Reserve.belongsTo(Rooms, {
  foreignKey: 'roomId',
  onDelete: 'cascade',
  onUpdate: 'cascade',
});

export default Reserve;
