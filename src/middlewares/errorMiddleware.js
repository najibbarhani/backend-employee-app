// Menangani endpoint yang tidak ditemukan (404 Not Found)
exports.notFound = (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Rute ${req.originalUrl} dengan method ${req.method} tidak ditemukan pada server ini.`
  });
};

// Menangani seluruh server error tak terduga (Global Error Handler)
exports.errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Terjadi kesalahan internal pada server.',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};