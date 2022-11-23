const router = require("express").Router();
const { body } = require("express-validator");
const DitkamselController = require("../controller/ditkamsel");
const formValidation = require("../middleware/form_validation");

router.get("/", DitkamselController.get);
router.post("/add", formValidation, DitkamselController.add);

module.exports = router;
