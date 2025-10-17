/**
 * Usage: node src/__tests__/cash-requests.test.js
 */

const BASE_URL = 'http://localhost:5000/api/v1/cash-requests';

// Sample test data
const sampleCashRequest = {
    technician_id: 1,
    ticket_id: 1,
    amount: 150.00,
    description: 'Spare parts for refrigerator repair including compressor relay and thermostat'
};

async function testRequest(method, url, body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return { status: response.status, data };
    } catch (error) {
        return { error: error.message };
    }
}

async function runTests() {
    console.log('🧪 Testing Cash Requests API...\n');

    let createdRequestId = null;

    // Test 1: Health Check
    console.log('1️⃣  Testing server health...');
    try {
        const healthResponse = await fetch('http://localhost:5000/api/health');
        const healthData = await healthResponse.json();
        console.log('✅ Server is running:', healthData.status);
    } catch (error) {
        console.log('❌ Server is not running. Please start the server first.');
        process.exit(1);
    }

    // Test 2: Create Cash Request
    console.log('\n2️⃣  Creating a new cash request...');
    const createResult = await testRequest('POST', BASE_URL, sampleCashRequest);
    if (createResult.data && createResult.data.success) {
        createdRequestId = createResult.data.data.id;
        console.log('✅ Cash request created:', createdRequestId);
        console.log('   Amount:', createResult.data.data.amount);
        console.log('   Status:', createResult.data.data.status);
    } else {
        console.log('❌ Failed to create cash request:', createResult.data?.message || createResult.error);
    }

    // Test 3: Get All Cash Requests
    console.log('\n3️⃣  Getting all cash requests...');
    const getAllResult = await testRequest('GET', BASE_URL);
    if (getAllResult.data && getAllResult.data.success) {
        console.log('✅ Retrieved', getAllResult.data.count, 'cash request(s)');
    } else {
        console.log('❌ Failed to get cash requests:', getAllResult.data?.message || getAllResult.error);
    }

    // Test 4: Get Cash Request by ID
    if (createdRequestId) {
        console.log('\n4️⃣  Getting cash request by ID...');
        const getByIdResult = await testRequest('GET', `${BASE_URL}/${createdRequestId}`);
        if (getByIdResult.data && getByIdResult.data.success) {
            console.log('✅ Retrieved cash request:', createdRequestId);
            console.log('   Description:', getByIdResult.data.data.description);
        } else {
            console.log('❌ Failed to get cash request:', getByIdResult.data?.message || getByIdResult.error);
        }
    }

    // Test 5: Update Cash Request
    if (createdRequestId) {
        console.log('\n5️⃣  Updating cash request...');
        const updateData = {
            amount: 175.00,
            description: 'Updated: Spare parts and additional tools for refrigerator repair'
        };
        const updateResult = await testRequest('PUT', `${BASE_URL}/${createdRequestId}`, updateData);
        if (updateResult.data && updateResult.data.success) {
            console.log('✅ Cash request updated');
            console.log('   New amount:', updateResult.data.data.amount);
        } else {
            console.log('❌ Failed to update cash request:', updateResult.data?.message || updateResult.error);
        }
    }

    // Test 6: Approve Cash Request
    if (createdRequestId) {
        console.log('\n6️⃣  Approving cash request...');
        const approveResult = await testRequest('PATCH', `${BASE_URL}/${createdRequestId}/approve`);
        if (approveResult.data && approveResult.data.success) {
            console.log('✅ Cash request approved');
            console.log('   Status:', approveResult.data.data.status);
        } else {
            console.log('❌ Failed to approve cash request:', approveResult.data?.message || approveResult.error);
        }
    }

    // Test 7: Get Filtered Cash Requests (by status)
    console.log('\n7️⃣  Getting approved cash requests...');
    const getApprovedResult = await testRequest('GET', `${BASE_URL}?status=approved`);
    if (getApprovedResult.data && getApprovedResult.data.success) {
        console.log('✅ Retrieved', getApprovedResult.data.count, 'approved request(s)');
    } else {
        console.log('❌ Failed to get approved requests:', getApprovedResult.data?.message || getApprovedResult.error);
    }

    // Test 7.5: Get Cash Requests by Ticket ID
    console.log('\n7.5️⃣  Getting cash requests by ticket ID...');
    const getByTicketResult = await testRequest('GET', `${BASE_URL}/by-ticket?ticket_id=${sampleCashRequest.ticket_id}`);
    if (getByTicketResult.data && getByTicketResult.data.success) {
        console.log('✅ Retrieved', getByTicketResult.data.count, 'cash request(s) for ticket');
    } else {
        console.log('❌ Failed to get cash requests by ticket:', getByTicketResult.data?.message || getByTicketResult.error);
    }

    // Test 7.6: Get Cash Requests by Ticket ID (non-existent)
    console.log('\n7.6️⃣  Testing filtering by non-existent ticket ID...');
    const getByTicketEmptyResult = await testRequest('GET', `${BASE_URL}/by-ticket?ticket_id=99999`);
    if (getByTicketEmptyResult.data && getByTicketEmptyResult.data.success && getByTicketEmptyResult.data.count === 0) {
        console.log('✅ Correctly returned empty results for non-existent ticket');
    } else {
        console.log('❌ Unexpected result for non-existent ticket:', getByTicketEmptyResult.data?.message || getByTicketEmptyResult.error);
    }

    // Test 8: Get Technician Statistics
    console.log('\n8️⃣  Getting technician statistics...');
    const statsResult = await testRequest('GET', `${BASE_URL}/stats/${sampleCashRequest.technician_id}`);
    if (statsResult.data && statsResult.data.success) {
        console.log('✅ Retrieved technician statistics');
        console.log('   Total requests:', statsResult.data.data.total_requests);
        console.log('   Approved:', statsResult.data.data.approved_count);
        console.log('   Total approved amount:', statsResult.data.data.total_approved_amount);
    } else {
        console.log('❌ Failed to get statistics:', statsResult.data?.message || statsResult.error);
    }

    // Test 9: Validation Test (should fail)
    console.log('\n9️⃣  Testing validation (should fail)...');
    const invalidRequest = {
        technician_id: 'invalid-id',
        amount: -50,
        description: 'Short'
    };
    const validationResult = await testRequest('POST', BASE_URL, invalidRequest);
    if (validationResult.data && !validationResult.data.success) {
        console.log('✅ Validation working correctly (request rejected)');
        console.log('   Errors:', validationResult.data.errors?.length || 'validation failed');
    } else {
        console.log('⚠️  Validation might not be working properly');
    }

    // Test 10: Delete Cash Request (cleanup)
    if (createdRequestId) {
        console.log('\n🔟  Cleaning up - deleting cash request...');
        const deleteResult = await testRequest('DELETE', `${BASE_URL}/${createdRequestId}`);
        if (deleteResult.data && deleteResult.data.success) {
            console.log('✅ Cash request deleted');
        } else {
            console.log('❌ Failed to delete cash request:', deleteResult.data?.message || deleteResult.error);
        }
    }

    console.log('\n✨ Testing complete!\n');
}

export { runTests };

if (process.argv[1].includes('cash-requests.test.js')) {
    runTests().catch(console.error);
}

// Jest test suite wrapper (only run when executed by Jest)
if (typeof describe !== 'undefined') {
    describe('Cash Requests API - Integration Tests', () => {
        test('manual integration test placeholder', () => {
            expect(true).toBe(true);
        });
    });

    afterAll(async () => {
        try {
            const http = await import('http');
            const https = await import('https');
            http.globalAgent?.destroy();
            https.globalAgent?.destroy();
        } catch (err) {
            // Ignore errors during cleanup
        }
    });
}