const router = require("express").Router();
const { body } = require("express-validator");
const StackController = require("../controller/stackholder");
const formValidation = require("../middleware/form_validation");
router.get("/", StackController.get);

module.exports = router;
