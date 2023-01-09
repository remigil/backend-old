const router = require("express").Router();
const { body } = require("express-validator");
const Upload_Laporan_Anev = require("../controller/upload_anev");
const formValidation = require("../middleware/form_validation");
router.get("/", Upload_Laporan_Anev.get);
router.get("/getWeb", Upload_Laporan_Anev.getWeb);
router.get("/getId/:id", Upload_Laporan_Anev.getIdweb);
router.post("/add", Upload_Laporan_Anev.add);
router.delete("/delete", Upload_Laporan_Anev.delete);
router.delete("/hard_delete", Upload_Laporan_Anev.hardDelete);

// router.get("/count-month", InputTurjagwali.countByMonth);
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
