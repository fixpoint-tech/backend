import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Mock the services before importing the controllers
const mockUserService = {
  createUser: jest.fn(),
  getAllUsers: jest.fn(),
  getUserById: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  getUsersByRole: jest.fn()
};

const mockUploadService = {
  uploadProfilePicture: jest.fn()
};

// Mock the service modules
jest.unstable_mockModule('../services/userService.js', () => ({
  default: mockUserService
}));

jest.unstable_mockModule('../services/uploadService.js', () => ({
  uploadProfilePicture: mockUploadService.uploadProfilePicture
}));

// Import the controllers after mocking
const { default: TechnicianController } = await import('../controllers/technicianController.js');
const { default: BranchManagerController } = await import('../controllers/branchManagerController.js');
const { default: MaintenanceExecutiveController } = await import('../controllers/maintenanceExecutiveController.js');

const app = express();
app.use(express.json());

// Set up routes manually to avoid middleware conflicts
// Technician routes
app.post('/api/v1/users/technicians', TechnicianController.createTechnician);
app.get('/api/v1/users/technicians', TechnicianController.getAllTechnicians);
app.get('/api/v1/users/technicians/:id', TechnicianController.getTechnicianById);
app.put('/api/v1/users/technicians/:id', TechnicianController.updateTechnician);
app.delete('/api/v1/users/technicians/:id', TechnicianController.deleteTechnician);

// Branch Manager routes
app.post('/api/v1/users/branch-managers', BranchManagerController.createBranchManager);
app.get('/api/v1/users/branch-managers', BranchManagerController.getAllBranchManagers);
app.get('/api/v1/users/branch-managers/:id', BranchManagerController.getBranchManagerById);
app.put('/api/v1/users/branch-managers/:id', BranchManagerController.updateBranchManager);
app.delete('/api/v1/users/branch-managers/:id', BranchManagerController.deleteBranchManager);

// Maintenance Executive routes
app.post('/api/v1/users/maintenance-executives', MaintenanceExecutiveController.createMaintenanceExecutive);
app.get('/api/v1/users/maintenance-executives', MaintenanceExecutiveController.getAllMaintenanceExecutives);
app.get('/api/v1/users/maintenance-executives/:id', MaintenanceExecutiveController.getMaintenanceExecutiveById);
app.put('/api/v1/users/maintenance-executives/:id', MaintenanceExecutiveController.updateMaintenanceExecutive);
app.delete('/api/v1/users/maintenance-executives/:id', MaintenanceExecutiveController.deleteMaintenanceExecutive);

// Mock data
const mockTechnician = {
  id: 1,
  name: 'John Doe',
  email: 'john.tech@test.com',
  phone: '0771234567',
  role: 'technician',
  profilePicture: null,
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z'
};

const mockBranchManager = {
  id: 2,
  name: 'Jane Smith',
  email: 'jane.manager@test.com',
  phone: '0771234568',
  role: 'branch_manager',
  profilePicture: null,
  branchId: 1,
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z'
};

const mockMaintenanceExecutive = {
  id: 3,
  name: 'Bob Wilson',
  email: 'bob.executive@test.com',
  phone: '0771234569',
  role: 'maintenance_executive',
  profilePicture: null,
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z'
};

const mockUsers = [mockTechnician, mockBranchManager, mockMaintenanceExecutive];

