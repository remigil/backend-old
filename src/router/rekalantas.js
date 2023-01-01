const router = require("express").Router();
const { body } = require("express-validator");
const Rekalantas = require("../controller/rekalantas");
const formValidation = require("../middleware/form_validation");
router.get("/daily", Rekalantas.get_daily);
router.get("/monthly", Rekalantas.get_monthly);
router.get("/date", Rekalantas.get_by_date);

// router.get("/", InputPenyebaran.get);
// router.get("/count-month", InputPenyebaran.countByMonth);

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
