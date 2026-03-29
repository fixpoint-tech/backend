'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Create ENUM if not exists
        await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE outside_party_request_status AS ENUM ('pending', 'approved', 'rejected');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

        // Create table if not exists (safe)
        await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS outside_party_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        issue_id INTEGER NOT NULL,
        suggested_by INTEGER NOT NULL,
        vendor_name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        status outside_party_request_status NOT NULL DEFAULT 'pending',
        approved_by INTEGER,
        approval_comment TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Indexes with IF NOT EXISTS
        await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS "idx_outside_party_requests_issue_id"
        ON outside_party_requests (issue_id);
    `);
        await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS "idx_outside_party_requests_suggested_by"
        ON outside_party_requests (suggested_by);
    `);
        await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS "idx_outside_party_requests_status"
        ON outside_party_requests (status);
    `);

        // Trigger safely
        await queryInterface.sequelize.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_trigger
          WHERE tgname = 'update_outside_party_requests_updated_at'
        ) THEN
          CREATE TRIGGER update_outside_party_requests_updated_at
            BEFORE UPDATE ON outside_party_requests
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        END IF;
      END $$;
    `);
    },

    async down(queryInterface) {
        await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS update_outside_party_requests_updated_at ON outside_party_requests;
    `);
        await queryInterface.dropTable('outside_party_requests');
        await queryInterface.sequelize.query(`DROP TYPE IF EXISTS outside_party_request_status;`);
    }
};
