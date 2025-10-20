import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class BabyName extends Model {
  public id!: number;
  public name!: string;
  public sex!: string;
}

BabyName.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sex: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'baby_names',
    timestamps: true,
  }
);

export default BabyName;