import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/sequelize';

class Hotel extends Model {

}

Hotel.init({
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'hotel',
  modelName: 'hotel',
});

export default Hotel;
