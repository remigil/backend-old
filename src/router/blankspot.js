const router = require("express").Router();
const { body } = require("express-validator");
const BlankspotController = require("../controller/blankspot");
const formValidation = require("../middleware/form_validation");
router.get("/", BlankspotController.get);
router.get("/getid/:id", BlankspotController.getId);
router.post(
  "/add",
  // body("no_ts").notEmpty().isLength({ min: 3 }),
  formValidation,
  BlankspotController.add
);
router.put("/edit/:id", BlankspotController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  BlankspotController.delete
);
router.delete(
  "/hardDelete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  BlankspotController.hardDelete
);

module.exports = router;
