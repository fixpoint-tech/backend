'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
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
          model: 'Issues', // name of your Issues table
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // name of your Users table
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
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    await queryInterface.addIndex('Statuses', ['issue_id'], { name: 'idx_status_issue_id' });
    await queryInterface.addIndex('Statuses', ['user_id'], { name: 'idx_status_user_id' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Statuses');
  }
};
