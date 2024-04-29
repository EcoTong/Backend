'use strict';

/**
 * id quest pk
username fk
prize
description
category
bahan pelengkap ???
status
picture
 */
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Quests', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      username: {
        type: Sequelize.STRING
      },
      prize: {
        type: Sequelize.INTEGER
      },
      description: {
        type: Sequelize.STRING
      },
      category: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.BOOLEAN
      },
      picture: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }).then(() => queryInterface.addConstraint('Quests', {
      fields: ['username'],
      type: 'foreign key',
      name: 'fk_quest_username',
      references: {
        table: 'Users',
        field: 'username'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }));
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Quests');
  }
};
