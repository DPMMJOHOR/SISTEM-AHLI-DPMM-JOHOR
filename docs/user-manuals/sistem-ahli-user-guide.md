# Sistem Pengurusan Ahli - User Guide

## Overview
Sistem Pengurusan Ahli adalah sistem pengurusan ahli berasaskan web untuk Dewan Perniagaan Melayu Malaysia (DPMM) Negeri Johor. Sistem ini membolehkan pengurusan ahli, penjejakan yuran, dan pengurusan mengikut daerah.

## Table of Contents
1. Getting Started
2. User Roles and Permissions
3. Login
4. Dashboard
5. Member Management
6. Payment Tracking
7. District Management
8. Export Data
9. FAQ

## 1. Getting Started

### System Requirements
- Web browser (Chrome, Firefox, Safari, Edge)
- Stable internet connection
- Valid user credentials

### Access URL
- Production: `https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/`
- Development: Contact administrator for local development URL

## 2. User Roles and Permissions

### Admin
- **Full Access**: Can perform all operations
- **Member Management**: Add, edit, delete members
- **Payment Management**: Update payment status
- **District Management**: Manage district assignments
- **Export**: Export member data to CSV
- **User Management**: Manage user accounts

### Staff
- **Limited Access**: Can view and update member information
- **Member Management**: View and edit member details
- **Payment Management**: Update payment status (limited fields)
- **Export**: Export member data to CSV
- **No Delete Access**: Cannot delete members

### User
- **Read-Only Access**: Can only view member information
- **Member Management**: View member details only
- **No Edit Access**: Cannot modify member information
- **No Export Access**: Cannot export data

## 3. Login

### Step-by-Step Login Process

1. **Open the System**
   - Navigate to the system URL in your web browser
   - You will see the login screen with DPMM logo

2. **Enter Credentials**
   - **Email/Username**: Enter your registered email or user ID
   - **Password**: Enter your password
   - Click "LOG MASUK" (Login) button

3. **Successful Login**
   - If credentials are correct, you will be redirected to the dashboard
   - Your user name will appear in the sidebar
   - You can now access features based on your role

4. **Failed Login**
   - If credentials are incorrect, you will see an error message
   - Check your email and password
   - Contact administrator if you forgot your password

### Logout
1. Click the "LOG KELUAR" (Logout) button in the top-right corner
2. You will be redirected to the login screen
3. Your session will be terminated

## 4. Dashboard

### Dashboard Overview
The dashboard provides a summary of member information and key metrics.

### Dashboard Components
- **Total Members**: Total number of registered members
- **Active Members**: Number of active members
- **Pending Payments**: Number of members with pending payments
- **District Summary**: Member count by district
- **Recent Activity**: Recent member updates

### Navigation
- **Sidebar**: Main navigation menu
- **Search Bar**: Search for members
- **Export Button**: Export member data to CSV

## 5. Member Management

### View Member List
1. Click "Senarai Ahli" (Member List) in the sidebar
2. You will see a table of all members
3. Use search bar to find specific members
4. Use filters to filter by district, status, or payment status

### Add New Member
1. Click "Tambah Ahli" (Add Member) button
2. Fill in the member details:
   - **Name**: Full name of the member
   - **IC Number**: Malaysian IC number
   - **District**: Select district from dropdown
   - **Phone**: Contact phone number
   - **Email**: Email address
   - **Membership Date**: Date of membership registration
   - **Payment Status**: Select payment status
3. Click "Simpan" (Save) to add the member
4. The member will appear in the member list

### Edit Member
1. Click on the member you want to edit in the member list
2. Update the member information
3. Click "Simpan" (Save) to save changes
4. The member information will be updated

### Delete Member
1. Click on the member you want to delete in the member list
2. Click "Padam" (Delete) button
3. Confirm the deletion
4. The member will be removed from the system
5. **Note**: Only Admin users can delete members

### Search Members
1. Use the search bar at the top of the member list
2. Enter member name, IC number, or phone number
3. The list will filter to show matching members
4. Click on a member to view details

### Filter Members
1. Use the filter options above the member list
2. Filter by:
   - **District**: Select specific district
   - **Status**: Active/Inactive
   - **Payment Status**: Paid/Pending/Overdue
