'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create ENUM type for cash request status
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE cash_request_status AS ENUM ('pending', 'approved', 'rejected');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create petty_cash_requests table
    await queryInterface.createTable('petty_cash_requests', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()')
      },
      technician_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Foreign key reference to the technician who submitted the request'
      },
      ticket_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Foreign key reference to the maintenance ticket'
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0.01
        },
        comment: 'Requested cash amount (max 10 digits, 2 decimal places)'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Detailed description of what the cash will be used for'
      },
      status: {
        type: 'cash_request_status',
        allowNull: false,
        defaultValue: 'pending',
        comment: 'Current status: pending, approved, or rejected'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'created_at'
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'updated_at'
      }
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('petty_cash_requests', ['technician_id'], {
      name: 'idx_petty_cash_requests_technician_id'
    });

    await queryInterface.addIndex('petty_cash_requests', ['ticket_id'], {
      name: 'idx_petty_cash_requests_ticket_id'
    });

    await queryInterface.addIndex('petty_cash_requests', ['status'], {
      name: 'idx_petty_cash_requests_status'
    });

    await queryInterface.addIndex('petty_cash_requests', ['created_at'], {
      name: 'idx_petty_cash_requests_created_at'
    });

    // Add check constraint for amount > 0
    await queryInterface.sequelize.query(`
      ALTER TABLE petty_cash_requests 
      ADD CONSTRAINT check_amount_positive 
      CHECK (amount > 0);
    `);

    // Create trigger function to automatically update updated_at timestamp
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create trigger to call the function
    await queryInterface.sequelize.query(`
      CREATE TRIGGER update_petty_cash_requests_updated_at 
        BEFORE UPDATE ON petty_cash_requests 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    `);

    // Add table comment
    await queryInterface.sequelize.query(`
      COMMENT ON TABLE petty_cash_requests IS 
      'Stores petty cash requests submitted by technicians for maintenance expenses';
    `);
  },

  async down(queryInterface, Sequelize) {
    // Drop trigger
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS update_petty_cash_requests_updated_at ON petty_cash_requests;
    `);

    // Drop trigger function
    await queryInterface.sequelize.query(`
      DROP FUNCTION IF EXISTS update_updated_at_column();
    `);

    // Drop table (indexes and constraints will be dropped automatically)
    await queryInterface.dropTable('petty_cash_requests');

    // Drop ENUM type
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS cash_request_status;
    `);
  }
};
