const router = require("express").Router();
const { body } = require("express-validator");
const Trip_onController = require("../controller/trip_on");
const formValidation = require("../middleware/form_validation");
router.get("/", Trip_onController.get);
router.get("/getid/:id", Trip_onController.getId);
router.get("/cektripon", Trip_onController.cekTripon);
router.get("/getbycode", Trip_onController.getbycodetripon);
router.get("/getbysocietyId/", Trip_onController.getbySocietyId);
router.get("/gethistorybysocietyId/", Trip_onController.gethistorybySocietyId);
router.post(
  "/add",
  // body("no_vehicle").notEmpty().isLength({ min: 3 }),
  formValidation,
  Trip_onController.add
);
router.put("/edit/:id", Trip_onController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  Trip_onController.delete
);
router.delete(
  "/hardDelete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  Trip_onController.hardDelete
);

router.get("/list_tripon", Trip_onController.getWeb);

router.get("/schedule", Trip_onController.getSchedule);
router.get("/history", Trip_onController.getHistory);


module.exports = router;
