import { z } from 'zod';

// Malaysian IC number validation (12 digits, format: YYMMDD-PB-###G)
const icNumberSchema = z.string()
  .regex(/^\d{6}-\d{2}-\d{4}$/, 'Invalid IC number format. Expected: YYMMDD-PB-####')
  .refine((val) => {
    const parts = val.split('-');
    const birthDate = parts[0];
    const birthPlace = parts[1];
    const serial = parts[2];
    
    // Validate birth date (basic check - not comprehensive)
    const year = parseInt(birthDate.substring(0, 2));
    const month = parseInt(birthDate.substring(2, 4));
    const day = parseInt(birthDate.substring(4, 6));
    
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    
    // Validate birth place code (01-59 for Malaysia states)
    const placeCode = parseInt(birthPlace);
    if (placeCode < 1 || placeCode > 59) return false;
    
    // Validate serial number
    if (serial.length !== 4) return false;
    
    return true;
  }, 'Invalid IC number');

// Malaysian phone number validation
const phoneSchema = z.string()
  .regex(/^(\+?6?01)[0-46-9]-[0-9]{7,8}$/, 'Invalid Malaysian phone number format')
  .or(z.string().regex(/^01[0-46-9][0-9]{7,8}$/, 'Invalid Malaysian phone number format'));

// Email validation with normalization
const emailSchema = z.string()
  .email('Invalid email address')
  .transform((val) => val.toLowerCase().trim());

// SSM registration number validation
const ssmNumberSchema = z.string()
  .regex(/^\d{8}-[A-Z]$/, 'Invalid SSM registration number format. Expected: #######-X')
  .or(z.string().regex(/^\d{12}$/, 'Invalid SSM registration number format. Expected: 12 digits'));

// Address validation
const addressSchema = z.object({
  street: z.string().min(5, 'Street address must be at least 5 characters').max(200),
  city: z.string().min(2, 'City must be at least 2 characters').max(100),
  state: z.string().min(2, 'State must be at least 2 characters').max(50),
  postcode: z.string().regex(/^\d{5}$/, 'Invalid postcode. Expected: 5 digits'),
  country: z.string().min(2, 'Country must be at least 2 characters').max(100)
});

// File upload validation
const fileUploadSchema = z.object({
  filename: z.string().min(1).max(255),
  mimetype: z.enum(['image/jpeg', 'image/png', 'image/gif', 'application/pdf'], {
    errorMap: () => ({ message: 'Invalid file type. Only JPEG, PNG, GIF, and PDF allowed' })
  }),
  size: z.number().max(5 * 1024 * 1024, 'File size exceeds 5MB limit')
});

// Main form validation schema
const borangFormSchema = z.object({
  // Personal Information
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Full name can only contain letters, spaces, hyphens, and apostrophes'),
  
  icNumber: icNumberSchema,
  
  email: emailSchema,
  
  phone: phoneSchema,
  
  // SSM Information
  ssmNumber: ssmNumberSchema.optional(),
  ssmRegisteredName: z.string().min(2).max(200).optional(),
  
  // Addresses
  residentialAddress: addressSchema,
  businessAddress: addressSchema.optional(),
  
  // File Uploads
  icCopy: fileUploadSchema.optional(),
  ssmCertificate: fileUploadSchema.optional(),
  businessLicense: fileUploadSchema.optional(),
  
  // Additional Information
  remarks: z.string().max(500).optional()
});

// Input normalization helper
function normalizeInput(data) {
  const normalized = { ...data };
  
  // Normalize email
  if (normalized.email) {
    normalized.email = normalized.email.toLowerCase().trim();
  }
  
  // Trim all string fields
  Object.keys(normalized).forEach(key => {
    if (typeof normalized[key] === 'string') {
      normalized[key] = normalized[key].trim();
    }
  });
  
  // Collapse multiple spaces
  Object.keys(normalized).forEach(key => {
    if (typeof normalized[key] === 'string') {
      normalized[key] = normalized[key].replace(/\s+/g, ' ');
    }
  });
  
  return normalized;
}

// Validation function with error handling
function validateFormData(data) {
  try {
    // Normalize input first
    const normalizedData = normalizeInput(data);
    
    // Validate against schema
    const validatedData = borangFormSchema.parse(normalizedData);
    
    return {
      success: true,
      data: validatedData,
      errors: null
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      return {
        success: false,
        data: null,
        errors: formattedErrors
      };
    }
    
    return {
      success: false,
      data: null,
      errors: [{ field: 'general', message: 'Validation failed' }]
    };
  }
}

// SQL injection prevention helper
function sanitizeForDatabase(value) {
  if (typeof value !== 'string') return value;
  
  // Remove potential SQL injection patterns
  return value
    .replace(/['"\\]/g, '') // Remove quotes and backslashes
    .replace(/--/g, '') // Remove SQL comments
    .replace(/;/g, '') // Remove semicolons
    .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE)\b/gi, ''); // Remove SQL keywords
}

export {
  borangFormSchema,
  validateFormData,
  normalizeInput,
  sanitizeForDatabase,
  icNumberSchema,
  phoneSchema,
  emailSchema,
  ssmNumberSchema,
  addressSchema,
  fileUploadSchema
};
