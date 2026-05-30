const errorHandler = (err, req, res, next) => {
  console.error(`\n[ERROR] ${new Date().toISOString()}`);
  console.error(`Route: ${req.method} ${req.originalUrl}`);
  console.error(`Message: ${err.message}`);
  console.error(`Code: ${err.code}`);
  console.error(`Stack: ${err.stack}\n`);

  
  if (err.code === 'P2002') {
    return res.status(409).json({ success: false, message: 'A duplicate record already exists.' });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ success: false, message: 'Record not found.' });
  }
  if (err.code === 'P1001') {
    
    return res.status(503).json({
      success: false,
      message: 'Database connection failed. Please check your DATABASE_URL.',
    });
  }
  if (err.code === 'P1003') {
    return res.status(503).json({
      success: false,
      message: 'Database does not exist. Run: npx prisma migrate deploy',
    });
  }

  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, message: 'File too large. Max size is 10MB.' });
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ success: false, message: 'Unexpected file field name.' });
  }

 
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal Server Error'
    : (err.message || 'Internal Server Error');

  return res.status(statusCode).json({ success: false, message });
};

module.exports = errorHandler;