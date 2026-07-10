# Sistem Pengurusan Mesyuarat - User Guide

## Overview
Sistem Pengurusan Mesyuarat adalah sistem pengurusan mesyuarat berasaskan web untuk Dewan Perniagaan Melayu Malaysia (DPMM) Negeri Johor. Sistem ini membolehkan pengurusan mesyuarat, kehadiran digital, penghantaran WhatsApp, peringatan e-mel, dan integrasi Google Drive.

## Table of Contents
1. Getting Started
2. User Roles and Permissions
3. Login
4. Dashboard
5. Meeting Management
6. Attendance Management
7. WhatsApp Blast
8. Email Reminders
9. Google Drive Integration
10. Aiman AI Assistant
11. FAQ

## 1. Getting Started

### System Requirements
- Web browser (Chrome, Firefox, Safari, Edge)
- Stable internet connection
- Valid user credentials
- WhatsApp account (for WhatsApp features)
- Google account (for Google Drive integration)

### Access URL
- Production: `https://dpmmjohor.github.io/SISTEM-MESYUARAT-DPMM-JOHOR/`
- Development: Contact administrator for local development URL

## 2. User Roles and Permissions

### Admin
- **Full Access**: Can perform all operations
- **Meeting Management**: Create, edit, delete meetings
- **Attendance Management**: Manage attendance records
- **WhatsApp Blast**: Send WhatsApp messages to attendees
- **Email Reminders**: Send email reminders
- **Google Drive**: Manage Google Drive integration
- **User Management**: Manage user accounts

### Staff
- **Limited Access**: Can manage meetings and attendance
- **Meeting Management**: Create and edit meetings
- **Attendance Management**: Record attendance
- **WhatsApp Blast**: Send WhatsApp messages
- **Email Reminders**: Send email reminders
- **No Delete Access**: Cannot delete meetings

### User
- **Read-Only Access**: Can only view meeting information
- **Meeting Management**: View meeting details only
- **Attendance Management**: View attendance records only
- **No Edit Access**: Cannot modify meeting information
- **No WhatsApp/Email Access**: Cannot send messages

## 3. Login

### Step-by-Step Login Process

1. **Open the System**
   - Navigate to the system URL in your web browser
   - You will see the login screen

2. **Enter Credentials**
   - **Email**: Enter your registered email
   - **Password**: Enter your password
   - Click "Login" button

3. **Successful Login**
   - If credentials are correct, you will be redirected to the dashboard
   - Your user name will appear in the header
   - You can now access features based on your role

4. **Failed Login**
   - If credentials are incorrect, you will see an error message
   - Check your email and password
   - Contact administrator if you forgot your password

### Logout
1. Click the "Logout" button in the header
2. You will be redirected to the login screen
3. Your session will be terminated

## 4. Dashboard

### Dashboard Overview
The dashboard provides a summary of meeting information and key metrics.

### Dashboard Components
- **Upcoming Meetings**: List of upcoming meetings
- **Recent Meetings**: List of recent meetings
- **Attendance Summary**: Attendance statistics
- **WhatsApp Blast Status**: Status of recent WhatsApp blasts
- **Email Reminder Status**: Status of recent email reminders

### Navigation
- **Sidebar**: Main navigation menu
- **Search Bar**: Search for meetings
- **Quick Actions**: Quick access to common tasks

## 5. Meeting Management

### View Meeting List
1. Click "Meetings" in the sidebar
2. You will see a list of all meetings
3. Use search bar to find specific meetings
4. Use filters to filter by date, status, or type

### Create New Meeting
1. Click "Create Meeting" button
2. Fill in the meeting details:
   - **Title**: Meeting title
   - **Date**: Meeting date
   - **Time**: Meeting time
   - **Location**: Meeting location
   - **Description**: Meeting description
   - **Attendees**: Select attendees from list
3. Click "Save" to create the meeting
4. The meeting will appear in the meeting list

### Edit Meeting
1. Click on the meeting you want to edit in the meeting list
2. Update the meeting information
3. Click "Save" to save changes
4. The meeting information will be updated

### Delete Meeting
1. Click on the meeting you want to delete in the meeting list
2. Click "Delete" button
3. Confirm the deletion
4. The meeting will be removed from the system
5. **Note**: Only Admin users can delete meetings

