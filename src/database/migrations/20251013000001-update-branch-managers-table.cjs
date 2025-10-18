'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, set all branchId values to NULL
    await queryInterface.sequelize.query(
      'UPDATE "BranchManagers" SET "branchId" = NULL'
    );

    // Change branchId from STRING to INTEGER using raw SQL
    await queryInterface.sequelize.query(
      'ALTER TABLE "BranchManagers" ALTER COLUMN "branchId" TYPE INTEGER USING "branchId"::integer'
    );
    
    // Add comment
    await queryInterface.sequelize.query(
      `COMMENT ON COLUMN "BranchManagers"."branchId" IS 'Branch identifier - references Branch table'`
    );

    // Remove unnecessary fields
    await queryInterface.removeColumn('BranchManagers', 'branchName');
    await queryInterface.removeColumn('BranchManagers', 'region');
    await queryInterface.removeColumn('BranchManagers', 'managementLevel');

    // Remove old indexes (using correct names from original migration)
    await queryInterface.removeIndex('BranchManagers', 'branch_managers_branch_id_index');
    await queryInterface.removeIndex('BranchManagers', 'branch_managers_region_index');
    await queryInterface.removeIndex('BranchManagers', 'branch_managers_management_level_index');

    // Add new index for INTEGER branchId
    await queryInterface.addIndex('BranchManagers', ['branchId'], {
      name: 'branch_managers_branch_id_index'
    });
  },

  async down(queryInterface, Sequelize) {
    // Change branchId back to STRING
    await queryInterface.changeColumn('BranchManagers', 'branchId', {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: 'Branch identifier code'
    });

    // Add back removed fields
    await queryInterface.addColumn('BranchManagers', 'branchName', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Name of the branch managed'
    });

    await queryInterface.addColumn('BranchManagers', 'region', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Geographic region'
    });

    await queryInterface.addColumn('BranchManagers', 'managementLevel', {
      type: Sequelize.ENUM('junior', 'senior', 'regional'),
      allowNull: false,
      defaultValue: 'junior',
      comment: 'Management hierarchy level'
    });

    // Restore old indexes
    await queryInterface.removeIndex('BranchManagers', 'branch_managers_branch_id_index');
    await queryInterface.addIndex('BranchManagers', ['branchId'], {
      name: 'branch_managers_branch_id_index'
    });
    await queryInterface.addIndex('BranchManagers', ['region'], {
      name: 'branch_managers_region_index'
    });
    await queryInterface.addIndex('BranchManagers', ['managementLevel'], {
      name: 'branch_managers_management_level_index'
    });
  }
};
