import { Facility } from '../models/Facility.js';
import { CivicIssue } from '../models/CivicIssue.js';
import { AuditLog } from '../models/AuditLog.js';
import { computeSpatialCoverage } from '../services/geoSpatialService.js';
import { ensureBaselineData } from '../services/bootstrapService.js';

export const getDashboardSummary = async (req, res, next) => {
  try {
    let totalCount = await Facility.countDocuments({ isActive: true });
    if (totalCount === 0) {
      await ensureBaselineData();
    }

    const [
      totalMappedFacilities,
      verifiedCount,
      pendingCount,
      unverifiedCount,
      rejectedCount,
      unknownOperationalCount,
      totalIssues,
      openIssues,
      submittedIssues,
      underReviewIssues,
      resolvedIssues,
      facilitiesByCategoryRaw
    ] = await Promise.all([
      Facility.countDocuments({ isActive: true }),
      Facility.countDocuments({ isActive: true, verificationStatus: 'VERIFIED' }),
      Facility.countDocuments({ isActive: true, verificationStatus: 'PENDING_VERIFICATION' }),
      Facility.countDocuments({ isActive: true, verificationStatus: 'UNVERIFIED' }),
      Facility.countDocuments({ isActive: true, verificationStatus: 'REJECTED' }),
      Facility.countDocuments({ isActive: true, operationalStatus: 'UNKNOWN' }),
      CivicIssue.countDocuments(),
      CivicIssue.countDocuments({ status: { $in: ['SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'IN_PROGRESS'] } }),
      CivicIssue.countDocuments({ status: 'SUBMITTED' }),
      CivicIssue.countDocuments({ status: 'UNDER_REVIEW' }),
      CivicIssue.countDocuments({ status: 'RESOLVED' }),
      Facility.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ])
    ]);

    const categoryMap = {};
    facilitiesByCategoryRaw.forEach((item) => {
      categoryMap[item._id] = item.count;
    });

    return res.status(200).json({
      success: true,
      data: {
        totalMappedFacilities,
        verificationMetrics: {
          verified: verifiedCount,
          pending: pendingCount,
          unverified: unverifiedCount,
          rejected: rejectedCount,
          verificationRatePercentage:
            totalMappedFacilities > 0
              ? Number(((verifiedCount / totalMappedFacilities) * 100).toFixed(1))
              : 0
        },
        unknownOperationalStatusCount: unknownOperationalCount,
        issueMetrics: {
          total: totalIssues,
          open: openIssues,
          awaitingReview: submittedIssues + underReviewIssues,
          resolved: resolvedIssues,
          resolutionRatePercentage:
            totalIssues > 0 ? Number(((resolvedIssues / totalIssues) * 100).toFixed(1)) : 0
        },
        facilitiesByCategory: categoryMap,
        // Canonical nested summaries for direct dashboard access
        facilities: {
          total: totalMappedFacilities,
          verified: verifiedCount,
          pending: pendingCount,
          unverified: unverifiedCount,
          rejected: rejectedCount,
          unknownStatus: unknownOperationalCount
        },
        issues: {
          total: totalIssues,
          open: openIssues,
          underReview: underReviewIssues,
          awaitingReview: submittedIssues + underReviewIssues,
          resolved: resolvedIssues
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getFacilityStatistics = async (req, res, next) => {
  try {
    const [byCategory, byStatus, byVerification, byDataSource] = await Promise.all([
      Facility.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Facility.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$operationalStatus', count: { $sum: 1 } } }
      ]),
      Facility.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$verificationStatus', count: { $sum: 1 } } }
      ]),
      Facility.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$dataSource', count: { $sum: 1 } } }
      ])
    ]);

    return res.status(200).json({
      success: true,
      data: {
        byCategory: byCategory.map((c) => ({ _id: c._id, category: c._id, count: c.count })),
        byStatus: byStatus.map((s) => ({ _id: s._id, status: s._id, count: s.count })),
        byVerification: byVerification.map((v) => ({ _id: v._id, status: v._id, count: v.count })),
        byDataSource: byDataSource.map((d) => ({ _id: d._id, source: d._id, count: d.count }))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getIssueStatistics = async (req, res, next) => {
  try {
    const [byStatus, byCategory, byPriority, recentTimeline] = await Promise.all([
      CivicIssue.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      CivicIssue.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      CivicIssue.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),
      CivicIssue.aggregate([
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } },
        { $limit: 14 }
      ])
    ]);

    return res.status(200).json({
      success: true,
      data: {
        byStatus: byStatus.map((s) => ({ _id: s._id, status: s._id, count: s.count })),
        byCategory: byCategory.map((c) => ({ _id: c._id, category: c._id, count: c.count })),
        byPriority: byPriority.map((p) => ({ _id: p._id, priority: p._id, count: p.count })),
        recentTimeline: recentTimeline.map((t) => ({ date: t._id, count: t.count }))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getCoverageAnalysis = async (req, res, next) => {
  try {
    const rows = parseInt(req.query.rows, 10) || 4;
    const cols = parseInt(req.query.cols, 10) || 4;

    const coverageData = await computeSpatialCoverage(rows, cols);

    return res.status(200).json({
      success: true,
      data: coverageData
    });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, resourceType } = req.query;
    const filter = {};
    if (resourceType) filter.resourceType = resourceType;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('actor', 'name email role')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      AuditLog.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      data: logs,
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
