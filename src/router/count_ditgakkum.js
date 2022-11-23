const router = require("express").Router();
const { body } = require("express-validator");
const CountDitgakkum = require("../controller/count_ditgakkum");
const formValidation = require("../middleware/form_validation");
router.get('/daily', CountDitgakkum.get_daily);
router.get("/date", CountDitgakkum.get_by_date);
// router.get("/", CountDitgakkum.get);
// router.get("/count-month", CountDitgakkum.countByMonth);

module.exports = router;
