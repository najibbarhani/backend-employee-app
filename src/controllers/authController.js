const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. Logika Register (Pendaftaran Akun)
exports.register = async (req, res) => {
  try {
    const { id, nama_lengkap, email, password, role, jabatan } = req.body;

    // Validasi input wajib
    if (!id || !nama_lengkap || !email || !password || !jabatan) {
      return res.status(400).json({
        status: 'fail',
        message: 'Semua field (id, nama_lengkap, email, password, jabatan) wajib diisi!'
      });
    }

    // Cek apakah User ID atau Email sudah terdaftar
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ id: id }, { email: email }]
      }
    });

    if (existingUser) {
      return res.status(409).json({
        status: 'fail',
        message: 'User ID atau Email sudah digunakan.'
      });
    }

    // Enkripsi password menggunakan bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Simpan ke database via Prisma
    const newUser = await prisma.user.create({
      data: {
        id,
        nama_lengkap,
        email,
        password_hash: hashedPassword,
        role: role || 'EMPLOYEE',
        jabatan
      },
      select: {
        id: true,
        nama_lengkap: true,
        email: true,
        role: true,
        jabatan: true,
        createdAt: true
      }
    });

    res.status(201).json({
      status: 'success',
      message: 'Registrasi berhasil!',
      data: newUser
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// 2. Logika Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email dan password wajib diisi!'
      });
    }

    // Cari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Email atau password salah.'
      });
    }

    // Periksa kesesuaian password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'fail',
        message: 'Email atau password salah.'
      });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' } // Token berlaku 1 hari
    );

    res.status(200).json({
      status: 'success',
      message: 'Login berhasil!',
      token,
      user: {
        id: user.id,
        nama_lengkap: user.nama_lengkap,
        email: user.email,
        role: user.role,
        jabatan: user.jabatan
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};