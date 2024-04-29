'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Announcements', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      usename: {
        type: Sequelize.STRING
      },
      title: {
        type: Sequelize.STRING
      },
      content: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }).then(() => queryInterface.addConstraint('Announcements', {
      fields: ['usename'],
      type: 'foreign key',
      name: 'fk_announcements_usename',
      references: {
        table: 'Users',
        field: 'username'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }));
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Announcements');
  }
};
