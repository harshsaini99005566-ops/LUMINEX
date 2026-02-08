const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const validators = {
  email: (email) => {
    if (!email || typeof email !== 'string') return false;
    return emailRegex.test(email.trim().toLowerCase());
  },

  password: (password) => {
    if (!password || typeof password !== 'string') return false;
    return password.length >= 8;
  },

  strongPassword: (password) => {
    if (!password || typeof password !== 'string') return false;
    return passwordRegex.test(password);
  },

  required: (value) => {
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return value !== null && value !== undefined;
  },

  minLength: (value, min) => {
    if (typeof value === 'string') {
      return value.trim().length >= min;
    }
    if (Array.isArray(value)) {
      return value.length >= min;
    }
    return false;
  },

  maxLength: (value, max) => {
    if (typeof value === 'string') {
      return value.trim().length <= max;
    }
    if (Array.isArray(value)) {
      return value.length <= max;
    }
    return false;
  },

  isNumber: (value) => {
    return !isNaN(value) && typeof value === 'number';
  },

  isArray: (value) => {
    return Array.isArray(value);
  },

  isObject: (value) => {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  },

  isBoolean: (value) => {
    return typeof value === 'boolean';
  },

  isEnum: (value, enumValues) => {
    return enumValues.includes(value);
  },

  url: (url) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  },
};

module.exports = validators;
