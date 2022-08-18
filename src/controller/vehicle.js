const { AESDecrypt } = require("../lib/encryption");
const response = require("../lib/response");
const Vehicle = require("../model/vehicle"); 
const db = require("../config/database");
module.exports = class VehicleController {
  static get = async (req, res) => {
    response(
      res,
      true,
      await Vehicle.findAll({ 
        // where: {
        //   id: AESDecrypt(req.auth.uid, {
        //     isSafeUrl: true,
        //     parseMode: "string",
        //   }),
        // },
      })
    );
  };
  static add = async (req, res) => {
    const transaction = await db.transaction();
    try {
      await Vehicle.create(
        {
          no_vehicle: req.body.no_vehicle,
          type_vehicle: req.body?.type_vehicle,
          brand_vehicle: req.body?.brand_vehicle, 
          ownership_vehicle: req.body?.ownership_vehicle,  
        },
        { transaction: transaction }
      );
      await transaction.commit();
      response(res, true, "Succeed", null);
    } catch (e) {
      await transaction.rollback();
      response(res, false, "Failed", e.message);
    }
  };
};
