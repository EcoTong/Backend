'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class History extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            History.belongsTo(models.User, {
                foreignKey: 'username'
            });
        }
    }
    History.init({
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.INTEGER,
            autoIncrement: true
        },
        username: DataTypes.STRING,
        made_from: DataTypes.STRING,
        instruction: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'History',
    });
    return History;
};