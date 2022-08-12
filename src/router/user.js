const router = require("express").Router();
const { body, param } = require("express-validator");
const UserController = require("../controller/user");
const authMiddleware = require("../middleware/authentication");
router.get(
  "/logged-user",
  authMiddleware.jwtAuth,
  UserController.getLoggedUser
);
module.exports = router;
