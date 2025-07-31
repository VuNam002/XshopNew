const express = require("express");
const router = express.Router()

const controller = require("../controllers/invoiceControles");
const authToken = require('../middleware/authToken');
const checkRole = require('../middleware/checkRole');

router.get("/", controller.index); 
router.post("/create",controller.create); 
router.patch("/edit/:id", controller.edit); 
router.delete("/delete/:id", controller.delete); 



module.exports = router;
