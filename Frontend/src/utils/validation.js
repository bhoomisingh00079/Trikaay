/**
 * Form Validation Utilities
 * Reusable validation functions for forms across the application
 */

export const ValidationRules = {
  // Email validation (RFC 5322 simplified)
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) return { isValid: false, message: 'Email is required' };
    if (!emailRegex.test(value)) return { isValid: false, message: 'Invalid email format' };
    if (value.length > 254) return { isValid: false, message: 'Email is too long' };
    return { isValid: true };
  },

  // Name validation (2-100 characters)
  name: (value) => {
    if (!value) return { isValid: false, message: 'Name is required' };
    if (value.trim().length < 2) return { isValid: false, message: 'Name must be at least 2 characters' };
    if (value.length > 100) return { isValid: false, message: 'Name must be less than 100 characters' };
    // Check for valid characters (letters, spaces, hyphens, apostrophes)
    if (!/^[a-zA-Z\s\-']+$/.test(value)) {
      return { isValid: false, message: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
    }
    return { isValid: true };
  },

  // Text/Message validation (5-5000 characters)
  message: (value) => {
    if (!value) return { isValid: false, message: 'Message is required' };
    if (value.trim().length < 5) return { isValid: false, message: 'Message must be at least 5 characters' };
    if (value.length > 5000) return { isValid: false, message: 'Message must be less than 5000 characters' };
    return { isValid: true };
  },

  // Phone validation (10-15 digits)
  phone: (value) => {
    if (!value) return { isValid: false, message: 'Phone number is required' };
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(value)) {
      return { isValid: false, message: 'Invalid phone number format' };
    }
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      return { isValid: false, message: 'Phone number must be 10-15 digits' };
    }
    return { isValid: true };
  },

  // URL validation
  url: (value) => {
    if (!value) return { isValid: false, message: 'URL is required' };
    try {
      new URL(value);
      return { isValid: true };
    } catch {
      return { isValid: false, message: 'Invalid URL format' };
    }
  },

  // Password validation (min 8 chars, 1 uppercase, 1 number, 1 special char)
  password: (value) => {
    if (!value) return { isValid: false, message: 'Password is required' };
    if (value.length < 8) return { isValid: false, message: 'Password must be at least 8 characters' };
    if (!/[A-Z]/.test(value)) return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    if (!/[0-9]/.test(value)) return { isValid: false, message: 'Password must contain at least one number' };
    if (!/[!@#$%^&*]/.test(value)) {
      return { isValid: false, message: 'Password must contain at least one special character (!@#$%^&*)' };
    }
    return { isValid: true };
  },

  // Number validation
  number: (value, min = null, max = null) => {
    if (!value) return { isValid: false, message: 'Number is required' };
    const num = Number(value);
    if (isNaN(num)) return { isValid: false, message: 'Must be a valid number' };
    if (min !== null && num < min) {
      return { isValid: false, message: `Must be at least ${min}` };
    }
    if (max !== null && num > max) {
      return { isValid: false, message: `Must be at most ${max}` };
    }
    return { isValid: true };
  },

  // Checkbox validation (must be checked)
  required: (value) => {
    if (!value) return { isValid: false, message: 'This field is required' };
    return { isValid: true };
  },
};

/**
 * Sanitize user input to prevent XSS
 * @param {string} input - User input
 * @returns {string} - Sanitized string
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .substring(0, 5000); // Limit length
}

/**
 * Validate entire form object
 * @param {Object} formData - Form data object
 * @param {Object} rules - Rules object { fieldName: validationType }
 * @returns {Object} - { isValid: boolean, errors: { fieldName: errorMessage } }
 */
export function validateForm(formData, rules) {
  const errors = {};
  let isValid = true;

  Object.keys(rules).forEach((fieldName) => {
    const rule = rules[fieldName];
    const value = formData[fieldName];

    let validation;
    if (typeof rule === 'string') {
      // Rule is a validation type name
      validation = ValidationRules[rule]?.(value);
    } else if (typeof rule === 'function') {
      // Rule is a custom validation function
      validation = rule(value);
    } else {
      return;
    }

    if (validation && !validation.isValid) {
      errors[fieldName] = validation.message;
      isValid = false;
    }
  });

  return { isValid, errors };
}

/**
 * Format error message for display
 * @param {Object} errors - Errors object { fieldName: errorMessage }
 * @returns {string} - Formatted error message
 */
export function formatErrorMessage(errors) {
  const errorList = Object.values(errors).filter(Boolean);
  if (errorList.length === 0) return '';
  if (errorList.length === 1) return errorList[0];
  return `There are ${errorList.length} errors:\n${errorList.map((e, i) => `${i + 1}. ${e}`).join('\n')}`;
}
