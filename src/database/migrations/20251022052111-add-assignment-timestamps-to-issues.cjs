'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Issues', 'technician_assigned_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('Issues', 'maintenance_executive_assigned_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('Issues', 'third_party_assigned_at', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Issues', 'technician_assigned_at');
    await queryInterface.removeColumn('Issues', 'maintenance_executive_assigned_at');
    await queryInterface.removeColumn('Issues', 'third_party_assigned_at');
  }
};
