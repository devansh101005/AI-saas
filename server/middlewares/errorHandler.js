// Global error handling middleware
// This catches any error thrown in route handlers or other middleware
// and sends a consistent, safe error response

export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // distinguishes expected errors from bugs
  }
}

export const errorHandler = (err, req, res, next) => {
  // If headers already sent, delegate to Express default handler
  if (res.headersSent) {
    return next(err);
  }

  // Known operational errors (we threw them intentionally)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    const messages = err.errors.map((e) => e.message).join(', ');
    return res.status(400).json({
      success: false,
      message: `Validation error: ${messages}`,
    });
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'File too large. Maximum allowed size is 5MB.',
    });
  }

  // Log the full error for debugging (server-side only, not sent to client)
  console.error('Unhandled error:', err);

  // Send a generic message to the client — never leak internal details
  res.status(500).json({
    success: false,
    message: 'Something went wrong. Please try again later.',
  });
};
