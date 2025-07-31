const express = require("express");
const router = express.Router();

const controller = require("../controllers/productControles");
const authToken = require("../middleware/authToken");
const checkRole = require("../middleware/checkRole");

router.get("/",  controller.index); 


router.get("/search", controller.search); 
router.get("/new", controller.new); 
router.get("/detail/:id", controller.detail); 
router.get("/featured", controller.featured);


router.post("/create",  controller.create); 
router.patch("/update/:id",  controller.update); 
router.delete("/delete/:id",  controller.delete); 
router.patch("/change-status/:status/:id",  controller.changeStatus); 

module.exports = router;