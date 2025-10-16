'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if "Messages" table exists
    const [[{ exists }]] = await queryInterface.sequelize.query(
      `SELECT EXISTS (
         SELECT FROM information_schema.tables
         WHERE table_schema = 'public' AND table_name = 'Messages'
       ) as exists;`
    );

    if (!exists) {
      // ...existing code...
      await queryInterface.createTable('Messages', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        body: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        sender_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Users',     // refers to table name
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        receiver_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Users',     // refers to table name
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('NOW')
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('NOW')
        }
      });

      // Add indexes (table just created, safe)
      await queryInterface.addIndex('Messages', ['sender_id'], {
        name: 'messages_sender_id_idx'
      });

      await queryInterface.addIndex('Messages', ['receiver_id'], {
        name: 'messages_receiver_id_idx'
      });

      return;
    }

    // If table exists, ensure indexes/constraints exist (idempotent)
    // Add FK constraints if they don't already exist (ignore errors)
    await queryInterface.addConstraint('Messages', {
      fields: ['sender_id'],
      type: 'foreign key',
      name: 'messages_sender_fkey',
      references: { table: 'Users', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    }).catch(() => { });

    await queryInterface.addConstraint('Messages', {
      fields: ['receiver_id'],
      type: 'foreign key',
      name: 'messages_receiver_fkey',
      references: { table: 'Users', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    }).catch(() => { });

    // Create indexes if not present using raw SQL (Postgres supports IF NOT EXISTS)
    await queryInterface.sequelize.query(
      'CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON "Messages" (sender_id);'
    );
    await queryInterface.sequelize.query(
      'CREATE INDEX IF NOT EXISTS messages_receiver_id_idx ON "Messages" (receiver_id);'
    );
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes/constraints if present, then drop table if desired
    await queryInterface.removeConstraint('Messages', 'messages_sender_fkey').catch(() => { });
    await queryInterface.removeConstraint('Messages', 'messages_receiver_fkey').catch(() => { });

    await queryInterface.removeIndex('Messages', 'messages_sender_id_idx').catch(() => { });
    await queryInterface.removeIndex('Messages', 'messages_receiver_id_idx').catch(() => { });

    // Drop table only if it exists
    await queryInterface.dropTable('Messages').catch(() => { });
  }
};
