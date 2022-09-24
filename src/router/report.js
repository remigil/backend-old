const router = require("express").Router();
const { body } = require("express-validator");
const ReportController = require("../controller/report");
const formValidation = require("../middleware/form_validation");
router.get("/", ReportController.get);
router.get("/getLaporanById/:id", ReportController.getLaporanById);
router.get("/laporanToday", ReportController.laporanToday);
router.get("/riwayat", ReportController.riwayat);
router.post("/add", formValidation, ReportController.add);
router.put("/edit/:id", ReportController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  ReportController.delete
);

module.exports = router;
