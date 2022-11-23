const router = require("express").Router();
const { body } = require("express-validator");
const InputSim = require("../controller/input_sim");
const formValidation = require("../middleware/form_validation");
router.post("/add", InputSim.add);
router.get("/daily", InputSim.get_daily);
router.get("/monthly", InputSim.get_monthly);
router.get("/date", InputSim.get_by_date);
// router.get("/", InputSim.get);

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
