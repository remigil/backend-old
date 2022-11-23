const router = require("express").Router();
const { body } = require("express-validator");
const InputStnk = require("../controller/input_stnk");
const formValidation = require("../middleware/form_validation");
router.post("/add", InputStnk.add);
router.get("/", InputStnk.get);
// router.get("/count-month", InputStnk.countByMonth);
router.get("/daily", InputStnk.get_daily);
router.get("/monthly", InputStnk.get_monthly);
router.get("/date", InputStnk.get_by_date);

// router.get("/", NewsController.get);
// router.get("/getId/:id", NewsController.getId);
// router.post(
//   "/add",
//   body("title").notEmpty().isLength({ min: 3 }),
//   formValidation,
//   NewsController.add
// );
// router.post("/import", formValidation, NewsController.importExcell);
// router.put("/edit/:id", NewsController.edit);
// router.delete(
//   "/delete",
//   body("id").notEmpty().isLength({ min: 1 }),
//   formValidation,
//   NewsController.delete
// );

module.exports = router;
