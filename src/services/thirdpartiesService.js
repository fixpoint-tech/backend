import ThirdParty from '../models/thirdParty.js';

/**
 * ThirdParties Service - Contains all business logic for third party operations
 * Handles CRUD operations for third party organizations
 */
class ThirdPartiesService {
    /**
     * Create a new third party
     * @param {Object} thirdPartyData - Third party data
     * @returns {Promise<Object>} Created third party
     */
    async createThirdParty(thirdPartyData) {
        try {
            const thirdParty = await ThirdParty.create(thirdPartyData);
            return thirdParty;
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                throw new Error('Email already exists');
            }
            throw error;
        }
    }

    /**
     * Get all third parties
     * @param {Object} filters - Optional filters (worktype, location)
     * @returns {Promise<Array>} List of third parties
     */
    async getAllThirdParties(filters = {}) {
        const where = {};

        // Add filters if provided
        if (filters.worktype) {
            where.worktype = filters.worktype;
        }
        if (filters.location) {
            where.location = filters.location;
        }

        const thirdParties = await ThirdParty.findAll({
            where,
            order: [['createdAt', 'DESC']]
        });

        return thirdParties;
    }

    /**
     * Get third party by ID
     * @param {number} thirdPartyId - Third party ID
     * @returns {Promise<Object>} Third party object
     */
    async getThirdPartyById(thirdPartyId) {
        const thirdParty = await ThirdParty.findOne({
            where: { id: thirdPartyId }
        });

        if (!thirdParty) {
            throw new Error('Third party not found');
        }

        return thirdParty;
    }

    /**
     * Update third party by ID
     * @param {number} thirdPartyId - Third party ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} Updated third party
     */
    async updateThirdParty(thirdPartyId, updateData) {
        const thirdParty = await ThirdParty.findOne({
            where: { id: thirdPartyId }
        });

        if (!thirdParty) {
            throw new Error('Third party not found');
        }

        await thirdParty.update(updateData);
        return thirdParty;
    }

    /**
     * Delete third party by ID
     * @param {number} thirdPartyId - Third party ID
     * @returns {Promise<Object>} Success message
     */
    async deleteThirdParty(thirdPartyId) {
        const thirdParty = await ThirdParty.findOne({
            where: { id: thirdPartyId }
        });

        if (!thirdParty) {
            throw new Error('Third party not found');
        }

        await thirdParty.destroy();

        return { message: 'Third party deleted successfully' };
    }

    /**
     * Get third parties by work type
     * @param {string} worktype - Work type filter
     * @returns {Promise<Array>} List of third parties
     */
    async getThirdPartiesByWorkType(worktype) {
        return this.getAllThirdParties({ worktype });
    }

    /**
     * Get third parties by location
     * @param {string} location - Location filter
     * @returns {Promise<Array>} List of third parties
     */
    async getThirdPartiesByLocation(location) {
        return this.getAllThirdParties({ location });
    }

    /**
     * Search third parties by organization name
     * @param {string} searchTerm - Search term for organization
     * @returns {Promise<Array>} List of matching third parties
     */
    async searchThirdParties(searchTerm) {
        const { Op } = await import('sequelize');

        const thirdParties = await ThirdParty.findAll({
            where: {
                organization: {
                    [Op.iLike]: `%${searchTerm}%`
                }
            },
            order: [['createdAt', 'DESC']]
        });

        return thirdParties;
    }
}

export default new ThirdPartiesService();