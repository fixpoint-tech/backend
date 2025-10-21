'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add foreign key constraint to branchId in BranchManagers table
    await queryInterface.addConstraint('BranchManagers', {
      fields: ['branchId'],
      type: 'foreign key',
      name: 'fk_branch_managers_branch_id',
      references: {
        table: 'branches',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Add index for better performance
    await queryInterface.addIndex('BranchManagers', ['branchId'], {
      name: 'idx_branch_managers_branch_id'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the index first
    await queryInterface.removeIndex('BranchManagers', 'idx_branch_managers_branch_id');
    
    // Remove the foreign key constraint
    await queryInterface.removeConstraint('BranchManagers', 'fk_branch_managers_branch_id');
  }
};