### Search Meetings
1. Use the search bar at the top of the meeting list
2. Enter meeting title or date
3. The list will filter to show matching meetings
4. Click on a meeting to view details

### Filter Meetings
1. Use the filter options above the meeting list
2. Filter by:
   - **Date Range**: Select date range
   - **Status**: Upcoming/Completed/Cancelled
   - **Type**: Regular/Annual/Board
3. The list will update to show filtered results

## 6. Attendance Management

### View Attendance Records
1. Click on a meeting in the meeting list
2. Click "Attendance" tab
3. You will see attendance records for the meeting
4. View attendee names and attendance status

### Record Attendance
1. Open a meeting
2. Click "Attendance" tab
3. For each attendee, select attendance status:
   - **Present**: Attendee attended
   - **Absent**: Attendee did not attend
   - **Excused**: Attendee excused
4. Click "Save" to save attendance records

### Attendance Status
- **Present**: Attendee attended the meeting
- **Absent**: Attendee did not attend
- **Excused**: Attendee had valid reason for absence
- **Pending**: Attendance not yet recorded

### Attendance Reports
1. Click "Reports" in the sidebar
2. Select "Attendance Report"
3. Select date range
4. Click "Generate Report"
5. View attendance statistics and details

## 7. WhatsApp Blast

### Send WhatsApp Blast
1. Open a meeting
2. Click "WhatsApp Blast" tab
3. Compose your message:
   - **Message**: Enter message text
   - **Recipients**: Select recipients (all attendees or specific attendees)
4. Click "Send" to send WhatsApp messages
5. View blast status in the status section

### WhatsApp Blast Status
- **Pending**: Blast queued to send
- **Sending**: Blast is being sent
- **Sent**: Blast sent successfully
- **Failed**: Blast failed to send

### WhatsApp Blast Templates
1. Click "Templates" in the sidebar
2. Select "WhatsApp Templates"
3. View and manage message templates
4. Create custom templates for common messages

### WhatsApp Blast History
1. Click "History" in the sidebar
2. Select "WhatsApp Blast History"
3. View all sent WhatsApp blasts
4. View blast details and recipient lists

## 8. Email Reminders

### Send Email Reminder
1. Open a meeting
2. Click "Email Reminder" tab
3. Compose your email:
   - **Subject**: Email subject
   - **Body**: Email body
   - **Recipients**: Select recipients
4. Click "Send" to send email reminders
5. View email status in the status section

### Email Reminder Status
- **Pending**: Email queued to send
- **Sending**: Email is being sent
- **Sent**: Email sent successfully
- **Failed**: Email failed to send

### Email Templates
1. Click "Templates" in the sidebar
2. Select "Email Templates"
3. View and manage email templates
4. Create custom templates for common emails

### Email Reminder History
1. Click "History" in the sidebar
2. Select "Email History"
3. View all sent emails
4. View email details and recipient lists

## 9. Google Drive Integration

### Upload Meeting Documents
1. Open a meeting
2. Click "Google Drive" tab
3. Click "Upload Document"
4. Select files to upload
5. Files will be uploaded to Google Drive folder

### View Meeting Documents
1. Open a meeting
2. Click "Google Drive" tab
3. View all uploaded documents
4. Click on a document to open it

### Google Drive Folder Structure
- Each meeting has its own folder
- Folders are named by meeting date and title
- Documents are organized by type (agenda, minutes, attachments)

### Google Drive Permissions
- Admin: Full access to all folders
- Staff: Access to assigned meeting folders
- User: Read-only access to meeting folders

## 10. Aiman AI Assistant

### Access Aiman AI
1. Click "Aiman AI" in the sidebar
2. The AI assistant chat interface will open
3. Ask questions about meetings, attendance, or system features

### Aiman AI Capabilities
- Answer questions about meetings
- Provide meeting summaries
- Suggest meeting times
- Assist with attendance tracking
- Answer system usage questions

### Aiman AI Limitations
- Cannot modify meeting data
- Cannot send messages
- Cannot access user data without permission
- AI responses are for assistance only

### Aiman AI Best Practices
- Be specific in your questions
- Provide context when needed
- Verify AI responses with actual data
- Report AI errors to administrator

## 11. FAQ

### General Questions

**Q: What if I forget my password?**
A: Contact the system administrator to reset your password.

