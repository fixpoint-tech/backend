import { sequelize, Branch } from '../models/index.js';

async function initializeDatabase() {
  try {
    console.log('\n🚀 Database Initialization (Sequelize ORM)\n');

    // Step 1: Test connection
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected!\n');

    // Step 2: Auto-create tables from models
    console.log('🔄 Creating tables from models...');
    await sequelize.sync({ force: true }); // Reads User.js & Branch.js → creates tables
    console.log('✅ Tables created automatically!\n');

    // Step 3: Insert test data
    console.log('🔄 Adding test branches...');
    await Branch.bulkCreate([
      { name: 'Colombo Main', location: 'Colombo', phone: '+94112345678', email: 'colombo@dominos.lk' },
      { name: 'Kandy Branch', location: 'Kandy', phone: '+94812345678', email: 'kandy@dominos.lk' },
      { name: 'Galle Branch', location: 'Galle', phone: '+94912345678', email: 'galle@dominos.lk' }
    ]);
    console.log('✅ 3 branches added!\n');

    console.log('✅ Database initialized successfully!');
    console.log('📋 Tables: users, branches (auto-generated from models)\n');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await sequelize.close();
    process.exit(1);
  }
}

initializeDatabase();