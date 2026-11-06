import { AuditLog } from '../models/AuditLog.js';

export const logAudit = async ({
  actor = null,
  actorName = 'System',
  actorRole = 'SYSTEM',
  action,
  resourceType,
  resourceId,
  changeSummary,
  details = null,
  req = null
}) => {
  try {
    const ipAddress = req ? req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress : null;
    const userAgent = req ? req.headers['user-agent'] : null;

    await AuditLog.create({
      actor: actor?._id || actor || null,
      actorName: actor?.name || actorName,
      actorRole: actor?.role || actorRole,
      action,
      resourceType,
      resourceId: String(resourceId),
      changeSummary,
      details,
      ipAddress,
      userAgent
    });
  } catch (error) {
    console.error('[AuditLog] Error logging audit action:', error.message);
  }
};