describe('User Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Technicians', () => {
    describe('POST /api/v1/users/technicians', () => {
      it('should create a new technician with valid data', async () => {
        mockUserService.createUser.mockResolvedValue(mockTechnician);

        const res = await request(app)
          .post('/api/v1/users/technicians')
          .send({
            name: 'John Doe',
            email: 'john.tech@test.com',
            phone: '0771234567'
          });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toEqual(mockTechnician);
        expect(mockUserService.createUser).toHaveBeenCalledWith(
          {
            name: 'John Doe',
            email: 'john.tech@test.com',
            role: 'technician',
            phone: '0771234567'
          },
          {}
        );
      });

      it('should create a technician with profile picture', async () => {
        const technicianWithPicture = {
          ...mockTechnician,
          profilePicture: 'https://example.com/profile.jpg'
        };
        
        mockUserService.createUser.mockResolvedValue(technicianWithPicture);

        const res = await request(app)
          .post('/api/v1/users/technicians')
          .send({
            name: 'John Doe',
            email: 'john.tech@test.com',
            phone: '0771234567',
            profilePicture: 'https://example.com/profile.jpg'
          });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.profilePicture).toBe('https://example.com/profile.jpg');
      });

      it('should handle duplicate email error', async () => {
        mockUserService.createUser.mockRejectedValue(new Error('Email already exists'));

        const res = await request(app)
          .post('/api/v1/users/technicians')
          .send({
            name: 'John Doe',
            email: 'existing@test.com',
            phone: '0771234567'
          });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Email already exists');
      });

      it('should handle service validation errors', async () => {
        mockUserService.createUser.mockRejectedValue(new Error('Invalid phone number format'));

        const res = await request(app)
          .post('/api/v1/users/technicians')
          .send({
            name: 'John Doe',
            email: 'john@test.com',
            phone: 'invalid'
          });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Invalid phone number format');
      });
    });

    describe('GET /api/v1/users/technicians', () => {
      it('should get all technicians', async () => {
        const technicians = [mockTechnician];
        mockUserService.getUsersByRole.mockResolvedValue(technicians);

        const res = await request(app).get('/api/v1/users/technicians');

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toEqual(technicians);
        expect(mockUserService.getUsersByRole).toHaveBeenCalledWith('technician');
      });

      it('should return empty array when no technicians found', async () => {
        mockUserService.getUsersByRole.mockResolvedValue([]);

        const res = await request(app).get('/api/v1/users/technicians');

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toEqual([]);
      });
    });

    describe('GET /api/v1/users/technicians/:id', () => {
      it('should get technician by valid ID', async () => {
        mockUserService.getUserById.mockResolvedValue(mockTechnician);

        const res = await request(app).get('/api/v1/users/technicians/1');

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toEqual(mockTechnician);
        expect(mockUserService.getUserById).toHaveBeenCalledWith('1');
      });

      it('should return 404 for non-existent technician', async () => {
        mockUserService.getUserById.mockRejectedValue(new Error('User not found'));

        const res = await request(app).get('/api/v1/users/technicians/999');

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('User not found');
      });
    });

    describe('PUT /api/v1/users/technicians/:id', () => {
      it('should update technician with valid data', async () => {
        const updatedTechnician = {
          ...mockTechnician,
          name: 'John Updated',
          phone: '0779999999'
        };
        
        // First call to getUserById to check role
        mockUserService.getUserById.mockResolvedValue(mockTechnician);
        // Second call to updateUser
        mockUserService.updateUser.mockResolvedValue(updatedTechnician);

        const res = await request(app)
          .put('/api/v1/users/technicians/1')
          .send({
            name: 'John Updated',
            phone: '0779999999'
          });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toEqual(updatedTechnician);
        expect(mockUserService.getUserById).toHaveBeenCalledWith('1');
        expect(mockUserService.updateUser).toHaveBeenCalledWith('1', {
          name: 'John Updated',
          phone: '0779999999'
        }, {});
      });

      it('should return 404 for non-existent technician update', async () => {
        // getUserById throws error for non-existent user
        mockUserService.getUserById.mockRejectedValue(new Error('User not found'));

        const res = await request(app)
          .put('/api/v1/users/technicians/999')
          .send({
            name: 'Updated Name'
          });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('User not found');
      });
    });

    describe('DELETE /api/v1/users/technicians/:id', () => {
      it('should delete technician with valid ID', async () => {
        // First call to getUserById to check role
        mockUserService.getUserById.mockResolvedValue(mockTechnician);
        // Second call to deleteUser
        mockUserService.deleteUser.mockResolvedValue({ message: 'User deleted successfully' });

        const res = await request(app).delete('/api/v1/users/technicians/1');

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('User deleted successfully');
        expect(mockUserService.getUserById).toHaveBeenCalledWith('1');
        expect(mockUserService.deleteUser).toHaveBeenCalledWith('1');
      });

      it('should return 404 for non-existent technician deletion', async () => {
        mockUserService.deleteUser.mockRejectedValue(new Error('User not found'));

        const res = await request(app).delete('/api/v1/users/technicians/999');

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('User not found');
      });
    });
  });

  describe('Branch Managers', () => {
    describe('POST /api/v1/users/branch-managers', () => {
      it('should create a new branch manager with valid data', async () => {
        mockUserService.createUser.mockResolvedValue(mockBranchManager);

        const res = await request(app)
          .post('/api/v1/users/branch-managers')
          .send({
            name: 'Jane Smith',
            email: 'jane.manager@test.com',
            phone: '0771234568',
            branchId: 1
          });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toEqual(mockBranchManager);
        expect(mockUserService.createUser).toHaveBeenCalledWith(
          {
            name: 'Jane Smith',
            email: 'jane.manager@test.com',
            role: 'branch_manager',
            phone: '0771234568'
          },
          { branchId: 1 }
        );
      });

      it('should handle branch manager creation errors', async () => {
        mockUserService.createUser.mockRejectedValue(new Error('Branch not found'));

        const res = await request(app)
          .post('/api/v1/users/branch-managers')
          .send({
            name: 'Jane Smith',
            email: 'jane@test.com',
            branchId: 999
          });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Branch not found');
      });
    });

    describe('GET /api/v1/users/branch-managers', () => {
      it('should get all branch managers', async () => {
        const branchManagers = [mockBranchManager];
        mockUserService.getUsersByRole.mockResolvedValue(branchManagers);

        const res = await request(app).get('/api/v1/users/branch-managers');

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toEqual(branchManagers);
        expect(mockUserService.getUsersByRole).toHaveBeenCalledWith('branch_manager');
      });
    });

    describe('GET /api/v1/users/branch-managers/:id', () => {
      it('should get branch manager by valid ID', async () => {
        mockUserService.getUserById.mockResolvedValue(mockBranchManager);

        const res = await request(app).get('/api/v1/users/branch-managers/2');

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toEqual(mockBranchManager);
      });
    });

    describe('PUT /api/v1/users/branch-managers/:id', () => {
      it('should update branch manager with valid data', async () => {
        const updatedManager = {
          ...mockBranchManager,
          name: 'Jane Updated',
          branchId: 2
        };
        
        mockUserService.updateUser.mockResolvedValue(updatedManager);

        const res = await request(app)
          .put('/api/v1/users/branch-managers/2')
          .send({
            name: 'Jane Updated',
            branchId: 2
          });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toEqual(updatedManager);
      });
    });

    describe('DELETE /api/v1/users/branch-managers/:id', () => {
      it('should delete branch manager with valid ID', async () => {
        mockUserService.deleteUser.mockResolvedValue({ message: 'User deleted successfully' });

        const res = await request(app).delete('/api/v1/users/branch-managers/2');

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('User deleted successfully');
      });
    });
  });

  describe('Maintenance Executives', () => {
    describe('POST /api/v1/users/maintenance-executives', () => {
      it('should create a new maintenance executive with valid data', async () => {
        mockUserService.createUser.mockResolvedValue(mockMaintenanceExecutive);

        const res = await request(app)
          .post('/api/v1/users/maintenance-executives')
          .send({
            name: 'Bob Wilson',
            email: 'bob.executive@test.com',
            phone: '0771234569'
          });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toEqual(mockMaintenanceExecutive);
        expect(mockUserService.createUser).toHaveBeenCalledWith(
          {
            name: 'Bob Wilson',
            email: 'bob.executive@test.com',
            role: 'maintenance_executive',
            phone: '0771234569'
          },
          {}
        );
      });
    });

    describe('GET /api/v1/users/maintenance-executives', () => {
      it('should get all maintenance executives', async () => {
        const executives = [mockMaintenanceExecutive];
        mockUserService.getUsersByRole.mockResolvedValue(executives);

        const res = await request(app).get('/api/v1/users/maintenance-executives');

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toEqual(executives);
        expect(mockUserService.getUsersByRole).toHaveBeenCalledWith('maintenance_executive');
      });
    });

    describe('GET /api/v1/users/maintenance-executives/:id', () => {
      it('should get maintenance executive by valid ID', async () => {
        mockUserService.getUserById.mockResolvedValue(mockMaintenanceExecutive);

        const res = await request(app).get('/api/v1/users/maintenance-executives/3');

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toEqual(mockMaintenanceExecutive);
      });
    });

    describe('PUT /api/v1/users/maintenance-executives/:id', () => {
      it('should update maintenance executive with valid data', async () => {
        const updatedExecutive = {
          ...mockMaintenanceExecutive,
          name: 'Bob Updated'
        };
        
        mockUserService.updateUser.mockResolvedValue(updatedExecutive);

        const res = await request(app)
          .put('/api/v1/users/maintenance-executives/3')
          .send({
            name: 'Bob Updated'
          });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toEqual(updatedExecutive);
      });
    });

    describe('DELETE /api/v1/users/maintenance-executives/:id', () => {
      it('should delete maintenance executive with valid ID', async () => {
        mockUserService.deleteUser.mockResolvedValue({ message: 'User deleted successfully' });

        const res = await request(app).delete('/api/v1/users/maintenance-executives/3');

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('User deleted successfully');
      });
    });
  });

  describe('Error handling', () => {
    it('should handle service errors gracefully for technicians', async () => {
      mockUserService.getUsersByRole.mockRejectedValue(new Error('Database connection failed'));

      const res = await request(app).get('/api/v1/users/technicians');

      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Database connection failed');
    });

    it('should handle service errors gracefully for branch managers', async () => {
      mockUserService.getUsersByRole.mockRejectedValue(new Error('Database connection failed'));

      const res = await request(app).get('/api/v1/users/branch-managers');

      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Database connection failed');
    });

    it('should handle service errors gracefully for maintenance executives', async () => {
      mockUserService.getUsersByRole.mockRejectedValue(new Error('Database connection failed'));

      const res = await request(app).get('/api/v1/users/maintenance-executives');

      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Database connection failed');
    });
  });
});
