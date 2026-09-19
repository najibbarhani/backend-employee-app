const prisma = require('../config/prisma');

// 1. Membuat Tugas Baru (Hanya Admin yang bisa memberikan tugas ke pegawai)
exports.createTask = async (req, res) => {
  try {
    const { id, judul_tugas, deskripsi, deadline, userId } = req.body;

    if (!id || !judul_tugas || !userId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Field id, judul_tugas, dan userId wajib diisi.'
      });
    }

    // Pastikan user penerima tugas benar-benar ada di database
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!targetUser) {
      return res.status(404).json({
        status: 'fail',
        message: 'Pegawai penerima tugas tidak ditemukan.'
      });
    }

    const newTask = await prisma.task.create({
      data: {
        id,
        judul_tugas,
        deskripsi,
        deadline: deadline ? new Date(deadline) : null,
        userId
      }
    });

    res.status(201).json({
      status: 'success',
      message: 'Tugas berhasil dibuat!',
      data: newTask
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 2. Melihat Tugas Saya (Untuk Pegawai yang sedang login)
exports.getMyTasks = async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.user.id }
    });

    res.status(200).json({
      status: 'success',
      total: tasks.length,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 3. Update Status Tugas (PENDING / IN_PROGRESS / DONE)
exports.updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Cari tugas terlebih dahulu
    const task = await prisma.task.findUnique({
      where: { id }
    });

    if (!task) {
      return res.status(404).json({
        status: 'fail',
        message: 'Tugas tidak ditemukan.'
      });
    }

    // Pegawai hanya bisa update tugas miliknya sendiri (Admin bisa update semua)
    if (req.user.role !== 'ADMIN' && task.userId !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'Anda tidak memiliki hak akses untuk tugas ini.'
      });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { status }
    });

    res.status(200).json({
      status: 'success',
      message: 'Status tugas berhasil diperbarui!',
      data: updatedTask
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
exports.deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Cek apakah data tugas ada di database
    const task = await prisma.task.findUnique({
      where: { id: id },
    });

    if (!task) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan' });
    }

    // Eksekusi hapus di database MySQL lewat Prisma
    await prisma.task.delete({
      where: { id: id },
    });

    res.status(200).json({
      status: 'success',
      message: `Tugas dengan ID ${id} berhasil dihapus`,
    });
  } catch (error) {
    next(error);
  }
};