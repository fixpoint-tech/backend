'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Add new status values to Issues status ENUM
        try {
            await queryInterface.sequelize.query(`ALTER TYPE "enum_Issues_status" ADD VALUE IF NOT EXISTS 'Pending Resolution';`);
        } catch (e) { console.warn(e.message); }

        try {
            await queryInterface.sequelize.query(`ALTER TYPE "enum_Issues_status" ADD VALUE IF NOT EXISTS 'Pending Close';`);
        } catch (e) { console.warn(e.message); }

        // Add new status values to Statuses status_type ENUM
        try {
            await queryInterface.sequelize.query(`ALTER TYPE "enum_Statuses_status_type" ADD VALUE IF NOT EXISTS 'Pending Resolution';`);
        } catch (e) { console.warn(e.message); }

        try {
            await queryInterface.sequelize.query(`ALTER TYPE "enum_Statuses_status_type" ADD VALUE IF NOT EXISTS 'Pending Close';`);
        } catch (e) { console.warn(e.message); }
    },

    down: async (queryInterface, Sequelize) => {
        // PostgreSQL does not support easily dropping ENUM values.
    }
};
