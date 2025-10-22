'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove old index for ticket_id
    try {
      await queryInterface.removeIndex('petty_cash_requests', 'idx_petty_cash_requests_ticket_id');
      console.log('Removed old ticket_id index');
    } catch (error) {
      console.log('Ticket ID index removal failed (may not exist):', error.message);
    }

    // Drop the old ticket_id column
    try {
      await queryInterface.removeColumn('petty_cash_requests', 'ticket_id');
      console.log('Removed ticket_id column');
    } catch (error) {
      console.log('Ticket ID column removal failed (may not exist):', error.message);
    }

    // Add issue_id column
    await queryInterface.addColumn('petty_cash_requests', 'issue_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Issues',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    // Add index for issue_id
    await queryInterface.addIndex('petty_cash_requests', ['issue_id'], {
      name: 'idx_petty_cash_requests_issue_id'
    });

    console.log('Added issue_id to petty_cash_requests table with foreign key constraint and index');
  },

  async down(queryInterface, Sequelize) {
    // Remove issue_id index
    try {
      await queryInterface.removeIndex('petty_cash_requests', 'idx_petty_cash_requests_issue_id');
    } catch (error) {
      console.log('Issue ID index removal failed:', error.message);
    }

    // Remove issue_id column
    await queryInterface.removeColumn('petty_cash_requests', 'issue_id');

    // Add back ticket_id column
    await queryInterface.addColumn('petty_cash_requests', 'ticket_id', {
      type: Sequelize.INTEGER,
      allowNull: false
    });

    // Add back ticket_id index
    await queryInterface.addIndex('petty_cash_requests', ['ticket_id'], {
      name: 'idx_petty_cash_requests_ticket_id'
    });

    console.log('Reverted back to ticket_id in petty_cash_requests table');
  }
};