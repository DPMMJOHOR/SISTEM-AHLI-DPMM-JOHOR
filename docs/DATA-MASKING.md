# Data Masking

## Overview

Data masking is implemented to protect sensitive information while maintaining usability for administrative purposes. This follows the principle of data minimization - only display what is necessary for the task at hand.

## Purpose

- Protect sensitive personal information (PII)
- Maintain usability for administrative tasks
- Reduce risk of data exposure
- Comply with privacy best practices

## Masking Functions

### IC Number Masking

Masks MyKAD numbers to show only the last 4 digits.

```javascript
function maskIC(ic) {
  if (!ic || ic.length < 12) return ic || '—';
  return '******' + ic.slice(-4);
}
```

**Examples:**
- `123456-12-5678` → `******5678`
- `880101-12-3456` → `******3456`
- Short or invalid IC → Original value or `—`

### Phone Number Masking

Masks phone numbers to show only the last 4 digits.

```javascript
function maskPhone(phone) {
  if (!phone || phone.length < 8) return phone || '—';
  return '***-***' + phone.slice(-4);
}
```

**Examples:**
- `012-34567890` → `***-***7890`
- `+601234567890` → `***-***7890`
- Short or invalid phone → Original value or `—`

## Implementation

### Where Masking is Applied

Masking is applied in the admin panel's information display (`buildTabMaklumat` function in `index.html`):

- Proxy MyKAD number
- Proxy phone number
- Company phone number

### Unmasked Data

The following data remains unmasked:
- Company name
- Email addresses
- Business address
- Registration dates
- Payment amounts
- Status information

## Privacy Considerations

### Data Minimization Principle
- Only display what administrators need to perform their duties
- Mask sensitive identifiers that could be used for identity theft
- Keep unmasked data that is necessary for business operations

### Access Control
- Masked data is only shown to authenticated administrators
- Regular users cannot access the admin panel
- Audit logs track all access to sensitive data

### Data at Rest
- Original unmasked data remains in the database
- Masking is applied only at display time
- Database access is protected by RLS policies

## Best Practices

### When to Mask
- Personal identifiers (IC, phone numbers)
- Sensitive business information
- Any data that could be used for identity theft

### When Not to Mask
- Public business information
- Status indicators
- Reference numbers
- Payment amounts
- Contact information that is intentionally public

### Testing
- Verify masking works correctly for all formats
- Test edge cases (short numbers, invalid formats)
- Ensure unmasked data is still accessible when needed
- Check that masking doesn't break administrative workflows

## Future Enhancements

Potential improvements to data masking:

- Configurable masking levels (show more/less digits)
- Role-based masking (different levels for different admin roles)
- Time-based unmasking (temporary reveal with authentication)
- Audit logging of unmasking events
- Integration with privacy settings
