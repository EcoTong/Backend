'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Rewards', 'title', {
      type: Sequelize.STRING,
      allowNull: true, // Set to false if you want the field to be required
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Rewards', 'title');
  }
};
