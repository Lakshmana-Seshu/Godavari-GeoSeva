import { User } from '../models/User.js';
import { logAudit } from '../services/auditService.js';
import { USER_ROLES } from '../config/constants.js';

export const getUsers = async (req, res, next) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (status) filter.accountStatus = status;
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: searchRegex }, { email: searchRegex }, { organization: searchRegex }];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-passwordHash')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      User.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!USER_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Permitted roles: ${USER_ROLES.join(', ')}`
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    await logAudit({
      actor: req.user,
      action: 'USER_ROLE_CHANGE',
      resourceType: 'User',
      resourceId: user._id,
      changeSummary: `Changed role of user ${user.email} from ${oldRole} to ${role}`,
      req
    });

    return res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'SUSPENDED', 'PENDING'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Permitted: ACTIVE, SUSPENDED, PENDING'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.accountStatus = status;
    await user.save();

    await logAudit({
      actor: req.user,
      action: 'USER_STATUS_CHANGE',
      resourceType: 'User',
      resourceId: user._id,
      changeSummary: `Changed status of user ${user.email} to ${status}`,
      req
    });

    return res.status(200).json({
      success: true,
      message: `User status updated to ${status}`,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        accountStatus: user.accountStatus
      }
    });
  } catch (error) {
    next(error);
  }
};
