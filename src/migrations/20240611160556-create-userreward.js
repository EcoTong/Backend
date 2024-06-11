"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("UserRewards", {
      username: {
        type: Sequelize.STRING,
        primaryKey: true,
        references: {
          model: "Users",
          key: "username",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      reward_id: {
        type: Sequelize.STRING,
        primaryKey: true,
        references: {
          model: "Rewards",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("now"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("now"),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("UserRewards");
  },
};
