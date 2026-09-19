const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Semua rute task mewajibkan token login
router.use(authenticate);

// Admin membuat tugas baru
router.post('/', authorize('ADMIN'), taskController.createTask);

// Pegawai melihat tugas miliknya sendiri
router.get('/my-tasks', taskController.getMyTasks);


// Update status tugas berdasarkan ID tugas
router.patch('/:id/status', taskController.updateTaskStatus);
// Pastikan baris ini ada:
router.delete('/:id', authorize('ADMIN'), taskController.deleteTask);
module.exports = router;
