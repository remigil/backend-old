const moment = require("moment");
const { AESDecrypt } = require("../../lib/encryption");
const response = require("../../lib/response");
const { TrackG20 } = require("../../model/tracking/g20");
module.exports = class LocationTrackController {
  static get = async (req, res) => {
    try {
      const { date } = req.query;
      const today = moment(date);
      const endDateToday = moment(today).endOf("day").toDate();

      await TrackG20.deleteMany({
        latitude: 123321,
      });
      // let getTrack = await TrackG20.aggregate([
      //   {
      //     $match: {
      //       date: {
      //         $gte: today,
      //         //   $lte: endDateToday,
      //       },
      //     },
      //   },
      //   {
      //     $sort: {
      //       date: -1,
      //     },
      //   },
      // ]);
      const getTrack = await TrackG20.find({
        date: {
          $gte: today,
          $lte: endDateToday,
        },
      }).sort({ date: -1 });

      response(res, true, "Succeed", getTrack);
    } catch (e) {
      response(res, false, "Failed", e.message);
    }
  };
  static sendToSocket = async () => {
    const today = moment(new Date()).format("YYYY-MM-DD");
    const endDateToday = moment(today).endOf("day").toDate();
    const getTrack = await TrackG20.find({
      date: {
        $gte: today,
        $lte: endDateToday,
      },
    });
    return getTrack;
  };
  static getByUser = async (req, res) => {
    try {
      const { date } = req.query;

      const today = moment(date);
      const endDateToday = moment(today).endOf("day").toDate();
      const getTrack = await TrackG20.find({
        date: {
          $gte: today,
          $lte: endDateToday,
        },
        user_id: AESDecrypt(req.params.id, {
          isSafeUrl: true,
          parseMode: "string",
        }),
      });
      response(res, true, "Succeed", getTrack);
    } catch (e) {
      response(res, false, "Failed", e.message);
    }
  };
  static add = async (req, res) => {
    try {
      await TrackG20.create({
        id_user: AESDecrypt(req.auth.uid, {
          isSafeUrl: true,
          parseMode: "string",
        }),
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        date: moment(),
      });
      response(res, true, "Succeed", null);
    } catch (e) {
      response(res, false, "Failed", e.message);
    }
  };
};
