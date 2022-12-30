const router = require("express").Router();
const { body } = require("express-validator");
const ExportLaphar = require("../controller/export_laphar");
const formValidation = require("../middleware/form_validation");
router.get("/export_laphar", ExportLaphar.export_laphar);
router.get("/export_laphar/v2", ExportLaphar.export_laphar_new);
router.get("/anev_gakkum", ExportLaphar.export_anev_ditgakkum);
router.get("/anev_ditkamsel", ExportLaphar.export_anev_ditkamsel);

router.get("/list_laporan_harian", ExportLaphar.get);

router.get("/laka", ExportLaphar.export_laka);
router.get("/langgar", ExportLaphar.export_langgar);
router.get("/turjagwali", ExportLaphar.export_turjagwali);
router.get("/ranmor", ExportLaphar.export_ranmor);
router.get("/sim", ExportLaphar.export_sim);





module.exports = router;
