const router = require("express").Router();
const { body } = require("express-validator");
const TroublespotController = require("../controller/troublespot");
const formValidation = require("../middleware/form_validation");
router.get("/", TroublespotController.get);
router.get("/getid/:id", TroublespotController.getId);
router.post(
  "/add",
  // body("no_ts").notEmpty().isLength({ min: 3 }),
  formValidation,
  TroublespotController.add
);
router.put("/edit/:id", TroublespotController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  TroublespotController.delete
);
router.delete(
  "/hardDelete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  TroublespotController.hardDelete
);

router.get("/daily", TroublespotController.get_daily);
router.get("/date", TroublespotController.get_by_date);
router.get("/get_filter", TroublespotController.get_filter);

module.exports = router;
