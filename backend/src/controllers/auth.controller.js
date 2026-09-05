const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../config/jwt');

/**
 * Register a new customer
 */
const registerCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Prevent duplicate accounts by checking the normalized email address.
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    // Never store a customer's plain-text password in the database.
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the account with the only role allowed through customer registration.
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'CUSTOMER',
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Customer registered successfully. You can now log in.',
      user: newUser,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during registration.',
    });
  }
};

/**
 * Customer Login
 * Role guard: Only CUSTOMER role can log in
 */
const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Look up the account using the same normalized email format as registration.
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Ensure this customer endpoint cannot be used by administrative accounts.
    if (user.role !== 'CUSTOMER') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only accounts with the CUSTOMER role can log in through this portal.',
      });
    }

    // Compare the submitted password with the stored hash.
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Issue short-lived access and longer-lived refresh credentials.
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Customer login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login.',
    });
  }
};

/**
 * Admin Login
 * Role guard: Only ADMIN role can log in
 */
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the administrator by normalized email address.
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Restrict this endpoint to accounts with administrative privileges.
    if (user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only accounts with the ADMIN role can log in through this portal.',
      });
    }

    // Validate the password against its stored hash.
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Issue tokens after both identity and role checks succeed.
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return res.status(200).json({
      success: true,
      message: 'Admin login successful.',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during admin login.',
    });
  }
};

/**
 * Refresh JWT Access Token using Refresh Token
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    // A refresh token is required to request a new access token.
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required.',
      });
    }

    // Verify the token signature and expiration before using its claims.
    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token.',
      });
    }

    // Do not issue tokens for accounts that have been deleted.
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User no longer exists.',
      });
    }

    // Refresh only the access token; the existing refresh token remains unchanged.
    const newAccessToken = generateAccessToken(user);

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during token refresh.',
    });
  }
};

module.exports = {
  registerCustomer,
  loginCustomer,
  loginAdmin,
  refreshToken,
};
