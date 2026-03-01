'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Users', 'resetOTP', {
            type: Sequelize.STRING(10),
            allowNull: true,
            comment: '6-digit OTP for password reset'
        });

        await queryInterface.addColumn('Users', 'resetOTPExpiry', {
            type: Sequelize.DATE,
            allowNull: true,
            comment: 'Expiration time of the reset OTP'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('Users', 'resetOTP');
        await queryInterface.removeColumn('Users', 'resetOTPExpiry');
    }
};
