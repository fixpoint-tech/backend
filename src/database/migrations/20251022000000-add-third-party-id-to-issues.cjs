'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add third_party_id to Issues table
    await queryInterface.addColumn('Issues', 'third_party_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'ThirdParties',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Add index for third_party_id
    await queryInterface.addIndex('Issues', ['third_party_id'], {
      name: 'idx_issues_third_party_id'
    });

    console.log('Added third_party_id to Issues table with foreign key constraint and index');
  },

  async down(queryInterface, Sequelize) {
    // Remove index first
    try {
      await queryInterface.removeIndex('Issues', 'idx_issues_third_party_id');
    } catch (error) {
      console.log('Third Party ID index removal failed:', error.message);
    }

    // Remove the column
    await queryInterface.removeColumn('Issues', 'third_party_id');
    console.log('Removed third_party_id from Issues table');
  }
};