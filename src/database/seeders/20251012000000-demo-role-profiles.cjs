'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, get the user IDs that were created in the user seeder
    // We'll create profiles for the users that exist
    
    // Get all technician users
    const technicians = await queryInterface.sequelize.query(
      `SELECT id FROM "Users" WHERE role = 'technician' AND "isActive" = true ORDER BY id LIMIT 2`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Get all branch manager users
    const branchManagers = await queryInterface.sequelize.query(
      `SELECT id FROM "Users" WHERE role = 'branch_manager' AND "isActive" = true ORDER BY id LIMIT 2`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Get all maintenance executive users
    const executives = await queryInterface.sequelize.query(
      `SELECT id FROM "Users" WHERE role = 'maintenance_executive' AND "isActive" = true ORDER BY id LIMIT 2`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Seed Technician profiles
    if (technicians.length > 0) {
      await queryInterface.bulkInsert('Technicians', [
        {
          userId: technicians[0].id,
          specialization: 'Electrical Systems',
          experienceYears: 5,
          employeeId: 'TECH-001',
          isAvailable: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        technicians.length > 1 ? {
          userId: technicians[1].id,
          specialization: 'Mechanical Engineering',
          experienceYears: 3,
          employeeId: 'TECH-002',
          isAvailable: true,
          createdAt: new Date(),
          updatedAt: new Date()
        } : null
      ].filter(Boolean));
    }

    // Seed Branch Manager profiles
    if (branchManagers.length > 0) {
      await queryInterface.bulkInsert('BranchManagers', [
        {
          userId: branchManagers[0].id,
          branchId: '01',
          employeeId: 'MGR-001',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        branchManagers.length > 1 ? {
          userId: branchManagers[1].id,
          branchId: '02',
          employeeId: 'MGR-002',
          createdAt: new Date(),
          updatedAt: new Date()
        } : null
      ].filter(Boolean));
    }

    // Seed Maintenance Executive profiles
    if (executives.length > 0) {
      await queryInterface.bulkInsert('MaintenanceExecutives', [
        {
          userId: executives[0].id,
          employeeId: 'EXEC-001',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        executives.length > 1 ? {
          userId: executives[1].id,
          employeeId: 'EXEC-002',
          createdAt: new Date(),
          updatedAt: new Date()
        } : null
      ].filter(Boolean));
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Technicians', null, {});
    await queryInterface.bulkDelete('BranchManagers', null, {});
    await queryInterface.bulkDelete('MaintenanceExecutives', null, {});
  }
};
