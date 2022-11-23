const router = require("express").Router();
const { body } = require("express-validator");
const SocietyController = require("../controller/society");
const authMiddleware = require("../middleware/authentication");

const formValidation = require("../middleware/form_validation");
router.get(
  "/logged-user-mobile",
  authMiddleware.jwtAuth,
  SocietyController.getLoggedUserMobile
);
router.get("/", SocietyController.get);
router.get("/getid/:id", SocietyController.getId);
router.get("/getbysocietyid", SocietyController.getbySocietyId);
router.post(
  "/add",
  body("person_name").notEmpty().isLength({ min: 3 }),
  formValidation,
  SocietyController.add
);
router.put("/edit/:id", SocietyController.edit);
router.put("/editprofil/", SocietyController.editprofil);
router.put("/editStatus/:id", SocietyController.editStatus);
router.post("/scanktp", SocietyController.ScanKtp);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  SocietyController.delete
);
module.exports = router;
