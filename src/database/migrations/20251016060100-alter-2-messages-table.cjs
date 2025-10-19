'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Messages', 'issue_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    // Add index for faster lookups by issue_id
    await queryInterface.addIndex('Messages', ['issue_id'], {
      name: 'messages_issue_id_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    // Rollback changes in reverse order
    await queryInterface.removeIndex('Messages', 'messages_issue_id_idx');
    await queryInterface.removeColumn('Messages', 'issue_id');
  },
};
