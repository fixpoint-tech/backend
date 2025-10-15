'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Technicians', {
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
      specialization: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Technical specialization area (e.g., Electrical, Mechanical, Software)'
      },
      experienceYears: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      certification: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Professional certifications'
      },
      employeeId: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true,
        comment: 'Company employee ID'
      },
      isAvailable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Availability status for task assignment'
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
    await queryInterface.addIndex('Technicians', ['userId'], {
      unique: true,
      name: 'technicians_user_id_unique'
    });

    await queryInterface.addIndex('Technicians', ['employeeId'], {
      unique: true,
      name: 'technicians_employee_id_unique'
    });

    await queryInterface.addIndex('Technicians', ['specialization'], {
      name: 'technicians_specialization_index'
    });

    await queryInterface.addIndex('Technicians', ['isAvailable'], {
      name: 'technicians_is_available_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Technicians');
  }
};
