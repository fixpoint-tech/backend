'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Users', [
      {
        name: 'John Technician',
        email: 'john.tech@dominoslk.com',
        password: 'password123',
        role: 'technician',
        phone: '0771234567',
        profilePicture: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Sarah Technician',
        email: 'sarah.tech@dominoslk.com',
        password: 'password123',
        role: 'technician',
        phone: '0772345678',
        profilePicture: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Mike Manager',
        email: 'mike.manager@dominoslk.com',
        password: 'password123',
        role: 'branch_manager',
        phone: '0773456789',
        profilePicture: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Lisa Manager',
        email: 'lisa.manager@dominoslk.com',
        password: 'password123',
        role: 'branch_manager',
        phone: '0774567890',
        profilePicture: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'David Executive',
        email: 'david.exec@dominoslk.com',
        password: 'password123',
        role: 'maintenance_executive',
        phone: '0775678901',
        profilePicture: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Emma Executive',
        email: 'emma.exec@dominoslk.com',
        password: 'password123',
        role: 'maintenance_executive',
        phone: '0776789012',
        profilePicture: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
