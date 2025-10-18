'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('MaintenanceExecutives', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      department: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Department name (e.g., Operations, Facilities, Equipment)'
      },
      level: {
        type: Sequelize.ENUM('executive', 'senior_executive', 'chief'),
        allowNull: false,
        defaultValue: 'executive',
        comment: 'Executive hierarchy level'
      },
      employeeId: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true,
        comment: 'Company employee ID'
      },
      responsibilities: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Key areas of responsibility'
      },
      authorityLevel: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Decision-making authority level (1-5)'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('MaintenanceExecutives', ['userId'], {
      unique: true,
      name: 'maintenance_executives_user_id_unique'
    });

    await queryInterface.addIndex('MaintenanceExecutives', ['employeeId'], {
      unique: true,
      name: 'maintenance_executives_employee_id_unique'
    });

    await queryInterface.addIndex('MaintenanceExecutives', ['department'], {
      name: 'maintenance_executives_department_index'
    });

    await queryInterface.addIndex('MaintenanceExecutives', ['level'], {
      name: 'maintenance_executives_level_index'
    });

    await queryInterface.addIndex('MaintenanceExecutives', ['authorityLevel'], {
      name: 'maintenance_executives_authority_level_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('MaintenanceExecutives');
  }
};
