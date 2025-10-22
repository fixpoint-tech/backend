import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Mock the services before importing the controller
const mockThirdPartiesService = {
  createThirdParty: jest.fn(),
  getAllThirdParties: jest.fn(),
  getThirdPartyById: jest.fn(),
  updateThirdParty: jest.fn(),
  deleteThirdParty: jest.fn(),
  searchThirdParties: jest.fn()
};

// Mock the service module
jest.unstable_mockModule('../services/thirdpartiesService.js', () => ({
  default: mockThirdPartiesService
}));

// Import the controller after mocking
const { default: ThirdPartiesController } = await import('../controllers/thirdPartiesController.js');

const app = express();
app.use(express.json());

// Set up routes manually to avoid middleware conflicts
app.post('/api/v1/thirdparties', ThirdPartiesController.createThirdParty);
app.get('/api/v1/thirdparties/worktype/:worktype', ThirdPartiesController.getThirdPartiesByWorkType);
app.get('/api/v1/thirdparties/location/:location', ThirdPartiesController.getThirdPartiesByLocation);
app.get('/api/v1/thirdparties/:id', ThirdPartiesController.getThirdPartyById);
app.get('/api/v1/thirdparties', ThirdPartiesController.getAllThirdParties);
app.put('/api/v1/thirdparties/:id', ThirdPartiesController.updateThirdParty);
app.delete('/api/v1/thirdparties/:id', ThirdPartiesController.deleteThirdParty);

// Mock data
const mockThirdParty = {
  id: 1,
  organization: 'Tech Solutions Inc',
  email: 'contact@techsolutions.com',
  location: 'New York',
  phone: '1234567890',
  worktype: 'Software Development',
  profilePicture: 'https://example.com/logo.png',
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z'
};

const mockThirdParties = [
  {
    id: 1,
    organization: 'AI Solutions Ltd',
    email: 'ai@solutions.com',
    location: 'California',
    worktype: 'AI Development',
    phone: null,
    profilePicture: null,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: 2,
    organization: 'Web Design Co',
    email: 'web@design.com',
    location: 'New York',
    worktype: 'Web Development',
    phone: null,
    profilePicture: null,
    createdAt: '2023-01-02T00:00:00.000Z',
    updatedAt: '2023-01-02T00:00:00.000Z'
  },
  {
    id: 3,
    organization: 'Mobile Apps Inc',
    email: 'mobile@apps.com',
    location: 'Texas',
    worktype: 'Mobile Development',
    phone: null,
    profilePicture: null,
    createdAt: '2023-01-03T00:00:00.000Z',
    updatedAt: '2023-01-03T00:00:00.000Z'
  }
];

