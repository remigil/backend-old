const router = require("express").Router();
const { body } = require("express-validator");
const AccountController = require("../controller/account");
const form_validation = require("../middleware/form_validation");

router.post("/import", form_validation, AccountController.importExcell);
router.get("/export", AccountController.export);

module.exports = router;