**Q: Can I access the system from mobile?**
A: Yes, the system is responsive and works on mobile devices.

**Q: What browsers are supported?**
A: Chrome, Firefox, Safari, and Edge are supported.

### Meeting Management

**Q: How do I create a new meeting?**
A: Click "Create Meeting" button, fill in the details, and click "Save".

**Q: Can I delete a meeting?**
A: Only Admin users can delete meetings. Staff and User roles cannot delete.

**Q: How do I search for a meeting?**
A: Use the search bar and enter meeting title or date.

### Attendance Management

**Q: What attendance statuses are available?**
A: Present, Absent, Excused, and Pending.

**Q: Can I record attendance for past meetings?**
A: Yes, you can record attendance for any meeting.

**Q: How do I generate attendance reports?**
A: Click "Reports" → "Attendance Report" → select date range → "Generate Report".

### WhatsApp Blast

**Q: Can I send WhatsApp blasts to specific attendees?**
A: Yes, select specific recipients when composing the blast.

**Q: What if WhatsApp blast fails?**
A: Check the blast status, verify recipient phone numbers, contact administrator if issue persists.

**Q: Can I use WhatsApp blast templates?**
A: Yes, create and manage templates in the Templates section.

### Email Reminders

**Q: Can I send email reminders to specific attendees?**
A: Yes, select specific recipients when composing the email.

**Q: What if email reminder fails?**
A: Check the email status, verify recipient email addresses, contact administrator if issue persists.

**Q: Can I use email templates?**
A: Yes, create and manage templates in the Templates section.

### Google Drive

**Q: How do I upload documents to Google Drive?**
A: Open a meeting → "Google Drive" tab → "Upload Document" → select files.

**Q: Can I access Google Drive documents from the system?**
A: Yes, view and open documents from the Google Drive tab.

**Q: What are the Google Drive storage limits?**
A: Storage limits depend on your Google Drive plan.

### Aiman AI

**Q: What can Aiman AI do?**
A: Aiman AI can answer questions, provide summaries, and assist with system usage.

**Q: Can Aiman AI modify my data?**
A: No, Aiman AI cannot modify meeting data or send messages.

**Q: How accurate are Aiman AI responses?**
A: AI responses are for assistance only. Verify with actual data.

### Technical Issues

**Q: What if the system is slow?**
A: Check your internet connection. If the issue persists, contact the administrator.

**Q: What if I see an error message?**
A: Note the error message and contact the administrator with details.

**Q: Can I use the system offline?**
A: No, the system requires an internet connection to access the database.

## 12. Contact Support

### For Technical Support
- Email: support@dpmmjohor.org
- Phone: Contact DPMM Negeri Johor office

### For Account Issues
- Contact your system administrator
- Provide your user ID and issue description

## 13. Best Practices

### Meeting Management
- Create meetings with clear titles and descriptions
- Set meeting dates and times in advance
- Add all relevant attendees
- Send reminders before meetings

### Attendance Tracking
- Record attendance promptly after meetings
- Use accurate attendance statuses
- Update attendance if corrections are needed
- Generate attendance reports regularly

### Communication
- Use WhatsApp blasts for urgent notifications
- Use email reminders for formal notifications
- Use templates for consistent messaging
- Verify message delivery

### Document Management
- Upload meeting documents promptly
- Organize documents by type
- Use clear file names
- Maintain document permissions

## 14. Troubleshooting

### Login Issues
- **Problem**: Cannot login
- **Solution**: Check credentials, contact administrator if issue persists

### Meeting Display Issues
- **Problem**: Meeting list not loading
- **Solution**: Refresh the page, check internet connection

### WhatsApp Blast Issues
- **Problem**: WhatsApp blast not sending
- **Solution**: Check WAHA configuration, verify phone numbers, contact administrator

### Email Issues
- **Problem**: Email reminders not sending
- **Solution**: Check email configuration, verify email addresses, contact administrator

### Google Drive Issues
- **Problem**: Cannot upload documents
- **Solution**: Check Google Drive permissions, verify file size limits, contact administrator

### Performance Issues
- **Problem**: System is slow
- **Solution**: Clear browser cache, check internet connection

## Notes
- This user manual does not include screenshots (AI limitation)
- Screenshots should be added by human reviewers for better clarity
- Human validation required to ensure instructions are clear for non-technical users
