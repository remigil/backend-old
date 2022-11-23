const router = require("express").Router();
const { body } = require("express-validator");
const InputLakaLanggar = require("../controller/input_laka_langgar");
const formValidation = require("../middleware/form_validation");
router.get("/daily", InputLakaLanggar.get_daily);
router.get("/monthly", InputLakaLanggar.get_monthly);
router.get("/date", InputLakaLanggar.get_by_date);
router.post("/add", InputLakaLanggar.add);
// router.get("/", InputLakaLanggar.get);
// router.get("/count-month", InputLakaLanggar.countByMonth);

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
