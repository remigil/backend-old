const router = require("express").Router();
const { body, param } = require("express-validator");
const UserController = require("../controller/user");
const authMiddleware = require("../middleware/authentication");
const form_validation = require("../middleware/form_validation");

router.get("/", UserController.get);
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
router.post(
  "/add",
  body("username").notEmpty().isLength({ min: 3 }),
  form_validation,
  UserController.add
);
router.put("/edit/:id", UserController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  form_validation,
  UserController.delete
);
module.exports = router;
