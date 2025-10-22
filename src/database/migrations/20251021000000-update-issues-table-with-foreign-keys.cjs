'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check what tables exist
    const tables = await queryInterface.showAllTables();
    
    // First remove foreign key constraints from Messages table if they exist
    try {
      await queryInterface.removeConstraint('Messages', 'fk_messages_issue_id');
      console.log('Removed foreign key constraint from Messages');
    } catch (error) {
      console.log('Foreign key constraint removal failed (may not exist):', error.message);
    }
    
    // Drop old issues table if it exists
    if (tables.includes('issues')) {
      // Remove old indexes first
      try {
        await queryInterface.removeIndex('issues', 'issues_branch_id_index');
        await queryInterface.removeIndex('issues', 'issues_userid_index');
      } catch (error) {
        console.log('Index removal failed (indexes may not exist):', error.message);
      }
      
      await queryInterface.dropTable('issues');
      console.log('Dropped old "issues" table');
    }

    // Drop Issues table if it exists (in case of re-running migration)
    if (tables.includes('Issues')) {
      await queryInterface.dropTable('Issues');
      console.log('Dropped existing "Issues" table');
    }

    // Create the new Issues table with all required fields
    await queryInterface.createTable('Issues', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      branch_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'branches',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      manager_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'BranchManagers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      maintenance_executive_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'MaintenanceExecutives',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      technician_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Technicians',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      status: {
        type: Sequelize.ENUM('Open', 'In Progress', 'Done', 'Closed'),
        allowNull: false,
        defaultValue: 'Open'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for better performance
    await queryInterface.addIndex('Issues', ['branch_id'], {
      name: 'idx_issues_branch_id'
    });

    await queryInterface.addIndex('Issues', ['manager_id'], {
      name: 'idx_issues_manager_id'
    });

    await queryInterface.addIndex('Issues', ['maintenance_executive_id'], {
      name: 'idx_issues_maintenance_executive_id'
    });

    await queryInterface.addIndex('Issues', ['technician_id'], {
      name: 'idx_issues_technician_id'
    });

    await queryInterface.addIndex('Issues', ['status'], {
      name: 'idx_issues_status'
    });

    // Re-add the Messages foreign key constraint to Issues
    try {
      await queryInterface.addConstraint('Messages', {
        fields: ['issue_id'],
        type: 'foreign key',
        name: 'fk_messages_issue_id',
        references: {
          table: 'Issues',
          field: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      });
      console.log('Re-added Messages foreign key constraint to Issues');
    } catch (error) {
      console.log('Failed to add Messages foreign key constraint:', error.message);
    }

    console.log('Issues table created successfully with all foreign keys and indexes');
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes first
    try {
      await queryInterface.removeIndex('Issues', 'idx_issues_status');
    } catch (error) {
      console.log('Status index removal failed:', error.message);
    }

    try {
      await queryInterface.removeIndex('Issues', 'idx_issues_technician_id');
    } catch (error) {
      console.log('Technician ID index removal failed:', error.message);
    }

    try {
      await queryInterface.removeIndex('Issues', 'idx_issues_maintenance_executive_id');
    } catch (error) {
      console.log('Maintenance Executive ID index removal failed:', error.message);
    }

    try {
      await queryInterface.removeIndex('Issues', 'idx_issues_manager_id');
    } catch (error) {
      console.log('Manager ID index removal failed:', error.message);
    }

    try {
      await queryInterface.removeIndex('Issues', 'idx_issues_branch_id');
    } catch (error) {
      console.log('Branch ID index removal failed:', error.message);
    }

    // Drop the Issues table
    await queryInterface.dropTable('Issues');
    console.log('Issues table dropped successfully');
  }
};