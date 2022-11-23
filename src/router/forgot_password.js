const ForgotPassword = require("../controller/forgot_password");
const { body } = require("express-validator");
const router = require("express").Router();
const formValidation = require("../middleware/form_validation");
const authMiddleware = require("../middleware/authentication");

router.post("/sendtoken", ForgotPassword.forgotPassword);
router.post("/resend_token_password", ForgotPassword.resendTokenPassword);
router.post("/validate_token_password", ForgotPassword.ValidateForgotPassword);
router.put("/change_password", ForgotPassword.ChangePassword);
module.exports = router;
