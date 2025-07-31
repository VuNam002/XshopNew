const express = require("express");
const router = express.Router();

const controller = require("../controllers/blogControles");

router.get("/", controller.index);
router.get("/:slug", controller.detail);
router.post("/create", controller.create);
router.delete("/delete/:id", controller.delete);
router.patch("/edit/:id", controller.edit);
router.patch("/change-status/:status/:id", controller.changeStatus);
router.get("/detail/:id", controller.detail)

//Bài viết nổi bật
router.get("/featured", controller.featured);
module.exports = router;