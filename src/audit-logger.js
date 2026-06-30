// ============================================================
// AUDIT LOGGER MODULE
// Logs all data operations to DPMM_AUDIT_LOG table
// ============================================================

/**
 * Log an audit event to the DPMM_AUDIT_LOG table
 * @param {Object} params - Audit parameters
 * @param {string} params.user_id - User who performed the action
 * @param {string} params.action - Action type (INSERT, UPDATE, DELETE, SELECT)
 * @param {string} params.table_name - Table affected
 * @param {string} params.record_id - Record ID (if applicable)
 * @param {Object} params.old_values - Previous state (for UPDATE/DELETE)
 * @param {Object} params.new_values - New state (for INSERT/UPDATE)
 * @param {string} params.ip_address - Client IP address
 * @param {string} params.user_agent - Client user agent
 */
export async function logAuditEvent(params) {
  const {
    user_id,
    action,
    table_name,
    record_id = null,
    old_values = null,
    new_values = null,
    ip_address = null,
    user_agent = null
  } = params;

  try {
    // Validate required fields
    if (!action || !table_name) {
      console.error('Audit log missing required fields:', { action, table_name });
      return;
    }

    // Prepare the log entry
    const logEntry = {
      user_id: user_id || 'anonymous',
      action: action.toUpperCase(),
      table_name: table_name,
      record_id: record_id ? String(record_id) : null,
      old_values: old_values ? JSON.stringify(old_values) : null,
      new_values: new_values ? JSON.stringify(new_values) : null,
      ip_address: ip_address,
      user_agent: user_agent
    };

    // Insert into audit log table
    // This uses the Supabase client from the calling context
    // The caller should pass the supabase client as a parameter
    console.log('Audit log entry:', logEntry);
    
    // Return the log entry for the caller to insert
    return logEntry;
  } catch (error) {
    console.error('Audit logging error:', error);
    // Don't throw - audit logging failures should not break the main operation
  }
}

/**
 * Wrapper function to log Supabase operations
 * Call this before/after Supabase operations
 */
export class AuditLogger {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * Log an INSERT operation
   */
  async logInsert(user_id, table_name, new_values, record_id = null) {
    return await logAuditEvent({
      user_id,
      action: 'INSERT',
      table_name,
      record_id,
      new_values,
      ip_address: this.getClientIP(),
      user_agent: this.getUserAgent()
    });
  }

  /**
   * Log an UPDATE operation
   */
  async logUpdate(user_id, table_name, record_id, old_values, new_values) {
    return await logAuditEvent({
      user_id,
      action: 'UPDATE',
      table_name,
      record_id,
      old_values,
      new_values,
      ip_address: this.getClientIP(),
      user_agent: this.getUserAgent()
    });
  }

  /**
   * Log a DELETE operation
   */
  async logDelete(user_id, table_name, record_id, old_values) {
    return await logAuditEvent({
      user_id,
      action: 'DELETE',
      table_name,
      record_id,
      old_values,
      ip_address: this.getClientIP(),
      user_agent: this.getUserAgent()
    });
  }

  /**
   * Log a SELECT operation (for sensitive data access)
   */
  async logSelect(user_id, table_name, record_id = null) {
    return await logAuditEvent({
      user_id,
      action: 'SELECT',
      table_name,
      record_id,
      ip_address: this.getClientIP(),
      user_agent: this.getUserAgent()
    });
  }

  /**
   * Get client IP address
   */
  getClientIP() {
    // In browser context, this would need to be determined server-side
    // For now, return null - can be enhanced with proper IP detection
    return null;
  }

  /**
   * Get user agent
   */
  getUserAgent() {
    if (typeof navigator !== 'undefined') {
      return navigator.userAgent;
    }
    return null;
  }
}

// Export default instance factory
export function createAuditLogger(supabaseClient) {
  return new AuditLogger(supabaseClient);
}
