'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('BranchManagers', {
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
      branchId: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Branch identifier code'
      },
      branchName: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Name of the branch managed'
      },
      region: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Geographic region (e.g., Western, Central, Southern)'
      },
      employeeId: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true,
        comment: 'Company employee ID'
      },
      managementLevel: {
        type: Sequelize.ENUM('junior', 'senior', 'regional'),
        allowNull: false,
        defaultValue: 'junior',
        comment: 'Management hierarchy level'
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
    await queryInterface.addIndex('BranchManagers', ['userId'], {
      unique: true,
      name: 'branch_managers_user_id_unique'
    });

    await queryInterface.addIndex('BranchManagers', ['employeeId'], {
      unique: true,
      name: 'branch_managers_employee_id_unique'
    });

    await queryInterface.addIndex('BranchManagers', ['branchId'], {
      name: 'branch_managers_branch_id_index'
    });

    await queryInterface.addIndex('BranchManagers', ['region'], {
      name: 'branch_managers_region_index'
    });

    await queryInterface.addIndex('BranchManagers', ['managementLevel'], {
      name: 'branch_managers_management_level_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('BranchManagers');
  }
};
