import { CivicIssue } from '../models/CivicIssue.js';
import { logAudit } from '../services/auditService.js';
import { broadcastRealtimeEvent } from '../services/realtimeService.js';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../config/constants.js';

export const submitIssue = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      latitude,
      longitude,
      address,
      priority = 'MEDIUM',
      reporterContact,
      reporterName,
      reporterPhone,
      reporterEmail,
      attachments = []
    } = req.body;

    // Generate unique reference code e.g. ISSUE-2027-8392
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const referenceCode = `ISSUE-2027-${randomCode}`;

    // Collect attachments from multer file upload and any pre-existing list
    const finalAttachments = Array.isArray(attachments) ? [...attachments] : [];
    if (req.file) {
      finalAttachments.push(`/uploads/${req.file.filename}`);
    }

    const contact = {
      name: reporterName || reporterContact?.name || '',
      phone: reporterPhone || reporterContact?.phone || '',
      email: reporterEmail || reporterContact?.email || ''
    };

    const newIssue = await CivicIssue.create({
      referenceCode,
      title,
      description,
      category,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      },
      address: address || '',
      priority,
      status: 'SUBMITTED',
      submittedBy: req.user?._id || null,
      reporterContact: contact,
      attachments: finalAttachments,
      statusHistory: [
        {
          status: 'SUBMITTED',
          changedBy: req.user?._id || null,
          changedByName: req.user?.name || contact.name || 'Pilgrim Reporter',
          comment: 'Initial issue reported through Godavari GeoSeva portal',
          timestamp: new Date()
        }
      ]
    });

    await logAudit({
      actor: req.user || null,
      actorName: req.user?.name || contact.name || 'Anonymous Pilgrim',
      actorRole: req.user?.role || 'PILGRIM',
      action: 'ISSUE_SUBMIT',
      resourceType: 'CivicIssue',
      resourceId: newIssue._id,
      changeSummary: `Submitted civic issue [${referenceCode}]: "${title}" (${category})`,
      req
    });

    // Broadcast instant real-time event to connected Admin & Volunteer dashboards
    broadcastRealtimeEvent({
      type: 'ISSUE_REPORTED',
      action: 'CREATE',
      issue: newIssue,
      summary: `New civic report: "${newIssue.title}" (${newIssue.category})`,
      referenceCode: newIssue.referenceCode,
      timestamp: newIssue.createdAt || new Date().toISOString()
    });

    return res.status(201).json({
      success: true,
      message: 'Civic issue report submitted successfully',
      referenceCode: newIssue.referenceCode,
      data: {
        id: newIssue._id,
        _id: newIssue._id,
        referenceCode: newIssue.referenceCode,
        title: newIssue.title,
        category: newIssue.category,
        status: newIssue.status,
        attachments: newIssue.attachments,
        createdAt: newIssue.createdAt,
        issue: newIssue
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getIssues = async (req, res, next) => {
  try {
    const {
      category,
      status,
      priority,
      referenceCode,
      page = 1,
      limit = DEFAULT_PAGE_SIZE
    } = req.query;

    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (referenceCode) filter.referenceCode = referenceCode.trim().toUpperCase();

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(limit, 10) || DEFAULT_PAGE_SIZE));
    const skip = (pageNum - 1) * limitNum;

    // Public pilgrims should not see private contact details
    const isStaff = req.user && (req.user.role === 'ADMIN' || req.user.role === 'VOLUNTEER');
    const projection = isStaff ? {} : '-reporterContact';

    const [issues, totalCount] = await Promise.all([
      CivicIssue.find(filter, projection)
        .populate('submittedBy', 'name role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      CivicIssue.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      data: {
        issues,
        pagination: {
          total: totalCount,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(totalCount / limitNum)
        }
      },
      issues,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getIssueById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Allow lookup by MongoDB ObjectId or referenceCode
    let query = {};
    if (id.startsWith('ISSUE-')) {
      query = { referenceCode: id.toUpperCase() };
    } else {
      query = { _id: id };
    }

    const isStaff = req.user && (req.user.role === 'ADMIN' || req.user.role === 'VOLUNTEER');
    const projection = isStaff ? {} : '-reporterContact';

    const issue = await CivicIssue.findOne(query, projection)
      .populate('submittedBy', 'name role organization')
      .populate('administrativeNotes.author', 'name role');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Civic issue not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: issue
    });
  } catch (error) {
    next(error);
  }
};

export const updateIssueStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, comment, administrativeNote, priority } = req.body;

    const issue = await CivicIssue.findById(id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Civic issue not found'
      });
    }

    const previousStatus = issue.status;
    issue.status = status;

    if (priority) {
      issue.priority = priority;
    }

    issue.statusHistory.push({
      status,
      changedBy: req.user._id,
      changedByName: req.user.name,
      comment: comment || `Status updated from ${previousStatus} to ${status}`,
      timestamp: new Date()
    });

    if (administrativeNote) {
      issue.administrativeNotes.push({
        author: req.user._id,
        authorName: req.user.name,
        note: administrativeNote,
        timestamp: new Date()
      });
    }

    await issue.save();

    await logAudit({
      actor: req.user,
      action: 'ISSUE_STATUS_UPDATE',
      resourceType: 'CivicIssue',
      resourceId: issue._id,
      changeSummary: `Updated issue [${issue.referenceCode}] status: ${previousStatus} -> ${status}`,
      req
    });

    // Broadcast instant real-time event
    broadcastRealtimeEvent({
      type: 'ISSUE_STATUS_UPDATED',
      action: 'UPDATE_STATUS',
      issue,
      summary: `Issue [${issue.referenceCode}] status updated: ${previousStatus} -> ${status}`,
      referenceCode: issue.referenceCode,
      status,
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: 'Issue status successfully updated',
      data: issue
    });
  } catch (error) {
    next(error);
  }
};

export const uploadAttachment = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  // Construct accessible relative URL
  const fileUrl = `/uploads/${req.file.filename}`;

  return res.status(200).json({
    success: true,
    fileUrl,
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    size: req.file.size
  });
};
