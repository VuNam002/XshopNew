const express = require("express");
const router = express.Router();

const controller = require("../controllers/cartControles");

router.get("/", controller.index);
router.post("/add/:productId",controller.addPost);
router.delete("/delete/:productId", controller.delete);
router.patch("/update/:productId", controller.update);


module.exports = router;