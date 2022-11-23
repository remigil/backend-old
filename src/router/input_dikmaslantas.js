const router = require("express").Router();
const { body } = require("express-validator");
const InputDikmaslantas = require("../controller/input_dikmaslantas");
const formValidation = require("../middleware/form_validation");
router.get("/daily", InputDikmaslantas.get_daily);
router.get("/monthly", InputDikmaslantas.get_monthly);
router.get("/date", InputDikmaslantas.get_by_date);
router.post("/add", InputDikmaslantas.add);
// router.get("/", InputDikmaslantas.get);
// router.get("/count-month", InputDikmaslantas.countByMonth);

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
