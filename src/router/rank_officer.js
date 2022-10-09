const router = require("express").Router();
const { body } = require("express-validator");
const RankOfficerController = require("../controller/rank_officer");
const formValidation = require("../middleware/form_validation");
router.get("/", RankOfficerController.get);
router.get("/getId/:id", RankOfficerController.getId);
router.post(
  "/add",
  body("name_rankOfficer").notEmpty().isLength({ min: 3 }),
  formValidation,
  RankOfficerController.add
);
router.put("/edit/:id", RankOfficerController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  RankOfficerController.delete
);

module.exports = router;
