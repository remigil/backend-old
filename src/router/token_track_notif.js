const { body } = require("express-validator");
const TokenTrackController = require("../controller/token_track_notif");
const formValidation = require("../middleware/form_validation");
const router = require("express").Router();
router.get("/", TokenTrackController.get);
router.post(
  "/add",
  body("nrp_user").notEmpty().isLength({ min: 8 }),
  formValidation,
  TokenTrackController.add
);
router.put("/edit", TokenTrackController.edit);

router.delete(
  "/delete",
  // body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  TokenTrackController.delete
);
module.exports = router;
