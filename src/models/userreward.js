'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class UserReward extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            UserReward.belongsTo(models.User, {
                foreignKey: 'username'
            });
            UserReward.belongsTo(models.Reward, {
                foreignKey: 'reward_id'
            });
        }
    }
    UserReward.init({
        id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        username: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'Users',
                key: 'username'
            }
        },
        reward_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'Rewards',
                key: 'id'
            }
        }
    }, {
        sequelize,
        modelName: 'UserReward',
        timestamps: false // Set to false if you don't need createdAt and updatedAt fields
    });
    return UserReward;
};

