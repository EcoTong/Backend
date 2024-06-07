'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Quest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Quest.belongsTo(models.User, {
        foreignKey: 'username'
      });
    }
  } 
  Quest.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING
    },
    username: DataTypes.STRING,
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    prize: DataTypes.INTEGER,
    category: DataTypes.STRING,
    credits: DataTypes.INTEGER,
    picture: DataTypes.STRING,
    status: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Quest',
  });
  return Quest;
};