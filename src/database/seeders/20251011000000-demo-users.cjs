'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Hash the password once for all users (they all use the same password)
    const hashedPassword = await bcrypt.hash('password123', 10);

    await queryInterface.bulkInsert('Users', [
      {
        name: 'John Technician',
        email: 'john.tech@dominoslk.com',
        password: hashedPassword,
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
        password: hashedPassword,
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
        password: hashedPassword,
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
        password: hashedPassword,
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
        password: hashedPassword,
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
        password: hashedPassword,
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
