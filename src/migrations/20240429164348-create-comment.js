'use strict';
/**
 * id comments pk
id posting fk
id user fk
content 
 */
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Comments', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      post_id: {
        type: Sequelize.STRING
      },
      username: {
        type: Sequelize.STRING
      },
      content: {
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
    }).then(() => queryInterface.addConstraint('Comments', {
      fields: ['post_id'],
      type: 'foreign key',
      name: 'fk_comments_post_id',
      references: {
        table: 'Posts',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    })).then(() => queryInterface.addConstraint('Comments', {
      fields: ['username'],
      type: 'foreign key',
      name: 'fk_comments_username',
      references: {
        table: 'Users',
        field: 'username'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }));
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Comments');
  }
};
