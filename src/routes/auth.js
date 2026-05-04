import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import userService from "../services/userService.js";
import { authenticateToken } from "../middleware/auth.js";
import emailService from '../services/emailService.js';

const router = express.Router();

// JWT Configuration from environment variables
if (!process.env.JWT_SECRET) {
  console.warn(
    "⚠️  WARNING: JWT_SECRET not set in environment variables. Using default (INSECURE!).",
  );
}
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Helper: get role-specific profile id (if present) from a user object
function getRoleSpecificId(user) {
  if (!user || !user.role) return null;

  // Profiles are included by userService with these aliases
  if (
    user.role === "technician" &&
    user.technicianProfile &&
    user.technicianProfile.id
  ) {
    return user.technicianProfile.id;
  }

  if (
    user.role === "branch_manager" &&
    user.branchManagerProfile &&
    user.branchManagerProfile.id
  ) {
    return user.branchManagerProfile.id;
  }

  if (
    user.role === "maintenance_executive" &&
    user.maintenanceExecutiveProfile &&
    user.maintenanceExecutiveProfile.id
  ) {
    return user.maintenanceExecutiveProfile.id;
  }

  return null;
}

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Validate input
    if (!email || !password || !name || !role) {
      return res.status(400).json({
        success: false,
        message: "Email, password, name, and role are required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Validate role
    const validRoles = [
      "technician",
      "branch_manager",
      "maintenance_executive",
    ];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid role. Must be technician, branch_manager, or maintenance_executive",
      });
    }

    // Check if user already exists
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Hash password with bcrypt before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with role-specific profile
    const userData = {
      email,
      password: hashedPassword,
      name,
      role,
      isActive: true,
    };

    // Role-specific profile data (can be extended)
    const profileData = {};

    const newUser = await userService.createUser(userData, profileData);

    // Generate JWT token
    // include the role-specific profile id in the token as `roleId`
    const roleSpecificId = getRoleSpecificId(newUser);
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        roleSpecificId: roleSpecificId,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );

    // Convert to plain object and remove password
    const userObject = newUser.get({ plain: true });
    const { password: _, ...userWithoutPassword } = userObject;

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Handle unique constraint errors
    if (error.message.includes("already exists")) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    });
  }
});

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user and return JWT token
 * @access  Public
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user by email
    const user = await userService.getUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is inactive. Please contact support.",
      });
    }

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    // include the role-specific profile id in the token as `roleId`
    const roleSpecificId = getRoleSpecificId(user);
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        roleSpecificId: roleSpecificId,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );

    // Convert Sequelize model to plain object to avoid circular reference
    const userObject = user.get({ plain: true });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = userObject;

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
});

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current logged-in user
 * @access  Protected (requires valid JWT token)
 */
router.get("/me", authenticateToken, async (req, res) => {
  try {
    // req.user is set by the authenticateToken middleware
    const user = await userService.getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Convert Sequelize model to plain object to avoid circular reference
    const userObject = user.get({ plain: true });

    // Remove password from response (already excluded by getUserById, but just in case)
    const { password: _, ...userWithoutPassword } = userObject;

    res.status(200).json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user data",
    });
  }
});

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Initiate password reset process (generate reset token)
 * @access  Public
 */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Find user by email
    const user = await userService.getUserByEmail(email);

        // Don't reveal if user exists or not (security best practice)
        if (!user) {
            // Fake success for security (prevents user enumeration)
            return res.status(200).json({
                success: true,
                message: 'If an account exists with this email, a password reset code has been sent.'
            });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Expiry: 15 minutes from now
        const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

        // Save OTP to database
        await userService.updateUser(user.id, {
            resetOTP: otp,
            resetOTPExpiry: otpExpiry
        });

        // Send Email
        try {
            await emailService.sendPasswordResetEmail(user.email, otp, user.name);
        } catch (emailError) {
            console.error('Failed to send email:', emailError);
            // In a real scenario, you might want to rollback the DB change or return an error,
            // but for security "blind" responses, we might still return success or a generic error.
            // Here we return 500 because if email fails, user can't reset.
            return res.status(500).json({
                success: false,
                message: 'Failed to send verification email. Please try again.'
            });
        }

        res.status(200).json({
            success: true,
            // SECURITY: Do NOT return the OTP in the response
            message: 'If an account exists with this email, a password reset code has been sent.'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process password reset request'
        });
    }
});

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password using reset token
 * @access  Public
 */
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // Validate input
        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Email, OTP, and new password are required'
            });
        }

        // Validate password length
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Find the user
        const user = await userService.getUserByEmail(email);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify OTP logic
        // 1. Check if OTP matches
        if (!user.resetOTP || user.resetOTP !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP code'
            });
        }

        // 2. Check expiry
        if (!user.resetOTPExpiry || new Date() > new Date(user.resetOTPExpiry)) {
            return res.status(400).json({
                success: false,
                message: 'OTP code has expired'
            });
        }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password and clear OTP
        await userService.updateUser(user.id, {
            password: hashedPassword,
            resetOTP: null,
            resetOTPExpiry: null
        });

    res.status(200).json({
      success: true,
      message:
        "Password has been reset successfully. You can now login with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password",
    });
  }
});

export default router;
