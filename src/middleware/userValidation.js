/**
 * User Validation Middleware
 * Validates user data before processing
 */

/**
 * Validate email format
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format (basic validation)
 */
const validatePhone = (phone) => {
  if (!phone) return true; // Phone is optional
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.length >= 10;
};

/**
 * Validate user creation data
 */
export const validateCreateUser = (req, res, next) => {
  const { fullName, userName, email, password, role } = req.body;

  // Required fields validation
  if (!fullName || fullName.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Full name is required and cannot be empty'
    });
  }

  if (!userName || userName.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Username is required and cannot be empty'
    });
  }

  if (!email || !validateEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Valid email is required'
    });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password is required and must be at least 6 characters'
    });
  }

  const validRoles = ['technician', 'branch_manager', 'maintenance_executive', 'admin'];
  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      message: `Role is required and must be one of: ${validRoles.join(', ')}`
    });
  }

  // Optional phone validation
  if (req.body.phone && !validatePhone(req.body.phone)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid phone number format'
    });
  }

  next();
};

/**
 * Validate user update data
 */
export const validateUpdateUser = (req, res, next) => {
  const { email, phone, fullName } = req.body;

  // Validate email if provided
  if (email && !validateEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
  }

  // Validate phone if provided
  if (phone && !validatePhone(phone)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid phone number format'
    });
  }

  // Validate name if provided
  if (fullName !== undefined && fullName.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Full name cannot be empty'
    });
  }

  next();
};

/**
 * Validate user ID parameter
 */
export const validateUserId = (req, res, next) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: 'Valid user ID is required'
    });
  }

  next();
};

/**
 * Validate query parameters for filtering
 */
export const validateUserFilters = (req, res, next) => {
  const { role, isActive } = req.query;

  const validRoles = ['technician', 'branch_manager', 'maintenance_executive', 'admin'];

  if (role && !validRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      message: `Invalid role. Must be one of: ${validRoles.join(', ')}`
    });
  }

  if (isActive !== undefined && !['true', 'false'].includes(isActive)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid isActive. Must be true or false'
    });
  }

  next();
};

/**
 * Sanitize user input (basic sanitization)
 */
export const sanitizeUserInput = (req, res, next) => {
  if (req.body.fullName) {
    req.body.fullName = req.body.fullName.trim();
  }

  if (req.body.userName) {
    req.body.userName = req.body.userName.trim();
  }

  if (req.body.email) {
    req.body.email = req.body.email.trim().toLowerCase();
  }

  if (req.body.phone) {
    req.body.phone = req.body.phone.trim();
  }

  next();
};
