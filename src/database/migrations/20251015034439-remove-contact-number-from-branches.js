'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('branches', 'contactNumber');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('branches', 'contactNumber', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
