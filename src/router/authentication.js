const Authentication = require("../controller/authentication");
const { body } = require("express-validator");
const router = require("express").Router();
const formValidation = require("../middleware/form_validation");
router.post(
  "/login",
  body("username").notEmpty().isLength({ min: 3 }),
  body("password").notEmpty().isLength({ min: 3 }),
  formValidation,
  Authentication.login
);
module.exports = router;
