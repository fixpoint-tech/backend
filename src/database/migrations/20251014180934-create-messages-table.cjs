'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Messages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      sender_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      receiver_id: {       // corrected spelling
        type: Sequelize.INTEGER,
        allowNull: false
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

    // Example: add index on sender_id for faster lookups
    await queryInterface.addIndex('Messages', ['sender_id'], {
      name: 'messages_sender_id_idx'
    });

    // Example: add index on receiver_id for filtering
    await queryInterface.addIndex('Messages', ['receiver_id'], {
      name: 'messages_receiver_id_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Messages');
  }
};
