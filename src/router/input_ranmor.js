const router = require("express").Router();
const { body } = require("express-validator");
const InputRanmor = require("../controller/input_ranmor");
const formValidation = require("../middleware/form_validation");
router.get("/daily", InputRanmor.get_daily);
router.get("/monthly", InputRanmor.get_monthly);
router.post("/add", InputRanmor.add);
router.get("/date", InputRanmor.get_by_date);
// router.get("/", InputRanmor.get);
// router.get("/count-month", InputRanmor.countByMonth);

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
