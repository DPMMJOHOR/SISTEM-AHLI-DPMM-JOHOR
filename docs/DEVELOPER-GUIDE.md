# Developer Guide

## Development Setup

### Prerequisites
- Node.js (for local development)
- Git
- Supabase account
- GitHub account

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/DPMMJOHOR/SISTEM-AHLI-DPMM-JOHOR.git
   cd SISTEM-AHLI-DPMM-JOHOR
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Supabase**
   - Copy `src/config-loader.js.example` to `src/config-loader.js`
   - Add your Supabase URL and anon key
   - Never commit service role keys

4. **Start local server**
   ```bash
   npx serve
   ```
   Or use any static file server

## Code Structure

### Main Files

- `index.html` - Main admin dashboard application
- `borang.html` - Membership application form
- `receipt-pv-ui.js` - Receipt and voucher UI components

### Source Files

- `src/config-loader.js` - Supabase configuration
- `src/audit-logger.js` - Audit logging system
- `src/sentry-ai-wrapper.js` - AI integration with Sentry
- `src/modules/unified-auth.js` - Authentication system

### Documentation

- `docs/` - Project documentation
- `docs/plans/` - Implementation plans
- `docs/AIMAN-GUIDE.md` - AIMAN user guide
- `docs/SECURITY-FIXES.md` - Security documentation
- `docs/EMAIL-RETRY.md` - Email retry feature
- `docs/DATA-MASKING.md` - Data masking implementation

## Adding New Features

### Feature Development Process

1. **Create a feature branch**
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Implement the feature**
   - Follow existing code patterns
   - Maintain consistent styling
   - Add appropriate error handling

3. **Test thoroughly**
   - Test in multiple browsers
   - Verify edge cases
   - Check for regressions

4. **Create documentation**
   - Update relevant docs files
   - Add usage examples if needed

5. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: description"
   git push -u origin feat/your-feature-name
   ```

6. **Create pull request**
   - Use GitHub interface or CLI
   - Include clear description
   - Reference any related issues

## Code Patterns

### JavaScript Conventions

- Use camelCase for variables and functions
- Use PascalCase for constructors
- Add JSDoc comments for functions
- Handle errors with try-catch blocks

### CSS Conventions

- Use CSS variables for theming
- Follow spacing system (8px, 16px, 24px, 32px)
- Use semantic class names
- Maintain responsive design

### Database Conventions

- Table names are inconsistent (check existing schema)
- Use prepared statements for queries
- Implement RLS policies for security
- Log all database operations

## Testing Guidelines

### Manual Testing

1. **Test user flows**
   - Membership application process
   - Admin dashboard operations
   - Email functionality
   - PDF generation

2. **Test edge cases**
   - Invalid inputs
   - Network failures
   - Missing data
   - Error conditions

3. **Test security**
   - Authentication flows
   - Authorization checks
   - Data access controls
   - Input validation

### Browser Testing

Test in:
- Chrome (primary)
- Firefox
- Edge
- Safari (if available)

## Security Best Practices

### Key Management
- Never commit service role keys
- Use environment variables for secrets
- Rotate keys regularly
- Use anon keys for public features

### Input Validation
- Validate all user inputs
- Sanitize data before database operations
- Implement rate limiting
- Use parameterized queries

### Access Control
- Implement RLS policies in Supabase
- Check user permissions
- Log all access attempts
- Use secure authentication

## Common Tasks

### Adding a New Database Table

1. Create migration file in `migrations/`
2. Write SQL DDL statements
3. Apply migration via Supabase dashboard
4. Update TypeScript types if needed
5. Test with sample data

### Adding a New API Endpoint

1. Create endpoint handler
2. Implement authentication check
3. Add input validation
4. Implement error handling
5. Add logging
6. Test with various inputs

### Updating AIMAN Persona

1. Locate `buildSystemPrompt()` in `borang.html`
2. Update persona description
3. Modify communication style
4. Test responses
5. Update documentation

## Troubleshooting

### Common Issues

**Supabase connection errors:**
- Check network connectivity
- Verify URL and key configuration
- Check RLS policies
- Review browser console for errors

**Email not sending:**
- Verify EmailJS configuration
- Check email templates
- Review API logs
- Test with simple email first

**PDF generation failures:**
- Check template file exists
- Verify pdf-lib library loads
- Test with simple data first
- Check browser console for errors

### Debugging

1. **Browser Console**
   - Check for JavaScript errors
   - Review network requests
   - Monitor console logs

2. **Supabase Logs**
   - Check database logs
   - Review query performance
   - Monitor RLS policy violations

3. **Application Logs**
   - Review audit logs
   - Check error messages
   - Monitor performance metrics

## Deployment

### GitHub Pages Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to GitHub Pages**
   - Push to main branch
   - GitHub Pages auto-deploys
   - Wait for deployment to complete

3. **Verify deployment**
   - Check live URL
   - Test critical features
   - Monitor for errors

### Environment Variables

Set in GitHub Pages settings or deployment script:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `GROQ_KEY` (if using AIMAN)
- Email service credentials

## Resources

### Documentation
- [Supabase Documentation](https://supabase.com/docs)
- [GitHub Pages Documentation](https://docs.github.com/pages)
- [EmailJS Documentation](https://www.emailjs.com/docs/)

### Internal Documentation
- AIMAN Guide: `docs/AIMAN-GUIDE.md`
- Security Fixes: `docs/SECURITY-FIXES.md`
- Email Retry: `docs/EMAIL-RETRY.md`
- Data Masking: `docs/DATA-MASKING.md`

### Support
- Check existing issues on GitHub
- Review implementation plans in `docs/plans/`
- Contact team members for assistance
