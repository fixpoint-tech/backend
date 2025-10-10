/**
 * User API Test Suite
 * Tests all user endpoints following MVC architecture
 * 
 * Test Coverage:
 * - User creation (all roles)
 * - User retrieval (all, by ID, by role)
 * - User updates
 * - User deletion
 * - Input validation
 * - Error handling
 */

import request from 'supertest';
import express from 'express';
import userRoutes from '../routes/users.js';
import UserService from '../services/userService.js';

// Mock the UserService
jest.mock('../services/userService.js');

describe('User API - Complete Test Suite', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use('/api/users', userRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========================================
  // 1. CREATE USER TESTS
  // ========================================

  describe('POST /api/users - Create User', () => {
    const validTechnicianData = {
      name: 'Kasun Perera',
      email: 'kasun.perera@dominos.lk',
      password: 'kasun123',
      role: 'technician',
      phone: '+94771234567',
      branchId: 1,
      employeeId: 'TECH001',
      skills: ['electrical', 'plumbing', 'hvac'],
      availability: 'available'
    };

    test('should create a technician successfully', async () => {
      const mockUser = { 
        id: 1, 
        ...validTechnicianData, 
        status: 'active',
        createdAt: new Date().toISOString()
      };
      delete mockUser.password;

      UserService.createUser.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/users')
        .send(validTechnicianData)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User created successfully');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('Kasun Perera');
      expect(response.body.data.role).toBe('technician');
      expect(response.body.data).not.toHaveProperty('password');
    });

    test('should create a branch manager successfully', async () => {
      const branchManagerData = {
        name: 'Saman Silva',
        email: 'saman.silva@dominos.lk',
        password: 'saman123',
        role: 'branch_manager',
        phone: '+94771234568',
        branchId: 1,
        employeeId: 'MGR001'
      };

      const mockUser = { 
        id: 2, 
        ...branchManagerData, 
        status: 'active' 
      };
      delete mockUser.password;

      UserService.createUser.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/users')
        .send(branchManagerData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.role).toBe('branch_manager');
    });

    test('should create a maintenance executive successfully', async () => {
      const executiveData = {
        name: 'Nimal Fernando',
        email: 'nimal.fernando@dominos.lk',
        password: 'nimal123',
        role: 'maintenance_executive',
        phone: '+94771234569',
        employeeId: 'EXEC001'
      };

      const mockUser = { 
        id: 3, 
        ...executiveData, 
        status: 'active' 
      };
      delete mockUser.password;

      UserService.createUser.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/users')
        .send(executiveData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.role).toBe('maintenance_executive');
    });

    test('should fail when name is missing', async () => {
      const invalidData = {
        email: 'test@dominos.lk',
        password: 'test123',
        role: 'technician'
      };

      const response = await request(app)
        .post('/api/users')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Name is required');
    });

    test('should fail when email is invalid', async () => {
      const invalidData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'test123',
        role: 'technician'
      };

      const response = await request(app)
        .post('/api/users')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Valid email is required');
    });

    test('should fail when password is too short', async () => {
      const invalidData = {
        name: 'Test User',
        email: 'test@dominos.lk',
        password: '123',
        role: 'technician'
      };

      const response = await request(app)
        .post('/api/users')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('at least 6 characters');
    });

    test('should fail when role is invalid', async () => {
      const invalidData = {
        name: 'Test User',
        email: 'test@dominos.lk',
        password: 'test123',
        role: 'invalid_role'
      };

      const response = await request(app)
        .post('/api/users')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid role');
    });

    test('should fail when email already exists', async () => {
      const duplicateError = new Error('Duplicate key');
      duplicateError.code = '23505';
      UserService.createUser.mockRejectedValue(duplicateError);

      const response = await request(app)
        .post('/api/users')
        .send(validTechnicianData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('email already exists');
    });

    test('should sanitize input (trim and lowercase email)', async () => {
      const dataWithSpaces = {
        name: '  Kasun Perera  ',
        email: '  KASUN.PERERA@DOMINOS.LK  ',
        password: 'kasun123',
        role: 'technician'
      };

      const mockUser = { 
        id: 1, 
        name: 'Kasun Perera',
        email: 'kasun.perera@dominos.lk',
        role: 'technician',
        status: 'active'
      };

      UserService.createUser.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/users')
        .send(dataWithSpaces)
        .expect(201);

      expect(response.body.data.name).toBe('Kasun Perera');
      expect(response.body.data.email).toBe('kasun.perera@dominos.lk');
    });
  });

  // ========================================
  // 2. GET ALL USERS TESTS
  // ========================================

  describe('GET /api/users - Get All Users', () => {
    test('should get all users successfully', async () => {
      const mockUsers = [
        { id: 1, name: 'User 1', role: 'technician', status: 'active' },
        { id: 2, name: 'User 2', role: 'branch_manager', status: 'active' },
        { id: 3, name: 'User 3', role: 'maintenance_executive', status: 'active' }
      ];

      UserService.getAllUsers.mockResolvedValue(mockUsers);

      const response = await request(app)
        .get('/api/users')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(3);
      expect(response.body.data).toHaveLength(3);
    });

    test('should filter users by role', async () => {
      const mockTechnicians = [
        { id: 1, name: 'Tech 1', role: 'technician', status: 'active' }
      ];

      UserService.getAllUsers.mockResolvedValue(mockTechnicians);

      const response = await request(app)
        .get('/api/users?role=technician')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(UserService.getAllUsers).toHaveBeenCalledWith({ role: 'technician' });
    });

    test('should filter users by status', async () => {
      UserService.getAllUsers.mockResolvedValue([]);

      await request(app)
        .get('/api/users?status=active')
        .expect(200);

      expect(UserService.getAllUsers).toHaveBeenCalledWith({ status: 'active' });
    });

    test('should filter users by branch and availability', async () => {
      UserService.getAllUsers.mockResolvedValue([]);

      await request(app)
        .get('/api/users?branchId=1&availability=available')
        .expect(200);

      expect(UserService.getAllUsers).toHaveBeenCalledWith({ 
        branchId: '1', 
        availability: 'available' 
      });
    });

    test('should return empty array when no users found', async () => {
      UserService.getAllUsers.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/users')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(0);
      expect(response.body.data).toEqual([]);
    });

    test('should fail with invalid role filter', async () => {
      const response = await request(app)
        .get('/api/users?role=invalid_role')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid role');
    });
  });

  // ========================================
  // 3. GET USER BY ID TESTS
  // ========================================

  describe('GET /api/users/:id - Get User by ID', () => {
    test('should get user by ID successfully', async () => {
      const mockUser = {
        id: 1,
        name: 'Kasun Perera',
        email: 'kasun@dominos.lk',
        role: 'technician',
        status: 'active'
      };

      UserService.getUserById.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/users/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(1);
      expect(response.body.data.name).toBe('Kasun Perera');
    });

    test('should return 404 when user not found', async () => {
      UserService.getUserById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/users/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('User not found');
    });

    test('should fail with invalid user ID', async () => {
      const response = await request(app)
        .get('/api/users/invalid')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Valid user ID is required');
    });
  });

  // ========================================
  // 4. UPDATE USER TESTS
  // ========================================

  describe('PUT /api/users/:id - Update User', () => {
    test('should update user successfully', async () => {
      const existingUser = { id: 1, name: 'Old Name', role: 'technician' };
      const updatedUser = { id: 1, name: 'New Name', role: 'technician' };

      UserService.getUserById.mockResolvedValue(existingUser);
      UserService.updateUser.mockResolvedValue(updatedUser);

      const response = await request(app)
        .put('/api/users/1')
        .send({ name: 'New Name' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('New Name');
    });

    test('should return 404 when updating non-existent user', async () => {
      UserService.getUserById.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/users/999')
        .send({ name: 'New Name' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('User not found');
    });

    test('should fail when updating with invalid email', async () => {
      const response = await request(app)
        .put('/api/users/1')
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid email format');
    });
  });

  // ========================================
  // 5. UPDATE PROFILE TESTS
  // ========================================

  describe('PATCH /api/users/:id/profile - Update Profile', () => {
    test('should update user profile successfully', async () => {
      const updatedUser = {
        id: 1,
        name: 'Updated Name',
        phone: '+94771234567',
        availability: 'busy'
      };

      UserService.updateUser.mockResolvedValue(updatedUser);

      const response = await request(app)
        .patch('/api/users/1/profile')
        .send({ 
          name: 'Updated Name', 
          phone: '+94771234567',
          availability: 'busy'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Name');
    });

    test('should return 404 when user not found', async () => {
      UserService.updateUser.mockResolvedValue(null);

      const response = await request(app)
        .patch('/api/users/999/profile')
        .send({ name: 'New Name' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  // ========================================
  // 6. DELETE USER TESTS
  // ========================================

  describe('DELETE /api/users/:id - Delete User', () => {
    test('should delete user successfully (soft delete)', async () => {
      const deletedUser = {
        id: 1,
        name: 'Kasun Perera',
        status: 'inactive'
      };

      UserService.deleteUser.mockResolvedValue(deletedUser);

      const response = await request(app)
        .delete('/api/users/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('inactive');
    });

    test('should return 404 when deleting non-existent user', async () => {
      UserService.deleteUser.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/users/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('User not found');
    });
  });

  // ========================================
  // 7. ROLE-SPECIFIC ENDPOINT TESTS
  // ========================================

  describe('GET /api/users/technicians/all - Get All Technicians', () => {
    test('should get all technicians successfully', async () => {
      const mockTechnicians = [
        { id: 1, name: 'Tech 1', role: 'technician' },
        { id: 2, name: 'Tech 2', role: 'technician' }
      ];

      UserService.getUsersByRole.mockResolvedValue(mockTechnicians);

      const response = await request(app)
        .get('/api/users/technicians/all')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(UserService.getUsersByRole).toHaveBeenCalledWith('technician');
    });
  });

  describe('GET /api/users/technicians/available - Get Available Technicians', () => {
    test('should get available technicians', async () => {
      const mockTechnicians = [
        { id: 1, name: 'Tech 1', availability: 'available' }
      ];

      UserService.getAvailableTechnicians.mockResolvedValue(mockTechnicians);

      const response = await request(app)
        .get('/api/users/technicians/available')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
    });

    test('should filter available technicians by branch and skills', async () => {
      UserService.getAvailableTechnicians.mockResolvedValue([]);

      await request(app)
        .get('/api/users/technicians/available?branchId=1&skills=electrical,plumbing')
        .expect(200);

      expect(UserService.getAvailableTechnicians).toHaveBeenCalledWith({
        branchId: '1',
        skills: ['electrical', 'plumbing']
      });
    });
  });

  describe('GET /api/users/branch-managers/all - Get All Branch Managers', () => {
    test('should get all branch managers successfully', async () => {
      const mockManagers = [
        { id: 1, name: 'Manager 1', role: 'branch_manager' }
      ];

      UserService.getUsersByRole.mockResolvedValue(mockManagers);

      const response = await request(app)
        .get('/api/users/branch-managers/all')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(UserService.getUsersByRole).toHaveBeenCalledWith('branch_manager');
    });
  });

  describe('GET /api/users/maintenance-executives/all - Get All Maintenance Executives', () => {
    test('should get all maintenance executives successfully', async () => {
      const mockExecutives = [
        { id: 1, name: 'Executive 1', role: 'maintenance_executive' }
      ];

      UserService.getUsersByRole.mockResolvedValue(mockExecutives);

      const response = await request(app)
        .get('/api/users/maintenance-executives/all')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(UserService.getUsersByRole).toHaveBeenCalledWith('maintenance_executive');
    });
  });

  describe('GET /api/users/stats - Get User Statistics', () => {
    test('should get user statistics successfully', async () => {
      const mockStats = [
        { role: 'technician', count: '25' },
        { role: 'branch_manager', count: '10' },
        { role: 'maintenance_executive', count: '5' }
      ];

      UserService.getUserCountByRole.mockResolvedValue(mockStats);

      const response = await request(app)
        .get('/api/users/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
    });
  });
});
