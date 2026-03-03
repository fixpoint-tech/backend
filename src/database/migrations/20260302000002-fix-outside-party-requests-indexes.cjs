'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        // Add indexes safely using IF NOT EXISTS (raw SQL)
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
        // Add trigger if not already there
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
      DROP INDEX IF EXISTS "idx_outside_party_requests_issue_id";
      DROP INDEX IF EXISTS "idx_outside_party_requests_suggested_by";
      DROP INDEX IF EXISTS "idx_outside_party_requests_status";
    `);
    }
};
