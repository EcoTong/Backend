'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            User.hasMany(models.Post, {
                foreignKey: 'username'
            });
            User.hasMany(models.Like, {
                foreignKey: 'username'
            });
        }
    }
    User.init({
        username:{
        type: DataTypes.INTEGER,
        primaryKey: true
    },
        email: DataTypes.STRING,
        password: DataTypes.STRING,
        name: DataTypes.STRING,
        profile_picture: DataTypes.STRING,
        credits: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'User',
        primaryKey: false // Set to false to disable automatic primary key creation
    });
    return User;
};