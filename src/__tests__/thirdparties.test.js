import request from 'supertest';
import express from 'express';
import { getSequelizeInstance } from '../services/connectionService.js';
import thirdPartiesRoutes from '../routes/thirdparties.js';
import ThirdParty from '../models/thirdParty.js';

const app = express();
app.use(express.json());
app.use('/api/v1/thirdparties', thirdPartiesRoutes);

let sequelize;

beforeAll(async () => {
    sequelize = getSequelizeInstance();
    await sequelize.sync({ force: true }); // Reset database before tests
});

afterAll(async () => {
    await sequelize.close();
});

describe('ThirdParty Endpoints', () => {
    let thirdPartyId;

    describe('POST /api/v1/thirdparties', () => {
        it('should create a new third party with valid data', async () => {
            const res = await request(app).post('/api/v1/thirdparties').send({
                organization: 'Tech Solutions Inc',
                email: 'contact@techsolutions.com',
                location: 'New York',
                phone: '1234567890',
                worktype: 'Software Development',
                profilePicture: 'https://example.com/logo.png'
            });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('id');
            expect(res.body.data.organization).toBe('Tech Solutions Inc');
            expect(res.body.data.email).toBe('contact@techsolutions.com');
            expect(res.body.data.location).toBe('New York');
            expect(res.body.data.worktype).toBe('Software Development');
            expect(res.body.message).toBe('Third party created successfully');

            thirdPartyId = res.body.data.id;
        });

        it('should create a third party with minimal required data', async () => {
            const res = await request(app).post('/api/v1/thirdparties').send({
                organization: 'Minimal Corp',
                email: 'minimal@corp.com'
            });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.organization).toBe('Minimal Corp');
            expect(res.body.data.email).toBe('minimal@corp.com');
            expect(res.body.data.location).toBeNull();
            expect(res.body.data.phone).toBeNull();
            expect(res.body.data.worktype).toBeNull();
        });

        it('should reject third party with duplicate email', async () => {
            const res = await request(app).post('/api/v1/thirdparties').send({
                organization: 'Duplicate Email Corp',
                email: 'contact@techsolutions.com', // Same email as first test
                location: 'California'
            });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Email already exists');
        });

        it('should reject third party with invalid email format', async () => {
            const res = await request(app).post('/api/v1/thirdparties').send({
                organization: 'Invalid Email Corp',
                email: 'not-an-email',
                location: 'Texas'
            });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.errors).toBeDefined();
        });

        it('should reject third party with missing organization', async () => {
            const res = await request(app).post('/api/v1/thirdparties').send({
                email: 'noorg@test.com',
                location: 'Florida'
            });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.errors).toBeDefined();
        });

        it('should reject third party with missing email', async () => {
            const res = await request(app).post('/api/v1/thirdparties').send({
                organization: 'No Email Corp',
                location: 'Nevada'
            });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.errors).toBeDefined();
        });

        it('should reject third party with short organization name', async () => {
            const res = await request(app).post('/api/v1/thirdparties').send({
                organization: 'A', // Too short
                email: 'short@org.com'
            });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should reject third party with short phone number', async () => {
            const res = await request(app).post('/api/v1/thirdparties').send({
                organization: 'Short Phone Corp',
                email: 'shortphone@corp.com',
                phone: '123' // Too short
            });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should reject third party with invalid profile picture URL', async () => {
            const res = await request(app).post('/api/v1/thirdparties').send({
                organization: 'Invalid URL Corp',
                email: 'invalidurl@corp.com',
                profilePicture: 'not-a-url'
            });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /api/v1/thirdparties', () => {
        beforeAll(async () => {
            // Create additional test data
            await ThirdParty.create({
                organization: 'AI Solutions Ltd',
                email: 'ai@solutions.com',
                location: 'California',
                worktype: 'AI Development'
            });
            await ThirdParty.create({
                organization: 'Web Design Co',
                email: 'web@design.com',
                location: 'New York',
                worktype: 'Web Development'
            });
            await ThirdParty.create({
                organization: 'Mobile Apps Inc',
                email: 'mobile@apps.com',
                location: 'Texas',
                worktype: 'Mobile Development'
            });
        });

        it('should get all third parties', async () => {
            const res = await request(app).get('/api/v1/thirdparties');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body).toHaveProperty('count');
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
            expect(res.body.count).toBe(res.body.data.length);
        });

        it('should filter third parties by worktype', async () => {
            const res = await request(app).get('/api/v1/thirdparties?worktype=AI Development');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
            expect(res.body.data[0].worktype).toBe('AI Development');
        });

        it('should filter third parties by location', async () => {
            const res = await request(app).get('/api/v1/thirdparties?location=California');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
            expect(res.body.data[0].location).toBe('California');
        });

        it('should search third parties by organization name', async () => {
            const res = await request(app).get('/api/v1/thirdparties?search=Tech');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
            expect(res.body.data[0].organization).toContain('Tech');
        });

        it('should return empty array for non-existent search term', async () => {
            const res = await request(app).get('/api/v1/thirdparties?search=NonExistentCompany');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.length).toBe(0);
            expect(res.body.count).toBe(0);
        });

        it('should combine multiple filters', async () => {
            const res = await request(app).get('/api/v1/thirdparties?worktype=Software Development&location=New York');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    describe('GET /api/v1/thirdparties/:id', () => {
        it('should get third party by valid ID', async () => {
            const res = await request(app).get(`/api/v1/thirdparties/${thirdPartyId}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.id).toBe(thirdPartyId);
            expect(res.body.data.organization).toBe('Tech Solutions Inc');
        });

        it('should return 404 for non-existent third party ID', async () => {
            const res = await request(app).get('/api/v1/thirdparties/99999');

            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Third party not found');
        });

        it('should reject invalid ID format', async () => {
            const res = await request(app).get('/api/v1/thirdparties/invalid');

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should reject negative ID', async () => {
            const res = await request(app).get('/api/v1/thirdparties/-1');

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe('PUT /api/v1/thirdparties/:id', () => {
        it('should update third party with valid data', async () => {
            const res = await request(app).put(`/api/v1/thirdparties/${thirdPartyId}`).send({
                organization: 'Updated Tech Solutions Inc',
                location: 'California',
                worktype: 'AI Development',
                phone: '9876543210'
            });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.organization).toBe('Updated Tech Solutions Inc');
            expect(res.body.data.location).toBe('California');
            expect(res.body.data.worktype).toBe('AI Development');
            expect(res.body.data.phone).toBe('9876543210');
            expect(res.body.message).toBe('Third party updated successfully');
        });

        it('should update only specified fields', async () => {
            const res = await request(app).put(`/api/v1/thirdparties/${thirdPartyId}`).send({
                worktype: 'Machine Learning'
            });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.worktype).toBe('Machine Learning');
            expect(res.body.data.organization).toBe('Updated Tech Solutions Inc'); // Should remain unchanged
        });

        it('should return 404 for non-existent third party ID', async () => {
            const res = await request(app).put('/api/v1/thirdparties/99999').send({
                organization: 'Non-existent Update'
            });

            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Third party not found');
        });

        it('should reject update with invalid email format', async () => {
            const res = await request(app).put(`/api/v1/thirdparties/${thirdPartyId}`).send({
                email: 'invalid-email'
            });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should reject update with short organization name', async () => {
            const res = await request(app).put(`/api/v1/thirdparties/${thirdPartyId}`).send({
                organization: 'A'
            });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /api/v1/thirdparties/worktype/:worktype', () => {
        it('should get third parties by work type', async () => {
            const res = await request(app).get('/api/v1/thirdparties/worktype/AI Development');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            if (res.body.data.length > 0) {
                expect(res.body.data[0].worktype).toBe('AI Development');
            }
        });

        it('should return empty array for non-existent work type', async () => {
            const res = await request(app).get('/api/v1/thirdparties/worktype/NonExistentWorkType');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.length).toBe(0);
        });
    });

    describe('GET /api/v1/thirdparties/location/:location', () => {
        it('should get third parties by location', async () => {
            const res = await request(app).get('/api/v1/thirdparties/location/California');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            if (res.body.data.length > 0) {
                expect(res.body.data[0].location).toBe('California');
            }
        });

        it('should return empty array for non-existent location', async () => {
            const res = await request(app).get('/api/v1/thirdparties/location/NonExistentLocation');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.length).toBe(0);
        });
    });

    describe('DELETE /api/v1/thirdparties/:id', () => {
        let deleteTestId;

        beforeAll(async () => {
            // Create a third party specifically for deletion test
            const deleteTest = await ThirdParty.create({
                organization: 'Delete Test Corp',
                email: 'delete@test.com',
                location: 'Delete Location'
            });
            deleteTestId = deleteTest.id;
        });

        it('should delete third party by valid ID', async () => {
            const res = await request(app).delete(`/api/v1/thirdparties/${deleteTestId}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('Third party deleted successfully');
        });

        it('should return 404 when trying to get deleted third party', async () => {
            const res = await request(app).get(`/api/v1/thirdparties/${deleteTestId}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Third party not found');
        });

        it('should return 404 for non-existent third party ID', async () => {
            const res = await request(app).delete('/api/v1/thirdparties/99999');

            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Third party not found');
        });

        it('should reject invalid ID format for deletion', async () => {
            const res = await request(app).delete('/api/v1/thirdparties/invalid');

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should successfully delete the main test third party', async () => {
            const res = await request(app).delete(`/api/v1/thirdparties/${thirdPartyId}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('Third party deleted successfully');
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle very long organization name', async () => {
            const longName = 'A'.repeat(300); // Longer than 255 chars
            const res = await request(app).post('/api/v1/thirdparties').send({
                organization: longName,
                email: 'longname@test.com'
            });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should handle very long location', async () => {
            const longLocation = 'B'.repeat(300); // Longer than 255 chars
            const res = await request(app).post('/api/v1/thirdparties').send({
                organization: 'Location Test Corp',
                email: 'locationtest@test.com',
                location: longLocation
            });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should handle very long work type', async () => {
            const longWorkType = 'C'.repeat(150); // Longer than 100 chars
            const res = await request(app).post('/api/v1/thirdparties').send({
                organization: 'WorkType Test Corp',
                email: 'worktypetest@test.com',
                worktype: longWorkType
            });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should handle empty request body', async () => {
            const res = await request(app).post('/api/v1/thirdparties').send({});

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should handle malformed JSON', async () => {
            const res = await request(app)
                .post('/api/v1/thirdparties')
                .set('Content-Type', 'application/json')
                .send('{"organization": "Test", "email":}'); // Malformed JSON

            expect(res.statusCode).toBe(400);
        });
    });
});