'use strict';
/**
 * 
id pk
username fk
post_id fk
 */
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Bookmarks', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      username: {
        type: Sequelize.STRING
      },
      post_id: {
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
    }).then(() => queryInterface.addConstraint('Bookmarks', {
      fields: ['username'],
      type: 'foreign key',
      name: 'fk_bookmarks_username',
      references: {
        table: 'Users',
        field: 'username'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    })).then(() => queryInterface.addConstraint('Bookmarks', {
      fields: ['post_id'],
      type: 'foreign key',
      name: 'fk_bookmarks_post_id',
      references: {
        table: 'Posts',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }));
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Bookmarks');
  }
};
