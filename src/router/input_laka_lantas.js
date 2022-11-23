const router = require("express").Router();
const { body } = require("express-validator");
const InputLakaLantas = require("../controller/input_laka_lantas");
const formValidation = require("../middleware/form_validation");
router.get("/daily", InputLakaLantas.get_daily);
router.get("/monthly", InputLakaLantas.get_monthly);
router.post("/add", InputLakaLantas.add);
router.get("/date", InputLakaLantas.get_by_date);
// router.get("/", InputLakaLantas.get);
// router.get("/count-month", InputLakaLantas.countByMonth);
router.get("/grafik", InputLakaLantas.grafik_mobile);
router.get("/topPolda", InputLakaLantas.top_polda);

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
