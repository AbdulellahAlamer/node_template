const { validationResult } = require('express-validator');
const createMiddleware = require('./base');

// Simple validator factory
const createValidator = () => {
  const validator = (validations) => {
    return async (req, res, next) => {
      await Promise.all(validations.map(v => v.run(req)));
      const errors = validationResult(req);
      
      if (errors.isEmpty()) return next();
      
      res.status(400).json({ 
        error: 'Validation Error',
        details: errors.array() 
      });
    };
  };

  return createMiddleware(validator, { priority: 2 });
};

// Default validator
const validator = createValidator();

module.exports = { createValidator, validator }; 