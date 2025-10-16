import thirdPartiesService from '../services/thirdpartiesService.js';

/**
 * ThirdParties Controller - Handles HTTP requests for third party operations
 */
class ThirdPartiesController {
    /**
     * Create a new third party
     * @route POST /api/v1/thirdparties
     */
    async createThirdParty(req, res) {
        try {
            const thirdPartyData = req.body;
            const thirdParty = await thirdPartiesService.createThirdParty(thirdPartyData);

            res.status(201).json({
                success: true,
                message: 'Third party created successfully',
                data: thirdParty
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Get all third parties
     * @route GET /api/v1/thirdparties
     */
    async getAllThirdParties(req, res) {
        try {
            const { worktype, location, search } = req.query;

            let thirdParties;

            // Handle search
            if (search) {
                thirdParties = await thirdPartiesService.searchThirdParties(search);
            } else {
                // Handle filters
                const filters = {};
                if (worktype) filters.worktype = worktype;
                if (location) filters.location = location;

                thirdParties = await thirdPartiesService.getAllThirdParties(filters);
            }

            res.status(200).json({
                success: true,
                count: thirdParties.length,
                data: thirdParties
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Get third party by ID
     * @route GET /api/v1/thirdparties/:id
     */
    async getThirdPartyById(req, res) {
        try {
            const { id } = req.params;
            const thirdParty = await thirdPartiesService.getThirdPartyById(id);

            res.status(200).json({
                success: true,
                data: thirdParty
            });
        } catch (error) {
            const statusCode = error.message === 'Third party not found' ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Update third party by ID
     * @route PUT /api/v1/thirdparties/:id
     */
    async updateThirdParty(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const thirdParty = await thirdPartiesService.updateThirdParty(id, updateData);

            res.status(200).json({
                success: true,
                message: 'Third party updated successfully',
                data: thirdParty
            });
        } catch (error) {
            const statusCode = error.message === 'Third party not found' ? 404 : 400;
            res.status(statusCode).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Delete third party by ID
     * @route DELETE /api/v1/thirdparties/:id
     */
    async deleteThirdParty(req, res) {
        try {
            const { id } = req.params;
            const result = await thirdPartiesService.deleteThirdParty(id);

            res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            const statusCode = error.message === 'Third party not found' ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Get third parties by work type
     * @route GET /api/v1/thirdparties/worktype/:worktype
     */
    async getThirdPartiesByWorkType(req, res) {
        try {
            const { worktype } = req.params;
            const thirdParties = await thirdPartiesService.getThirdPartiesByWorkType(worktype);

            res.status(200).json({
                success: true,
                count: thirdParties.length,
                data: thirdParties
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Get third parties by location
     * @route GET /api/v1/thirdparties/location/:location
     */
    async getThirdPartiesByLocation(req, res) {
        try {
            const { location } = req.params;
            const thirdParties = await thirdPartiesService.getThirdPartiesByLocation(location);

            res.status(200).json({
                success: true,
                count: thirdParties.length,
                data: thirdParties
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

export default new ThirdPartiesController();