'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Like extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Like.belongsTo(models.User, {
                foreignKey: 'username'
            });
            Like.belongsTo(models.Post, {
                foreignKey: 'post_id'
            });
        }
    }
    Like.init({
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.STRING
        },
        username: DataTypes.STRING,
        post_id: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'Like',
    });
    return Like;
};