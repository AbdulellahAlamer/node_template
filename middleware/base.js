// Simple middleware factory
const createMiddleware = (fn, options = {}) => ({
  fn,
  enabled: options.enabled ?? true,
  priority: options.priority ?? 0
});

module.exports = createMiddleware;