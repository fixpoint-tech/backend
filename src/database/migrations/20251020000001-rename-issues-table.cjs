'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Rename issues table to Issues to match naming convention
    await queryInterface.renameTable('issues', 'Issues');
    console.log('Table renamed from "issues" to "Issues" successfully');
  },

  async down(queryInterface, Sequelize) {
    // Rename back to lowercase for rollback
    await queryInterface.renameTable('Issues', 'issues');
    console.log('Table renamed back from "Issues" to "issues" successfully');
  }
};