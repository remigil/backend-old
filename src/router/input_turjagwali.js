const router = require("express").Router();
const { body } = require("express-validator");
const InputTurjagwali = require("../controller/input_turjagwali");
const formValidation = require("../middleware/form_validation");
router.post("/add", InputTurjagwali.add);
router.get("/", InputTurjagwali.get);
router.get("/grafik", InputTurjagwali.grafik_mobile);
router.get("/topPolda", InputTurjagwali.top_polda);
router.get("/daily", InputTurjagwali.get_daily);
router.get("/monthly", InputTurjagwali.get_monthly);
router.get("/date", InputTurjagwali.get_by_date);

// router.get("/count-month", InputTurjagwali.countByMonth);
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
