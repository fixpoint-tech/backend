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
        allowNull: false,
        references: {
          model: 'Users',     // refers to table name
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      receiver_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',     // refers to table name
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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

    // Add indexes for optimization
    await queryInterface.addIndex('Messages', ['sender_id'], {
      name: 'messages_sender_id_idx'
    });

    await queryInterface.addIndex('Messages', ['receiver_id'], {
      name: 'messages_receiver_id_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop indexes first (optional, Sequelize usually handles this automatically)
    await queryInterface.removeIndex('Messages', 'messages_sender_id_idx');
    await queryInterface.removeIndex('Messages', 'messages_receiver_id_idx');

    // Drop the table
    await queryInterface.dropTable('Messages');
  }
};