3. The list will update to show filtered results

## 6. Payment Tracking

### View Payment Status
1. Member list shows payment status for each member
2. Payment statuses:
   - **Paid**: Payment completed
   - **Pending**: Payment pending
   - **Overdue**: Payment overdue

### Update Payment Status
1. Click on the member in the member list
2. Update the payment status field
3. Select new status from dropdown
4. Click "Simpan" (Save) to save changes
5. Payment status will be updated

### Payment Date Tracking
- System tracks payment dates
- View payment history in member details
- Update payment dates as needed

## 7. District Management

### View Districts
1. Click "Pengurusan Daerah" (District Management) in the sidebar
2. You will see a list of all districts
3. View member count per district

### Assign Member to District
1. When adding or editing a member
2. Select district from dropdown
3. Click "Simpan" (Save) to save changes
4. Member will be assigned to selected district

### View District Summary
- Dashboard shows member count by district
- Filter members by district
- Export district-specific reports

## 8. Export Data

### Export to CSV
1. Click "Eksport CSV" button
2. The system will generate a CSV file
3. The file will download automatically
4. Open the CSV file in Excel or other spreadsheet software

### Export Options
- **All Members**: Export all member data
- **Filtered Results**: Export currently filtered results
- **District-Specific**: Export members from selected district

### CSV File Contents
- Member name
- IC number
- District
- Phone number
- Email
- Membership date
- Payment status
- Payment date

## 9. FAQ

### General Questions

**Q: What if I forget my password?**
A: Contact the system administrator to reset your password.

**Q: Can I access the system from mobile?**
A: Yes, the system is responsive and works on mobile devices.

**Q: What browsers are supported?**
A: Chrome, Firefox, Safari, and Edge are supported.

### Member Management

**Q: How do I add a new member?**
A: Click "Tambah Ahli" button, fill in the details, and click "Simpan".

**Q: Can I delete a member?**
A: Only Admin users can delete members. Staff and User roles cannot delete.

**Q: How do I search for a member?**
A: Use the search bar and enter name, IC number, or phone number.

### Payment Tracking

**Q: What payment statuses are available?**
A: Paid, Pending, and Overdue.

**Q: Can I update payment history?**
A: Yes, you can update payment status and payment dates in member details.

**Q: How do I track overdue payments?**
A: Filter members by "Overdue" payment status.

### Export

**Q: What format is the export file?**
A: The export file is in CSV format, compatible with Excel and other spreadsheet software.

**Q: Can I export filtered results?**
A: Yes, apply filters first, then click "Eksport CSV" to export filtered results.

**Q: Is there a limit on the number of members I can export?**
A: No, you can export all members at once.

### Technical Issues

**Q: What if the system is slow?**
A: Check your internet connection. If the issue persists, contact the administrator.

**Q: What if I see an error message?**
A: Note the error message and contact the administrator with details.

**Q: Can I use the system offline?**
A: No, the system requires an internet connection to access the database.

## 10. Contact Support

### For Technical Support
- Email: support@dpmmjohor.org
- Phone: Contact DPMM Negeri Johor office

### For Account Issues
- Contact your system administrator
- Provide your user ID and issue description

## 11. Best Practices

### Data Entry
- Always verify IC numbers before entry
- Use consistent formatting for phone numbers
- Select correct district for each member
- Update payment status promptly

### Security
- Log out after each session
- Do not share your password
- Use strong passwords
- Report suspicious activity immediately

### Data Quality
- Regularly review member data for accuracy
- Update member information when changes occur
- Export backup copies regularly

## 12. Troubleshooting

### Login Issues
- **Problem**: Cannot login
- **Solution**: Check credentials, contact administrator if issue persists

### Data Display Issues
- **Problem**: Member list not loading
- **Solution**: Refresh the page, check internet connection

### Export Issues
- **Problem**: CSV file not downloading
- **Solution**: Check browser settings, try different browser

### Performance Issues
- **Problem**: System is slow
- **Solution**: Clear browser cache, check internet connection

## Notes
- This user manual does not include screenshots (AI limitation)
- Screenshots should be added by human reviewers for better clarity
- Human validation required to ensure instructions are clear for non-technical users
