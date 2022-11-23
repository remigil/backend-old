const router = require("express").Router();
const { body } = require("express-validator");
const InputBpkb = require("../controller/input_bpkb");
const formValidation = require("../middleware/form_validation");
router.get("/daily", InputBpkb.get_daily);
router.get("/monthly", InputBpkb.get_monthly);
router.get("/date", InputBpkb.get_by_date);
router.post("/add", InputBpkb.add);
// router.get("/", InputBpkb.get);
// router.get("/count-month", InputBpkb.countByMonth);

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
