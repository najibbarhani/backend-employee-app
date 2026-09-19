const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

// 1. Memeriksa validitas Token JWT
exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'fail',
        message: 'Akses ditolak. Token tidak ditemukan.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        nama_lengkap: true,
        email: true,
        role: true,
        jabatan: true
      }
    });

    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Pengguna pemilik token sudah tidak terdaftar.'
      });
    }

    req.user = user; // Data user ditempelkan ke objek request
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'fail',
      message: 'Token tidak valid atau sudah kedaluwarsa.'
    });
  }
};

// 2. Role-Based Access Control (RBAC)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'Akses terlarang. Anda tidak memiliki izin untuk fitur ini.'
      });
    }
    next();
  };
};