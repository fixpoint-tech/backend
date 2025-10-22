'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add foreign key constraint between petty_cash_requests and Technicians
    await queryInterface.addConstraint('petty_cash_requests', {
      fields: ['technician_id'],
      type: 'foreign key',
      name: 'fk_petty_cash_requests_technician_id',
      references: {
        table: 'Technicians',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove the foreign key constraint
    await queryInterface.removeConstraint('petty_cash_requests', 'fk_petty_cash_requests_technician_id');
  }
};
