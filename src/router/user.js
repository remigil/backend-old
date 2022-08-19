const router = require("express").Router();
const { body, param } = require("express-validator");
const UserController = require("../controller/user");
const authMiddleware = require("../middleware/authentication");
const form_validation = require("../middleware/form_validation");
router.get(
  "/logged-user",
  authMiddleware.jwtAuth,
  UserController.getLoggedUser
);
router.get(
  "/logged-user-mobile",
  authMiddleware.jwtAuth,
  UserController.getLoggedUserMobile
);
router.post("/add", form_validation, UserController.add);
module.exports = router;
