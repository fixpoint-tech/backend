import request from 'supertest';
import express from 'express';
import { getSequelizeInstance } from '../services/connectionService.js';
import userRoutes from '../routes/users.js';
import User from '../models/user.js';

const app = express();
app.use(express.json());
app.use('/api/v1/users', userRoutes);

let sequelize;

beforeAll(async () => {
  sequelize = getSequelizeInstance();
  await sequelize.sync({ force: true }); // Reset database before tests
});

afterAll(async () => {
  await sequelize.close();
});

describe('User Endpoints - Technicians', () => {
  let technicianId;

  describe('POST /api/v1/users/technicians', () => {
    it('should create a new technician with valid data', async () => {
      const res = await request(app).post('/api/v1/users/technicians').send({
        name: 'John Doe',
        email: 'john.tech@test.com',
        phone: '0771234567'
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.name).toBe('John Doe');
      expect(res.body.data.email).toBe('john.tech@test.com');
      expect(res.body.data.role).toBe('technician');
      expect(res.body.data).not.toHaveProperty('password');

      technicianId = res.body.data.id;
    });

    it('should reject technician with duplicate email', async () => {
      const res = await request(app).post('/api/v1/users/technicians').send({
        name: 'Jane Doe',
        email: 'john.tech@test.com', // Same email as above
        phone: '0772345678'
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Email');
    });

    it('should reject technician with invalid email format', async () => {
      const res = await request(app).post('/api/v1/users/technicians').send({
        name: 'Invalid Email',
        email: 'not-an-email',
        phone: '0773456789'
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject technician with missing name', async () => {
      const res = await request(app).post('/api/v1/users/technicians').send({
        email: 'noname@test.com',
        phone: '0774567890'
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject technician with short phone number', async () => {
      const res = await request(app).post('/api/v1/users/technicians').send({
        name: 'Short Phone',
        email: 'shortphone@test.com',
        phone: '123' // Too short
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/users/technicians', () => {
    it('should get all technicians', async () => {
      const res = await request(app).get('/api/v1/users/technicians');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('count');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].role).toBe('technician');
    });
  });

  describe('GET /api/v1/users/technicians/:id', () => {
    it('should get technician by valid ID', async () => {
      const res = await request(app).get(`/api/v1/users/technicians/${technicianId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(technicianId);
      expect(res.body.data.role).toBe('technician');
    });

    it('should return 404 for non-existent technician ID', async () => {
      const res = await request(app).get('/api/v1/users/technicians/99999');

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should reject invalid ID format', async () => {
      const res = await request(app).get('/api/v1/users/technicians/invalid');

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/users/technicians/:id', () => {
    it('should update technician with valid data', async () => {
      const res = await request(app).put(`/api/v1/users/technicians/${technicianId}`).send({
        name: 'John Updated',
        phone: '0779999999'
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('John Updated');
      expect(res.body.data.phone).toBe('0779999999');
    });

    it('should not allow email update', async () => {
      const res = await request(app).put(`/api/v1/users/technicians/${technicianId}`).send({
        email: 'newemail@test.com'
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should not allow role update', async () => {
      const res = await request(app).put(`/api/v1/users/technicians/${technicianId}`).send({
        role: 'branch_manager'
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/users/technicians/:id', () => {
    it('should soft delete technician', async () => {
      const res = await request(app).delete(`/api/v1/users/technicians/${technicianId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('deleted successfully');
    });

    it('should not find deleted technician', async () => {
      const res = await request(app).get(`/api/v1/users/technicians/${technicianId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});

describe('User Endpoints - Branch Managers', () => {
  let branchManagerId;

  describe('POST /api/v1/users/branch-managers', () => {
    it('should create a new branch manager', async () => {
      const res = await request(app).post('/api/v1/users/branch-managers').send({
        name: 'Manager Mike',
        email: 'mike.manager@test.com',
        phone: '0771111111'
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe('branch_manager');

      branchManagerId = res.body.data.id;
    });
  });

  describe('GET /api/v1/users/branch-managers', () => {
    it('should get all branch managers', async () => {
      const res = await request(app).get('/api/v1/users/branch-managers');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      if (res.body.data.length > 0) {
        expect(res.body.data[0].role).toBe('branch_manager');
      }
    });
  });

  describe('GET /api/v1/users/branch-managers/:id', () => {
    it('should get branch manager by ID', async () => {
      const res = await request(app).get(`/api/v1/users/branch-managers/${branchManagerId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe('branch_manager');
    });
  });

  describe('PUT /api/v1/users/branch-managers/:id', () => {
    it('should update branch manager', async () => {
      const res = await request(app).put(`/api/v1/users/branch-managers/${branchManagerId}`).send({
        name: 'Manager Mike Updated'
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Manager Mike Updated');
    });
  });

  describe('DELETE /api/v1/users/branch-managers/:id', () => {
    it('should delete branch manager', async () => {
      const res = await request(app).delete(`/api/v1/users/branch-managers/${branchManagerId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});

describe('User Endpoints - Maintenance Executives', () => {
  let executiveId;

  describe('POST /api/v1/users/maintenance-executives', () => {
    it('should create a new maintenance executive', async () => {
      const res = await request(app).post('/api/v1/users/maintenance-executives').send({
        name: 'Executive David',
        email: 'david.exec@test.com',
        phone: '0772222222'
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe('maintenance_executive');

      executiveId = res.body.data.id;
    });
  });

  describe('GET /api/v1/users/maintenance-executives', () => {
    it('should get all maintenance executives', async () => {
      const res = await request(app).get('/api/v1/users/maintenance-executives');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/users/maintenance-executives/:id', () => {
    it('should get maintenance executive by ID', async () => {
      const res = await request(app).get(`/api/v1/users/maintenance-executives/${executiveId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe('maintenance_executive');
    });
  });

  describe('PUT /api/v1/users/maintenance-executives/:id', () => {
    it('should update maintenance executive', async () => {
      const res = await request(app)
        .put(`/api/v1/users/maintenance-executives/${executiveId}`)
        .send({
          name: 'Executive David Updated'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('DELETE /api/v1/users/maintenance-executives/:id', () => {
    it('should delete maintenance executive', async () => {
      const res = await request(app).delete(`/api/v1/users/maintenance-executives/${executiveId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});

describe('User Endpoints - General', () => {
  beforeAll(async () => {
    // Create sample users for general tests
    await User.create({
      name: 'Test User 1',
      email: 'test1@general.com',
      role: 'technician',
      phone: '0773333333',
      isActive: true
    });
    await User.create({
      name: 'Test User 2',
      email: 'test2@general.com',
      role: 'branch_manager',
      phone: '0774444444',
      isActive: true
    });
  });

  describe('GET /api/v1/users', () => {
    it('should get all users (all roles)', async () => {
      const res = await request(app).get('/api/v1/users');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('should get any user by ID', async () => {
      const user = await User.findOne({ where: { email: 'test1@general.com' } });
      const res = await request(app).get(`/api/v1/users/${user.id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('test1@general.com');
    });
  });
});

// NEW TEST SUITE: Profile Picture Upload & Simplified Fields
describe('Profile Picture Upload & Simplified Fields', () => {
  describe('Technician with locationId field', () => {
    it('should create technician with locationId', async () => {
      const res = await request(app)
        .post('/api/v1/users/technicians')
        .send({
          name: 'Tech with Location',
          email: 'tech.location@test.com',
          specialization: 'Electrical',
          experienceYears: 5,
          employeeId: 'EMP001',
          isAvailable: true,
          locationId: 123
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.technicianProfile).toBeDefined();
      expect(res.body.data.technicianProfile.locationId).toBe(123);
      expect(res.body.data.technicianProfile.specialization).toBe('Electrical');
      expect(res.body.data.technicianProfile.employeeId).toBe('EMP001');
      // Should NOT have userId in nested object
      expect(res.body.data.technicianProfile.userId).toBeUndefined();
    });

    it('should NOT have certification field (removed)', async () => {
      const res = await request(app)
        .post('/api/v1/users/technicians')
        .send({
          name: 'Tech No Cert',
          email: 'tech.nocert@test.com',
          certification: 'Some Cert' // This should be ignored
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.technicianProfile).toBeDefined();
      expect(res.body.data.technicianProfile.certification).toBeUndefined();
    });
  });

  describe('BranchManager with simplified fields', () => {
    it('should create branch manager with only branchId and employeeId', async () => {
      const res = await request(app)
        .post('/api/v1/users/branch-managers')
        .send({
          name: 'Simple Manager',
          email: 'simple.manager@test.com',
          branchId: 456,
          employeeId: 'MGR001'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.branchManagerProfile).toBeDefined();
      expect(res.body.data.branchManagerProfile.branchId).toBe(456);
      expect(res.body.data.branchManagerProfile.employeeId).toBe('MGR001');
      // Should NOT have removed fields
      expect(res.body.data.branchManagerProfile.branchName).toBeUndefined();
      expect(res.body.data.branchManagerProfile.region).toBeUndefined();
      expect(res.body.data.branchManagerProfile.managementLevel).toBeUndefined();
      // Should NOT have userId in nested object
      expect(res.body.data.branchManagerProfile.userId).toBeUndefined();
    });

    it('should accept INTEGER branchId', async () => {
      const res = await request(app)
        .post('/api/v1/users/branch-managers')
        .send({
          name: 'Manager with Int Branch',
          email: 'manager.intbranch@test.com',
          branchId: 999,
          employeeId: 'MGR002'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.branchManagerProfile.branchId).toBe(999);
      expect(typeof res.body.data.branchManagerProfile.branchId).toBe('number');
    });
  });

  describe('MaintenanceExecutive with minimal fields', () => {
    it('should create maintenance executive with only employeeId', async () => {
      const res = await request(app)
        .post('/api/v1/users/maintenance-executives')
        .send({
          name: 'Minimal Executive',
          email: 'minimal.exec@test.com',
          employeeId: 'EXEC001'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.maintenanceExecutiveProfile).toBeDefined();
      expect(res.body.data.maintenanceExecutiveProfile.employeeId).toBe('EXEC001');
      // Should NOT have removed fields
      expect(res.body.data.maintenanceExecutiveProfile.department).toBeUndefined();
      expect(res.body.data.maintenanceExecutiveProfile.level).toBeUndefined();
      expect(res.body.data.maintenanceExecutiveProfile.responsibilities).toBeUndefined();
      expect(res.body.data.maintenanceExecutiveProfile.authorityLevel).toBeUndefined();
      // Should NOT have userId in nested object
      expect(res.body.data.maintenanceExecutiveProfile.userId).toBeUndefined();
    });
  });

  describe('Profile Picture Upload', () => {
    /**
     * Profile picture upload tests
     * Note: These tests verify the API accepts file uploads correctly.
     * Actual MinIO upload will fail in test environment without credentials,
     * but we're testing that the middleware and validation works properly.
     */

    it('should create user without profile picture (optional)', async () => {
      const res = await request(app)
        .post('/api/v1/users/technicians')
        .send({
          name: 'Tech No Picture',
          email: 'tech.nopicture@test.com'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.profilePicture).toBeNull();
    });

    it('should reject file larger than 5MB', async () => {
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB
      const res = await request(app)
        .post('/api/v1/users/technicians')
        .field('name', 'Tech Large File')
        .field('email', 'tech.largefile@test.com')
        .attach('profilePicture', largeBuffer, {
          filename: 'large.jpg',
          contentType: 'image/jpeg'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('5MB');
    });

    it('should reject invalid file type', async () => {
      const res = await request(app)
        .post('/api/v1/users/technicians')
        .field('name', 'Tech Invalid File')
        .field('email', 'tech.invalidfile@test.com')
        .attach('profilePicture', Buffer.from('fake pdf data'), {
          filename: 'document.pdf',
          contentType: 'application/pdf'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('Invalid file type');
    });
  });

  describe('Clean JSON Responses', () => {
    it('should NOT return userId in technician profile', async () => {
      const res = await request(app)
        .post('/api/v1/users/technicians')
        .send({
          name: 'Tech Clean JSON',
          email: 'tech.cleanjson@test.com',
          employeeId: 'CLEAN001'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data).toHaveProperty('id'); // User has id
      expect(res.body.data.technicianProfile).toBeDefined();
      expect(res.body.data.technicianProfile.userId).toBeUndefined(); // No userId duplication
    });

    it('should NOT return userId in branch manager profile', async () => {
      const res = await request(app)
        .post('/api/v1/users/branch-managers')
        .send({
          name: 'Manager Clean JSON',
          email: 'manager.cleanjson@test.com',
          employeeId: 'CLEAN002'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.branchManagerProfile).toBeDefined();
      expect(res.body.data.branchManagerProfile.userId).toBeUndefined();
    });

    it('should NOT return userId in maintenance executive profile', async () => {
      const res = await request(app)
        .post('/api/v1/users/maintenance-executives')
        .send({
          name: 'Executive Clean JSON',
          email: 'executive.cleanjson@test.com',
          employeeId: 'CLEAN003'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.maintenanceExecutiveProfile).toBeDefined();
      expect(res.body.data.maintenanceExecutiveProfile.userId).toBeUndefined();
    });
  });
});
