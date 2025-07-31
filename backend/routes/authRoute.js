const express = require("express");
const router = express.Router();

const controller = require("../controllers/authControles");
const authToken = require("../middleware/authToken");
const checkRole = require("../middleware/checkRole");


router.get("/",  controller.index);
router.post("/register",  controller.register); 
router.delete("/delete/:id",  controller.delete);
router.patch("/change-status/:status/:id",controller.changeStatus);
router.patch("/change-role/:id",  controller.changeRole);
router.get("/detail/:id", controller.detail);

// --- Các route công khai hoặc cho user đã đăng nhập ---
router.post("/login", controller.login); 
router.get("/me", controller.getMe); 
router.patch("/edit/:id", controller.edit); 

module.exports = router;