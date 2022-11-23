const router = require("express").Router();
const { body } = require("express-validator");
const InputOperasiBukti = require("../controller/input_operasi_bukti");
const InputOperasDIkmaslantas = require("../controller/input_operasi_dikmaslantas");
const InputOperasiFungsiJalan = require("../controller/input_operasi_fungsi_jalan");
const InputOperasiGiatlantas = require("../controller/input_operasi_giatlantas");
const InputOperasiKendaraan = require("../controller/input_operasi_kendaraaan");
const InputOperasiMobil = require("../controller/input_operasi_langgarmobil");
const InputOperasiMotor = require("../controller/input_operasi_langgarmotor");
const InputOperasiLanggarLantas = require("../controller/input_operasi_langgarlantas");
const InputOperasiLokasiJalan = require("../controller/input_operasi_lokasi_jalan");
const InputOperasiLokasiKawasan = require("../controller/input_operasi_lokasi_kawasan");
const InputOperasiPenyebaran = require("../controller/input_operasi_penyebaran");
const InputOperasiProfesi = require("../controller/input_operasi_profesi");
const InputOperasiSim = require("../controller/input_operasi_sim");
const InputOperasiUsia = require("../controller/input_operasi_usia");
// const formValidation = require("../middleware/form_validation");
router.post("/bukti", InputOperasiBukti.add);
router.post("/dikmaslantas", InputOperasDIkmaslantas.add);
router.post("/fungsi-jalan", InputOperasiFungsiJalan.add);
router.post("/giatlantas", InputOperasiGiatlantas.add);
router.post("/kendaraan", InputOperasiKendaraan.add);
router.post("/langgar-mobil", InputOperasiMobil.add);
router.post("/langgar-motor", InputOperasiMotor.add);
router.post("/langgar-lantas", InputOperasiLanggarLantas.add);
router.post("/lokasi-jalan", InputOperasiLokasiJalan.add);
router.post("/lokasi-kawasan", InputOperasiLokasiKawasan.add);
router.post("/penyebaran", InputOperasiPenyebaran.add);
router.post("/profesi", InputOperasiProfesi.add);
router.post("/sim", InputOperasiSim.add);
router.post("/usia", InputOperasiUsia.add);


router.get("/turjagwali-grafik", InputOperasiGiatlantas.mobile_giatlantas);
router.get(
  "/pelanggaran-grafik",
  InputOperasiLanggarLantas.mobile_langgarlantas
);

router.get("/bukti", InputOperasiBukti.get);
module.exports = router;
