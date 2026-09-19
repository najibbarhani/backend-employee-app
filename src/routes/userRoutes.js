const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

// Endpoint melihat profil sendiri (Bisa diakses siapa pun yang membawa token valid)
router.get("/profile", authenticate, userController.getProfile);

// Kunci semua rute di bawah ini wajib login & wajib role ADMIN
router.use(authenticate, authorize("ADMIN"));

router.get("/", userController.getAllUsers);
router.post("/", userController.createUser);

module.exports = router;
