const router = require("express").Router();
const { body } = require("express-validator");
const CountDitkamsel = require("../controller/count_ditkamsel");
const formValidation = require("../middleware/form_validation");

router.get("/date", CountDitkamsel.get_by_date);
router.get("/daily", CountDitkamsel.get_daily);
// router.get("/", CountDitkamsel.get);
// router.get("/count-month", CountDitkamsel.countByMonth);

module.exports = router;
