const router = require("express").Router();
const ImportFile = require("../controller/import_file");


router.get("/list_jenis_satker/:id", ImportFile.getJenisSatker);

/**
 * Import Laporan Harian
 */
router.post("/file", ImportFile.file);
router.post("/rmfile", ImportFile.rmfile);
router.get("/list", ImportFile.list);
router.post("/dakgarlantas", ImportFile.dakgarlantas);
router.post("/konvensional", ImportFile.konvensional);
router.post("/lalulintas", ImportFile.lalulintas);
router.post("/turjagwali", ImportFile.turjagwali);
router.post("/dikmaslantas", ImportFile.dikmaslantas);
router.post("/penyebaran", ImportFile.penyebaran);
router.post("/sim", ImportFile.sim);
router.post("/bpkb", ImportFile.bpkb);
router.post("/ranmor", ImportFile.ranmor);
router.post("/stnk", ImportFile.stnk);

/**
 * Import Laporan Operasi Khusus
 */
 router.post("/operasi", ImportFile.operasi);
 router.post("/rmfileops", ImportFile.rmfileops);
 router.get("/listops", ImportFile.listops);
 router.post("/langgarlantas", ImportFile.langgarlantas);
 router.post("/langgarmotor", ImportFile.langgarmotor);
 router.post("/langgarmobil", ImportFile.langgarmobil);
 router.post("/barangbukti", ImportFile.barangbukti);
 router.post("/kendaraanterlibat", ImportFile.kendaraanterlibat);
 router.post("/profesipelaku", ImportFile.profesipelaku);
 router.post("/usia", ImportFile.usia);
 router.post("/simpelaku", ImportFile.simpelaku);
 router.post("/lokasikawasan", ImportFile.lokasikawasan);
 router.post("/statusjalan", ImportFile.statusjalan);
 router.post("/dikmaslantasops", ImportFile.dikmaslantasops);
 router.post("/giatlantas", ImportFile.giatlantas);
 router.post("/lakalantas", ImportFile.lakalantas);
 router.post("/fungsijalan", ImportFile.fungsijalan);
 router.post("/pekerjaankorban", ImportFile.pekerjaankorban);
 router.post("/pekerjaanpelaku", ImportFile.pekerjaanpelaku);
 router.post("/pendidikankorban", ImportFile.pendidikankorban);
 router.post("/penyebaranops", ImportFile.penyebaranops);
 router.post("/ranmorops", ImportFile.ranmorops);
 router.post("/usiakorban", ImportFile.usiakorban);
 router.post("/usiapelaku", ImportFile.usiapelaku);
 router.post("/turjagwaliops", ImportFile.turjagwaliops);

/**
 * Import Laporan NTMC
 */
 router.post("/ntmc", ImportFile.ntmc);
 router.post("/rmfilentmc", ImportFile.rmfilentmc);
 router.get("/listntmc", ImportFile.listntmc);
 router.post("/programtv", ImportFile.programtv);
 router.post("/programonline", ImportFile.programonline);
 router.post("/programmedsos", ImportFile.programmedsos);
 router.post("/offairprogram", ImportFile.offairprogram);
 router.post("/mediatv", ImportFile.mediatv);
 router.post("/twitter", ImportFile.medsos);
 router.post("/facebook", ImportFile.medsos);
 router.post("/portal", ImportFile.medsos);
 router.post("/instagram", ImportFile.medsos);
 router.post("/sosial", ImportFile.sosial);
 router.post("/radio", ImportFile.radio);
 router.post("/pengaduan", ImportFile.pengaduan);

 /**
  * Import Laporan Masyarakat
  */
  router.post("/masyarakat", ImportFile.masyarakat);
  router.post("/rmfilemasy", ImportFile.rmfilemasy);
  router.get("/listmasy", ImportFile.listmasy);
  router.post("/kegiatanmasyarakat", ImportFile.kegiatanmasyarakat);

module.exports = router;
