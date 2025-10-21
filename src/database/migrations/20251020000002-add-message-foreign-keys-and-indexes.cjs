'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if constraints already exist before adding them
    try {
      // Add foreign key constraint for sender_id
      await queryInterface.addConstraint('Messages', {
        fields: ['sender_id'],
        type: 'foreign key',
        name: 'fk_messages_sender_id',
        references: {
          table: 'Users',
          field: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      });
    } catch (error) {
      if (!error.message.includes('already exists')) {
        console.log('Error adding sender_id constraint:', error.message);
      }
    }

    try {
      // Add foreign key constraint for receiver_id
      await queryInterface.addConstraint('Messages', {
        fields: ['receiver_id'],
        type: 'foreign key',
        name: 'fk_messages_receiver_id',
        references: {
          table: 'Users',
          field: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      });
    } catch (error) {
      if (!error.message.includes('already exists')) {
        console.log('Error adding receiver_id constraint:', error.message);
      }
    }

    try {
      // Add foreign key constraint for issue_id
      await queryInterface.addConstraint('Messages', {
        fields: ['issue_id'],
        type: 'foreign key',
        name: 'fk_messages_issue_id',
        references: {
          table: 'Issues',
          field: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      });
    } catch (error) {
      if (!error.message.includes('already exists')) {
        console.log('Error adding issue_id constraint:', error.message);
      }
    }

    // Add indexes for better performance (if they don't exist)
    try {
      await queryInterface.addIndex('Messages', ['sender_id'], {
        name: 'idx_messages_sender_id'
      });
    } catch (error) {
      if (!error.message.includes('already exists')) {
        console.log('Sender ID index might already exist');
      }
    }

    try {
      await queryInterface.addIndex('Messages', ['receiver_id'], {
        name: 'idx_messages_receiver_id'
      });
    } catch (error) {
      if (!error.message.includes('already exists')) {
        console.log('Receiver ID index might already exist');
      }
    }

    try {
      await queryInterface.addIndex('Messages', ['issue_id'], {
        name: 'idx_messages_issue_id'
      });
    } catch (error) {
      if (!error.message.includes('already exists')) {
        console.log('Issue ID index might already exist');
      }
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes first
    try {
      await queryInterface.removeIndex('Messages', 'idx_messages_issue_id');
    } catch (error) {
      console.log('Issue ID index removal failed:', error.message);
    }

    try {
      await queryInterface.removeIndex('Messages', 'idx_messages_receiver_id');
    } catch (error) {
      console.log('Receiver ID index removal failed:', error.message);
    }

    try {
      await queryInterface.removeIndex('Messages', 'idx_messages_sender_id');
    } catch (error) {
      console.log('Sender ID index removal failed:', error.message);
    }

    // Remove foreign key constraints
    try {
      await queryInterface.removeConstraint('Messages', 'fk_messages_issue_id');
    } catch (error) {
      console.log('Issue ID constraint removal failed:', error.message);
    }

    try {
      await queryInterface.removeConstraint('Messages', 'fk_messages_receiver_id');
    } catch (error) {
      console.log('Receiver ID constraint removal failed:', error.message);
    }

    try {
      await queryInterface.removeConstraint('Messages', 'fk_messages_sender_id');
    } catch (error) {
      console.log('Sender ID constraint removal failed:', error.message);
    }
  }
};