# Email Retry Functionality

## Overview

The email retry feature allows administrators to resend failed email notifications for membership applications. This ensures that critical emails reach their intended recipients even if the initial send attempt fails.

## Features

### Retry Types

1. **Admin Email Retry**
   - Resends notification to DPMM admin
   - Includes application reference number, type, fasal, entity name, and payment amount
   - Marked as "[ADMIN ALERT]" to indicate retry status

2. **Applicant Email Retry**
   - Resends confirmation to the applicant
   - Includes application reference number, type, fasal, entity name, and payment amount
   - Includes disclaimer that this is confirmation only, not automatic approval

### UI Integration

Retry buttons appear in the admin panel when:
- Email sending failed (email_error flag is set)
- Email was never sent (email_admin_sent or email_applicant_sent is false)

## Implementation

### Function Signature
```javascript
async function retryEmail(id, type)
```

### Parameters
- `id`: Application ID (permohonan ID)
- `type`: Email type ('admin' or 'applicant')

### Process Flow

1. **Retrieve Application Data**
   - Fetch application from local data array
   - Validate application exists

2. **Prepare Email Content**
   - Generate HTML based on email type
   - Include relevant application details
   - Add retry-specific markers

3. **Send Email**
   - Call `/api/send-email` endpoint
   - Pass template, recipient, and content
   - Handle send errors

4. **Update Database**
   - Set email sent flag to true
   - Record timestamp of successful send
   - Clear error flag

5. **Update Local State**
   - Refresh local application data
   - Update UI to reflect success/failure

### Error Handling

- Errors are logged to database with descriptive messages
- Local state updated with error details
- User feedback provided via snack notification
- Failed retries can be attempted again

## Database Schema

### PERMOHONAN_AHLI Table Fields

- `email_admin_sent`: Boolean - Whether admin email was sent
- `email_admin_sent_at`: Timestamp - When admin email was sent
- `email_applicant_sent`: Boolean - Whether applicant email was sent
- `email_applicant_sent_at`: Timestamp - When applicant email was sent
- `email_error`: String - Error message if email send failed

## API Endpoint

### POST /api/send-email

Request body:
```json
{
  "template": "admin" | "applicant",
  "toEmail": "recipient@example.com",
  "data": {
    "subject": "Email subject",
    "html": "<html>email content</html>"
  }
}
```

## Usage

### From Admin Panel

1. Navigate to application details
2. Click "📧 Admin" button to retry admin email
3. Click "📧 Pemohon" button to retry applicant email
4. Wait for success/failure notification

### Programmatic

```javascript
// Retry admin email
await retryEmail(applicationId, 'admin');

// Retry applicant email
await retryEmail(applicationId, 'applicant');
```

## Monitoring

### Success Indicators
- Email sent flag set to true
- Timestamp recorded
- Error flag cleared
- Snack notification shows success

### Failure Indicators
- Error flag set with error message
- Snack notification shows error
- Database updated with failure details

### Logs

Check browser console for:
- API call errors
- Network failures
- Database update errors

## Best Practices

- Always verify recipient email before retry
- Check email template content before sending
- Monitor retry frequency to avoid spam
- Review error logs for patterns
- Use retry for legitimate failures only, not for spam
