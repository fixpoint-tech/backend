'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add location_id field
    await queryInterface.addColumn('Technicians', 'location_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Location/area the technician covers'
    });

    // Add index for location_id
    await queryInterface.addIndex('Technicians', ['location_id'], {
      name: 'technicians_location_id_idx'
    });

    // Remove certification field (not essential)
    await queryInterface.removeColumn('Technicians', 'certification');
  },

  async down(queryInterface, Sequelize) {
    // Remove location_id field
    await queryInterface.removeIndex('Technicians', 'technicians_location_id_idx');
    await queryInterface.removeColumn('Technicians', 'location_id');

    // Add back certification field
    await queryInterface.addColumn('Technicians', 'certification', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Professional certifications'
    });
  }
};
