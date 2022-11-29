const router = require("express").Router();
const { body } = require("express-validator");
const ExportLaphar = require("../controller/export_laphar");
const formValidation = require("../middleware/form_validation");
router.get("/export_laphar", ExportLaphar.export_laphar);
router.get("/export_laphar/v2", ExportLaphar.export_laphar_new);
router.get("/anev_gakkum", ExportLaphar.export_anev_ditgakkum);
router.get("/anev_ditkamsel", ExportLaphar.export_anev_ditkamsel);


module.exports = router;
