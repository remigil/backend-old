const router = require("express").Router();
const { body } = require("express-validator");
const SamsatController = require("../controller/samsat");
const formValidation = require("../middleware/form_validation");
router.get("/", SamsatController.get);
router.get("/getId/:id", SamsatController.getId);
router.post(
  "/add",
  body("name_samsat").notEmpty().isLength({ min: 3 }),
  formValidation,
  SamsatController.add
);
router.put("/edit/:id", SamsatController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  SamsatController.delete
);
router.delete(
  "/hardDelete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  SamsatController.hardDelete
);

router.get("/getPolda/:id", SamsatController.get_by_polda);

module.exports = router;
