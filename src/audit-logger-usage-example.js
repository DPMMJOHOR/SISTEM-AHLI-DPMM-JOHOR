// ============================================================
// AUDIT LOGGER USAGE EXAMPLE
// Shows how to integrate audit logging into existing code
// ============================================================

import { createAuditLogger } from './audit-logger.js';

// Initialize audit logger with Supabase client
// const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// const auditLogger = createAuditLogger(supabase);

// Example 1: Logging member registration (INSERT)
async function registerMember(memberData) {
  const user_id = 'current_user_id'; // Get from auth context
  
  // Log before insert
  await auditLogger.logInsert(
    user_id,
    'AHLI DPMM JOHOR',
    memberData
  );
  
  // Perform the actual insert
  const { data, error } = await supabase
    .from('AHLI DPMM JOHOR')
    .insert(memberData)
    .select();
  
  if (error) throw error;
  
  // Log with record ID after insert
  await auditLogger.logInsert(
    user_id,
    'AHLI DPMM JOHOR',
    memberData,
    data[0].id
  );
  
  return data;
}

// Example 2: Logging member update (UPDATE)
async function updateMember(memberId, updateData) {
  const user_id = 'current_user_id';
  
  // Fetch old values first
  const { data: oldData } = await supabase
    .from('AHLI DPMM JOHOR')
    .select('*')
    .eq('id', memberId)
    .single();
  
  // Log the update
  await auditLogger.logUpdate(
    user_id,
    'AHLI DPMM JOHOR',
    memberId,
    oldData,
    updateData
  );
  
  // Perform the update
  const { data, error } = await supabase
    .from('AHLI DPMM JOHOR')
    .update(updateData)
    .eq('id', memberId)
    .select();
  
  if (error) throw error;
  
  return data;
}

// Example 3: Logging member deletion (DELETE)
async function deleteMember(memberId) {
  const user_id = 'current_user_id';
  
  // Fetch old values before delete
  const { data: oldData } = await supabase
    .from('AHLI DPMM JOHOR')
    .select('*')
    .eq('id', memberId)
    .single();
  
  // Log the deletion
  await auditLogger.logDelete(
    user_id,
    'AHLI DPMM JOHOR',
    memberId,
    oldData
  );
  
  // Perform the delete
  const { error } = await supabase
    .from('AHLI DPMM JOHOR')
    .delete()
    .eq('id', memberId);
  
  if (error) throw error;
}

// Example 4: Logging sensitive data access (SELECT)
async function viewMemberDetails(memberId) {
  const user_id = 'current_user_id';
  
  // Log the access
  await auditLogger.logSelect(
    user_id,
    'AHLI DPMM JOHOR',
    memberId
  );
  
  // Fetch the data
  const { data, error } = await supabase
    .from('AHLI DPMM JOHOR')
    .select('*')
    .eq('id', memberId)
    .single();
  
  if (error) throw error;
  
  return data;
}

// Example 5: Integration with existing index.html functions
// Replace existing Supabase calls with audit-logged versions

// Before (no audit logging):
/*
async function saveMember(data) {
  const { error } = await supabase
    .from('AHLI DPMM JOHOR')
    .insert(data);
  if (error) throw error;
}
*/

// After (with audit logging):
/*
async function saveMember(data) {
  const user_id = getCurrentUserId(); // Implement this function
  await auditLogger.logInsert(user_id, 'AHLI DPMM JOHOR', data);
  
  const { data: result, error } = await supabase
    .from('AHLI DPMM JOHOR')
    .insert(data)
    .select();
  
  if (error) throw error;
  
  if (result && result[0]) {
    await auditLogger.logInsert(user_id, 'AHLI DPMM JOHOR', data, result[0].id);
  }
  
  return result;
}
*/
