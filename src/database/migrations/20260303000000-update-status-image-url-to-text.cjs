'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Change image_url from VARCHAR to TEXT to support JSON array of multiple image URLs
    await queryInterface.changeColumn('Statuses', 'image_url', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Can store a single URL or JSON array of URLs'
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert back to VARCHAR
    await queryInterface.changeColumn('Statuses', 'image_url', {
      type: Sequelize.STRING(1000),
      allowNull: true
    });
  }
};
