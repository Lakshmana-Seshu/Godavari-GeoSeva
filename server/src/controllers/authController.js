import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { logAudit } from '../services/auditService.js';
import { ensureBaselineData, verifyOrHealDemoCredentials } from '../services/bootstrapService.js';

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'godavari_pushkaralu_2027_secure_jwt_token_development';
  return jwt.sign({ id: userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };

  res.cookie('token', token, cookieOptions);

  return res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      organization: user.organization,
      phone: user.phone,
      accountStatus: user.accountStatus
    }
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, organization } = req.body;
    const cleanEmail = (email || '').toLowerCase().trim();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Ensure role cannot be set to ADMIN publicly
    const assignedRole = role === 'VOLUNTEER' ? 'VOLUNTEER' : 'PILGRIM';

    const user = await User.create({
      name: name?.trim(),
      email: cleanEmail,
      passwordHash,
      role: assignedRole,
      phone: phone?.trim(),
      organization: organization?.trim(),
      accountStatus: 'ACTIVE'
    });

    await logAudit({
      actor: user,
      action: 'USER_REGISTER',
      resourceType: 'User',
      resourceId: user._id,
      changeSummary: `New user registration with role: ${assignedRole}`,
      req
    });

    return sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || '').toLowerCase().trim();

    let user = await User.findOne({ email: cleanEmail }).select('+passwordHash');

    // If user not found, check if it's a demo account or if database is unseeded
    if (!user) {
      user = await verifyOrHealDemoCredentials(cleanEmail, password);

      if (!user) {
        const totalUsers = await User.countDocuments();
        if (totalUsers === 0) {
          await ensureBaselineData();
          user = await User.findOne({ email: cleanEmail }).select('+passwordHash');
        }
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    let isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Check if candidate matches standard demo password and self-heal if necessary
      const healedUser = await verifyOrHealDemoCredentials(cleanEmail, password);
      if (healedUser) {
        user = healedUser;
        isMatch = true;
      }
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (user.accountStatus !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Account is suspended or pending verification.'
      });
    }

    await logAudit({
      actor: user,
      action: 'USER_LOGIN',
      resourceType: 'User',
      resourceId: user._id,
      changeSummary: `User ${user.email} logged in successfully`,
      req
    });

    return sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      organization: req.user.organization,
      phone: req.user.phone,
      accountStatus: req.user.accountStatus
    }
  });
};

export const logout = async (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
};

export const adminSetup = async (req, res, next) => {
  try {
    const { name, email, password, setupSecret } = req.body;
    const cleanEmail = (email || '').toLowerCase().trim();

    const expectedSecret = process.env.ADMIN_SETUP_SECRET;
    if (!expectedSecret || setupSecret !== expectedSecret) {
      return res.status(403).json({
        success: false,
        message: 'Invalid setup secret authorization token.'
      });
    }

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const admin = await User.create({
      name: name?.trim(),
      email: cleanEmail,
      passwordHash,
      role: 'ADMIN',
      organization: 'Godavari Pushkaralu Organizing Authority',
      accountStatus: 'ACTIVE'
    });

    await logAudit({
      actor: admin,
      action: 'ADMIN_SETUP_BOOTSTRAP',
      resourceType: 'User',
      resourceId: admin._id,
      changeSummary: 'Administrator account bootstrapped via secure setup',
      req
    });

    return sendTokenResponse(admin, 201, res);
  } catch (error) {
    next(error);
  }
};
