const router = require("express").Router();
const { body } = require("express-validator");
const Laporan_media_ntmc = require("../controller/laporan_media_ntmc");
const formValidation = require("../middleware/form_validation");
router.get("/", Laporan_media_ntmc.get);
router.get("/getWeb", Laporan_media_ntmc.getWeb);
router.get("/getId/:id", Laporan_media_ntmc.getIdweb);
router.post("/add", Laporan_media_ntmc.add);
router.delete("/delete", Laporan_media_ntmc.delete);
router.delete("/hard_delete", Laporan_media_ntmc.hardDelete);

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
