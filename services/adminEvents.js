/**
 * Shared admin notification + audit helpers.
 * Emits to Socket.IO admin_room when available.
 */
const NotificationRepository = require('../repositories/NotificationRepository');
const auditLogService = require('./AuditLogService');

async function notifyAdmins({ type, title, message, relatedId = null, actionUrl = null }) {
  let notification = null;
  try {
    notification = await NotificationRepository.create({
      type,
      title,
      message,
      relatedId: relatedId != null ? String(relatedId) : null,
      actionUrl
    });
  } catch (e) {
    console.warn('notifyAdmins create failed:', e.message);
  }

  try {
    if (global.__chatIo) {
      global.__chatIo.to('admin_room').emit('admin_notification', notification || {
        type, title, message, relatedId, actionUrl, createdAt: new Date().toISOString()
      });
    }
  } catch (e) {
    console.warn('notifyAdmins emit failed:', e.message);
  }

  return notification;
}

async function logAudit({ userId = null, action, entityType = null, entityId = null, oldValues = null, newValues = null, req = null }) {
  try {
    await auditLogService.createLog({
      user_id: userId,
      action_performed: action,
      entity_type: entityType,
      entity_id: entityId != null ? String(entityId) : null,
      old_values: oldValues,
      new_values: newValues,
      ip_address: req?.ip || req?.headers?.['x-forwarded-for'] || null,
      user_agent: req?.headers?.['user-agent'] || null
    });
  } catch (e) {
    console.warn('logAudit failed:', e.message);
  }
}

module.exports = { notifyAdmins, logAudit };
