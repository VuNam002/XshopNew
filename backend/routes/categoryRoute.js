const express = require("express");
const router = express.Router();

const controller = require('../controllers/categoryControles');
const authToken = require('../middleware/authToken');
const checkRole = require('../middleware/checkRole');

// Routes không cần auth
router.get("/",controller.index); // Bảo vệ route lấy danh sách
router.get("/detail/:id", controller.detail);

// Routes cần auth - đặt các route cụ thể TRƯỚC route có params
router.patch("/change-status/:status/:id", controller.changeStatus);
router.post("/create", controller.create);
router.patch("/edit/:id", controller.edit);
router.delete("/delete/:id", controller.delete);

module.exports = router;