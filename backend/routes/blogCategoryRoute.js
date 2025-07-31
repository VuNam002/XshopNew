const express = require("express");
const router = express.Router();

const controller = require("../controllers/blogCategoryControles");

router.get("/", controller.index)
router.post("/create", controller.create)
router.patch("/edit/:id", controller.edit)
router.delete("/delete/:id", controller.delete)
router.patch("/change-status/:status/:id", controller.changeStatus)
router.get("/detail/:id", controller.detail)


module.exports = router;