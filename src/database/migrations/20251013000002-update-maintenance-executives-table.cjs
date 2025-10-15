'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove unnecessary fields - keep only userId and employeeId
    await queryInterface.removeColumn('MaintenanceExecutives', 'department');
    await queryInterface.removeColumn('MaintenanceExecutives', 'level');
    await queryInterface.removeColumn('MaintenanceExecutives', 'responsibilities');
    await queryInterface.removeColumn('MaintenanceExecutives', 'authorityLevel');
  },

  async down(queryInterface, Sequelize) {
    // Add back removed fields
    await queryInterface.addColumn('MaintenanceExecutives', 'department', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Department the executive oversees'
    });

    await queryInterface.addColumn('MaintenanceExecutives', 'level', {
      type: Sequelize.ENUM('executive', 'senior_executive', 'chief'),
      allowNull: false,
      defaultValue: 'executive',
      comment: 'Executive hierarchy level'
    });

    await queryInterface.addColumn('MaintenanceExecutives', 'responsibilities', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Detailed responsibilities and scope'
    });

    await queryInterface.addColumn('MaintenanceExecutives', 'authorityLevel', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 5
      },
      comment: 'Authority level from 1 (lowest) to 5 (highest)'
    });
  }
};
