// Middleware factory that validates req.body against a Zod schema
// Usage: router.post('/route', validate(mySchema), controller)

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const messages = result.error.errors.map((e) => e.message).join(', ');
    return res.status(400).json({
      success: false,
      message: `Validation error: ${messages}`,
    });
  }

  // Replace req.body with parsed + sanitized data
  req.body = result.data;
  next();
};
