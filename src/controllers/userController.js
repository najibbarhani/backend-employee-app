const prisma = require("../config/prisma");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

// Mendapatkan profil user yang sedang login
exports.getProfile = async (req, res) => {
  res.status(200).json({
    status: "success",
    data: req.user,
  });
};

// Mendapatkan semua daftar pegawai (Khusus Admin)
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await prisma.user.findMany({
      select: {
        id: true,
        nama_lengkap: true,
        email: true,
        role: true,
        jabatan: true,
        createdAt: true,
      },
    });

    res.status(200).json({
      status: "success",
      total: employees.length,
      data: employees,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
// 1. Ambil semua data user (hanya ID, nama, email, role, dan jabatan)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        nama_lengkap: true,
        email: true,
        role: true,
        jabatan: true,
        createdAt: true,
      },
      orderBy: { id: "asc" },
    });

    res.status(200).json({
      status: "success",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};
// 2. Admin membuat user/pegawai baru
exports.createUser = async (req, res, next) => {
  try {
    const { id, nama, email, password, role, jabatan } = req.body;

    // Validasi input
    if (!id || !nama || !email || !password) {
      return res.status(400).json({ message: "ID, Nama, Email, dan Password wajib diisi!" });
    }

    // Cek duplikasi ID atau Email
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ id: id }, { email: email }],
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: "ID Pegawai atau Email sudah terdaftar!" });
    }

    // Hash password sebelum disimpan
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        id,
        nama_lengkap: nama,
        email,
        password_hash: hashedPassword,
        role: role || "EMPLOYEE",
        jabatan: jabatan || "Staff",
      },
      select: {
        id: true,
        nama_lengkap: true,
        email: true,
        role: true,
        jabatan: true,
      },
    });

    res.status(201).json({
      status: "success",
      data: newUser,
    });
  } catch (error) {
    next(error);
  }
};
