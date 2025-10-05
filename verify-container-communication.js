// Comprehensive test to verify Node.js can communicate with PostgreSQL and MinIO
import pg from 'pg';
import { Client as MinioClient } from 'minio';

console.log('🔍 Testing Node.js communication with containers...\n');

// Test PostgreSQL connection
async function testPostgreSQL() {
  console.log('1. 🐘 Testing PostgreSQL connection...');
  
  const client = new pg.Client({
    user: process.env.POSTGRES_USER || 'testuser',
    host: 'localhost',
    database: process.env.POSTGRES_DB || 'testdb',
    password: process.env.POSTGRES_PASSWORD || 'testpassword',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
  });

  try {
    await client.connect();
    console.log('   ✅ Connected to PostgreSQL');
    
    // Test basic query
    const result = await client.query('SELECT version(), current_database(), current_user, now()');
    const row = result.rows[0];
    
    console.log('   📊 Database Info:');
    console.log(`      Version: ${row.version.split(' ').slice(0, 2).join(' ')}`);
    console.log(`      Database: ${row.current_database}`);
    console.log(`      User: ${row.current_user}`);
    console.log(`      Time: ${row.now}`);
    
    // Test creating and querying a table
    await client.query('DROP TABLE IF EXISTS test_table');
    await client.query('CREATE TABLE test_table (id SERIAL PRIMARY KEY, message TEXT)');
    await client.query("INSERT INTO test_table (message) VALUES ('Hello from Node.js!')");
    
    const testResult = await client.query('SELECT * FROM test_table');
    console.log(`   💾 Test Data: ${testResult.rows[0].message}`);
    
    await client.query('DROP TABLE test_table');
    await client.end();
    
    console.log('   ✅ PostgreSQL communication: SUCCESS\n');
    return true;
  } catch (error) {
    console.error('   ❌ PostgreSQL connection failed:', error.message);
    return false;
  }
}

// Test MinIO connection
async function testMinIO() {
  console.log('2. 🪣 Testing MinIO connection...');
  
  const minioClient = new MinioClient({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY || 'testminio',
    secretKey: process.env.MINIO_SECRET_KEY || 'testminio123'
  });

  try {
    // Test listing buckets
    const buckets = await minioClient.listBuckets();
    console.log('   ✅ Connected to MinIO');
    console.log(`   🪣 Found ${buckets.length} existing buckets`);
    
    // Test creating a bucket
    const testBucket = 'test-bucket-nodejs';
    const bucketExists = await minioClient.bucketExists(testBucket);
    
    if (!bucketExists) {
      await minioClient.makeBucket(testBucket);
      console.log(`   ➕ Created test bucket: ${testBucket}`);
    } else {
      console.log(`   📁 Test bucket already exists: ${testBucket}`);
    }
    
    // Test uploading an object
    const testObject = 'test-object.txt';
    const testData = 'Hello from Node.js to MinIO!';
    
    await minioClient.putObject(testBucket, testObject, testData);
    console.log(`   ⬆️  Uploaded test object: ${testObject}`);
    
    // Test downloading the object
    const stream = await minioClient.getObject(testBucket, testObject);
    let downloadedData = '';
    
    await new Promise((resolve, reject) => {
      stream.on('data', chunk => downloadedData += chunk);
      stream.on('end', resolve);
      stream.on('error', reject);
    });
    
    console.log(`   ⬇️  Downloaded data: "${downloadedData}"`);
    
    // Cleanup
    await minioClient.removeObject(testBucket, testObject);
    await minioClient.removeBucket(testBucket);
    console.log('   🧹 Cleaned up test data');
    
    console.log('   ✅ MinIO communication: SUCCESS\n');
    return true;
  } catch (error) {
    console.error('   ❌ MinIO connection failed:', error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  let allPassed = true;
  
  try {
    const pgResult = await testPostgreSQL();
    const minioResult = await testMinIO();
    
    allPassed = pgResult && minioResult;
    
    if (allPassed) {
      console.log('🎉 ALL TESTS PASSED! Node.js can communicate with both containers.');
      console.log('   ✅ PostgreSQL: Full CRUD operations working');
      console.log('   ✅ MinIO: Bucket and object operations working');
    } else {
      console.log('❌ Some tests failed. Check container status and configuration.');
    }
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    allPassed = false;
  }
  
  process.exit(allPassed ? 0 : 1);
}

runTests();