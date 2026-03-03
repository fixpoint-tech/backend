import OutsidePartyRequest from '../models/outsidePartyRequest.js';

/**
 * Get all outside party requests (optionally filtered)
 */
export const getAll = async (filters = {}) => {
    const records = await OutsidePartyRequest.getAllWithFilters(filters);
    return records.map(r => r.toJSON());
};

/**
 * Get one by ID
 */
export const getById = async (id) => {
    const record = await OutsidePartyRequest.findByPk(id);
    return record ? record.toJSON() : null;
};

/**
 * Create a new outside party request
 */
export const create = async (data) => {
    const { issue_id, suggested_by, vendor_name, description } = data;
    if (!issue_id || !suggested_by || !vendor_name || !description) {
        throw new Error('Missing required fields: issue_id, suggested_by, vendor_name, description');
    }
    const record = await OutsidePartyRequest.create({ issue_id, suggested_by, vendor_name, description });
    return record.toJSON();
};

/**
 * Approve a request
 */
export const approve = async (id, approvedBy, comment = null) => {
    const record = await OutsidePartyRequest.findByPk(id);
    if (!record) return null;
    if (record.status === 'approved') throw new Error('Already approved');
    return (await OutsidePartyRequest.updateStatus(id, 'approved', approvedBy, comment)).toJSON();
};

/**
 * Reject a request
 */
export const reject = async (id, approvedBy, comment = null) => {
    const record = await OutsidePartyRequest.findByPk(id);
    if (!record) return null;
    if (record.status === 'rejected') throw new Error('Already rejected');
    return (await OutsidePartyRequest.updateStatus(id, 'rejected', approvedBy, comment)).toJSON();
};

/**
 * Delete a request (cancel)
 */
export const remove = async (id) => {
    const record = await OutsidePartyRequest.findByPk(id);
    if (!record) return false;
    await record.destroy();
    return true;
};
