'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('issues', [
            {
                branch_id: 1,
                title: 'Refrigerator cooling issue',
                userid: 3, // Mike Manager (branch manager)
                description: 'The walk-in refrigerator is not maintaining the proper temperature. Needs urgent inspection.',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                branch_id: 1,
                title: 'Oven heating element malfunction',
                userid: 3,
                description: 'One of the pizza ovens has a faulty heating element. Temperature is inconsistent.',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                branch_id: 2,
                title: 'Air conditioning not working',
                userid: 4, // Lisa Manager (branch manager)
                description: 'The AC unit in the kitchen area stopped working. Staff are working in high temperatures.',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ], {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('issues', null, {});
    }
};
