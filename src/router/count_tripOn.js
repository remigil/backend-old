const router = require("express").Router();
const { body } = require("express-validator");
const CountTripOn = require("../controller/count_tripOn");
const formValidation = require("../middleware/form_validation");
router.get("/jenis_kendaraan", CountTripOn.get_type);
router.get("/model_kendaraan", CountTripOn.get_model);
router.get("/prov_tripon", CountTripOn.prov_tripon);
router.get("/daily_tripon", CountTripOn.daily_tripon);
router.get("/filter", CountTripOn.filter);



module.exports = router;
