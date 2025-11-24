// Global error handler middleware
// Keeps existing comments in other files untouched

export function errorHandler(err, req, res, next) {
  // Basic error shape
  let status = err.statusCode || err.status || 500;
  let message = err.message || 'An unexpected error occurred';

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Invalid or expired token';
  }

  // Mongoose validation / cast errors
  if (err.name === 'ValidationError') {
    status = 400;
  }

  if (err.name === 'CastError') {
    status = 400;
  }

  // Axios / LemonSqueezy errors
  if (err.isAxiosError) {
    status = err.response?.status || 500;
    message = err.response?.data || err.message || 'LemonSqueezy request failed';
  }

  return res.status(status).json({
    success: false,
    message
  });
}
