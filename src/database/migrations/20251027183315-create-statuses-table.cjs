'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Statuses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      issue_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Issues',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },

      image_url: {
        type: Sequelize.STRING,
        allowNull: true
      },

      status_type: {
        type: Sequelize.ENUM('Open', 'Assigned', 'In Progress', 'Resolved', 'Closed'),
        allowNull: false,
        defaultValue: 'Open'
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('Statuses', ['issue_id'], { name: 'idx_status_issue_id' });
    await queryInterface.addIndex('Statuses', ['user_id'], { name: 'idx_status_user_id' });
    await queryInterface.addIndex('Statuses', ['createdAt'], { name: 'idx_status_createdAt' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Statuses');

    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Statuses_status_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_Statuses_status_type;');
  }
};