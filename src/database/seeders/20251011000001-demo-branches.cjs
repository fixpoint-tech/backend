'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('branches', [
      {
        id: 1,
        name: 'Main Branch',
        location: 'Colombo, Sri Lanka',
        manager_id: null, // Will be set later when branch managers are created
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        name: 'North Branch',
        location: 'Jaffna, Sri Lanka',
        manager_id: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        name: 'South Branch',
        location: 'Galle, Sri Lanka',
        manager_id: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        name: 'Central Branch',
        location: 'Kandy, Sri Lanka',
        manager_id: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 5,
        name: 'Western Branch',
        location: 'Negombo, Sri Lanka',
        manager_id: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('branches', null, {});
  }
};