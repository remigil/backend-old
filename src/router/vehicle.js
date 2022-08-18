const router = require("express").Router();
const { body, param } = require("express-validator");
const UserController = require("../controller/user");
const authMiddleware = require("../middleware/authentication");
const form_validation = require("../middleware/form_validation");
router.get(
  "/get",
  // authMiddleware.jwtAuth,
  UserController.getLoggedUser
);
router.post(
  "/add",
  authMiddleware.jwtAuth, 
  form_validation, 
  UserController.add
);
module.exports = router;