describe('ThirdParties Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/thirdparties', () => {
    it('should create a new third party with valid data', async () => {
      mockThirdPartiesService.createThirdParty.mockResolvedValue(mockThirdParty);

      const res = await request(app)
        .post('/api/v1/thirdparties')
        .send({
          organization: 'Tech Solutions Inc',
          email: 'contact@techsolutions.com',
          location: 'New York',
          phone: '1234567890',
          worktype: 'Software Development',
          profilePicture: 'https://example.com/logo.png'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockThirdParty);
      expect(mockThirdPartiesService.createThirdParty).toHaveBeenCalledWith({
        organization: 'Tech Solutions Inc',
        email: 'contact@techsolutions.com',
        location: 'New York',
        phone: '1234567890',
        worktype: 'Software Development',
        profilePicture: 'https://example.com/logo.png'
      });
    });

    it('should create a third party with minimal required data', async () => {
      const minimalThirdParty = {
        id: 2,
        organization: 'Minimal Corp',
        email: 'minimal@corp.com',
        location: 'Texas',
        phone: null,
        worktype: null,
        profilePicture: null,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z'
      };

      mockThirdPartiesService.createThirdParty.mockResolvedValue(minimalThirdParty);

      const res = await request(app)
        .post('/api/v1/thirdparties')
        .send({
          organization: 'Minimal Corp',
          email: 'minimal@corp.com',
          location: 'Texas'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(minimalThirdParty);
      expect(mockThirdPartiesService.createThirdParty).toHaveBeenCalledWith({
        organization: 'Minimal Corp',
        email: 'minimal@corp.com',
        location: 'Texas'
      });
    });

    it('should reject third party with duplicate email', async () => {
      mockThirdPartiesService.createThirdParty.mockRejectedValue(new Error('Email already exists'));

      const res = await request(app)
        .post('/api/v1/thirdparties')
        .send({
          organization: 'Duplicate Email Corp',
          email: 'contact@techsolutions.com',
          location: 'California'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Email already exists');
      expect(mockThirdPartiesService.createThirdParty).toHaveBeenCalledWith({
        organization: 'Duplicate Email Corp',
        email: 'contact@techsolutions.com',
        location: 'California'
      });
    });

    describe('Service Error Tests', () => {
      it('should handle service validation errors', async () => {
        mockThirdPartiesService.createThirdParty.mockRejectedValue(new Error('Invalid email format'));

        const res = await request(app)
          .post('/api/v1/thirdparties')
          .send({
            organization: 'Invalid Email Corp',
            email: 'invalid-email',
            location: 'California'
          });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Invalid email format');
      });

      it('should handle missing required fields errors', async () => {
        mockThirdPartiesService.createThirdParty.mockRejectedValue(new Error('Missing required fields'));

        const res = await request(app)
          .post('/api/v1/thirdparties')
          .send({
            organization: 'Missing Email Corp',
            location: 'California'
          });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Missing required fields');
      });
    });
  });

  describe('GET /api/v1/thirdparties', () => {
    describe('Get All Third Parties', () => {
      it('should get all third parties', async () => {
        mockThirdPartiesService.getAllThirdParties.mockResolvedValue(mockThirdParties);

        const res = await request(app).get('/api/v1/thirdparties');

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toEqual(mockThirdParties);
        expect(mockThirdPartiesService.getAllThirdParties).toHaveBeenCalledWith({});
      });

      it('should filter third parties by worktype', async () => {
        const filteredData = [mockThirdParties[0]];
        mockThirdPartiesService.getAllThirdParties.mockResolvedValue(filteredData);

        const res = await request(app).get('/api/v1/thirdparties?worktype=AI%20Development');

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toEqual(filteredData);
        expect(mockThirdPartiesService.getAllThirdParties).toHaveBeenCalledWith({ worktype: 'AI Development' });
      });

      it('should filter third parties by location', async () => {
        const filteredData = [mockThirdParties[1]];
        mockThirdPartiesService.getAllThirdParties.mockResolvedValue(filteredData);

        const res = await request(app).get('/api/v1/thirdparties?location=New%20York');

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toEqual(filteredData);
        expect(mockThirdPartiesService.getAllThirdParties).toHaveBeenCalledWith({ location: 'New York' });
      });

      it('should search third parties by organization name', async () => {
        const searchResults = [mockThirdParties[0]];
        mockThirdPartiesService.searchThirdParties.mockResolvedValue(searchResults);

        const res = await request(app).get('/api/v1/thirdparties?search=AI%20Solutions');

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toEqual(searchResults);
        expect(mockThirdPartiesService.searchThirdParties).toHaveBeenCalledWith('AI Solutions');
      });

      it('should return empty array for non-existent search term', async () => {
        mockThirdPartiesService.searchThirdParties.mockResolvedValue([]);

        const res = await request(app).get('/api/v1/thirdparties?search=NonExistent');

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toEqual([]);
        expect(mockThirdPartiesService.searchThirdParties).toHaveBeenCalledWith('NonExistent');
      });
    });

    describe('Get Third Party by ID', () => {
      it('should get third party by valid ID', async () => {
        mockThirdPartiesService.getThirdPartyById.mockResolvedValue(mockThirdParty);

        const res = await request(app).get('/api/v1/thirdparties/1');

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toEqual(mockThirdParty);
        expect(mockThirdPartiesService.getThirdPartyById).toHaveBeenCalledWith('1');
      });

      it('should return 404 for non-existent third party ID', async () => {
        mockThirdPartiesService.getThirdPartyById.mockRejectedValue(new Error('Third party not found'));

        const res = await request(app).get('/api/v1/thirdparties/999');

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Third party not found');
        expect(mockThirdPartiesService.getThirdPartyById).toHaveBeenCalledWith('999');
      });

      it('should handle service errors for invalid ID', async () => {
        mockThirdPartiesService.getThirdPartyById.mockRejectedValue(new Error('Invalid ID format'));

        const res = await request(app).get('/api/v1/thirdparties/invalid');

        expect(res.statusCode).toBe(500);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Invalid ID format');
      });
    });
  });

  describe('PUT /api/v1/thirdparties/:id', () => {
    it('should update third party with valid data', async () => {
      const updatedThirdParty = {
        ...mockThirdParty,
        organization: 'Updated Tech Solutions Inc',
        location: 'California'
      };
      
      mockThirdPartiesService.updateThirdParty.mockResolvedValue(updatedThirdParty);

      const res = await request(app)
        .put('/api/v1/thirdparties/1')
        .send({
          organization: 'Updated Tech Solutions Inc',
          location: 'California'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(updatedThirdParty);
      expect(mockThirdPartiesService.updateThirdParty).toHaveBeenCalledWith('1', {
        organization: 'Updated Tech Solutions Inc',
        location: 'California'
      });
    });

      it('should return 404 for non-existent third party ID', async () => {
        mockThirdPartiesService.updateThirdParty.mockRejectedValue(new Error('Third party not found'));

        const res = await request(app)
          .put('/api/v1/thirdparties/999')
          .send({
            organization: 'Updated Organization'
          });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Third party not found');
      expect(mockThirdPartiesService.updateThirdParty).toHaveBeenCalledWith('999', {
        organization: 'Updated Organization'
      });
    });    it('should handle service errors for invalid ID in update', async () => {
      mockThirdPartiesService.updateThirdParty.mockRejectedValue(new Error('Invalid ID format'));

      const res = await request(app)
        .put('/api/v1/thirdparties/invalid')
        .send({
          organization: 'Valid Organization'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid ID format');
    });

    describe('Update service error tests', () => {
      it('should handle service validation errors for update', async () => {
        mockThirdPartiesService.updateThirdParty.mockRejectedValue(new Error('Invalid email format'));

        const res = await request(app)
          .put('/api/v1/thirdparties/1')
          .send({
            email: 'invalid-email-format'
          });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Invalid email format');
      });
    });
  });

  describe('DELETE /api/v1/thirdparties/:id', () => {
    it('should delete third party with valid ID', async () => {
      mockThirdPartiesService.deleteThirdParty.mockResolvedValue({ message: 'Third party deleted successfully' });

      const res = await request(app).delete('/api/v1/thirdparties/1');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Third party deleted successfully');
      expect(mockThirdPartiesService.deleteThirdParty).toHaveBeenCalledWith('1');
    });

    it('should return 404 for non-existent third party ID', async () => {
      mockThirdPartiesService.deleteThirdParty.mockRejectedValue(new Error('Third party not found'));

      const res = await request(app).delete('/api/v1/thirdparties/999');

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Third party not found');
      expect(mockThirdPartiesService.deleteThirdParty).toHaveBeenCalledWith('999');
    });

    it('should handle service errors for invalid ID in delete', async () => {
      mockThirdPartiesService.deleteThirdParty.mockRejectedValue(new Error('Invalid ID format'));

      const res = await request(app).delete('/api/v1/thirdparties/invalid');

      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid ID format');
    });
  });

  describe('Error handling', () => {
    it('should handle service errors gracefully', async () => {
      mockThirdPartiesService.getAllThirdParties.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/api/v1/thirdparties');

      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Database error');
    });

    it('should handle service errors for create operations', async () => {
      mockThirdPartiesService.createThirdParty.mockRejectedValue(new Error('Database connection failed'));

      const res = await request(app)
        .post('/api/v1/thirdparties')
        .send({
          organization: 'Test Organization',
          email: 'test@example.com',
          location: 'California'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Database connection failed');
    });

    it('should handle service errors for update operations', async () => {
      mockThirdPartiesService.updateThirdParty.mockRejectedValue(new Error('Update failed'));

      const res = await request(app)
        .put('/api/v1/thirdparties/1')
        .send({
          organization: 'Updated Organization'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Update failed');
    });

    it('should handle service errors for delete operations', async () => {
      mockThirdPartiesService.deleteThirdParty.mockRejectedValue(new Error('Delete failed'));

      const res = await request(app).delete('/api/v1/thirdparties/1');

      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Delete failed');
    });
  });
});
