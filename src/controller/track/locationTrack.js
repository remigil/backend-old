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

      const getTrack = await TrackG20.find({
        date: {
          $gte: today,
          $lte: endDateToday,
        },
      }).sort({ updated_at: -1 });

      let track = getTrack.reduce((group, product) => {
        const { nrp_user } = product;
        group[nrp_user] = group[nrp_user] ?? [];
        group[nrp_user].push(product);
        return group;
      }, {});

      let valueData = [];
      Object.keys(track).forEach((val, key) => {
        valueData.push(
          track[val].sort(function (a, b) {
            var dateA = new Date(a.date_prop).getTime();
            var dateB = new Date(b.date_prop).getTime();
            return dateA < dateB ? -1 : 1;
          })[0]
        );
      });
      response(res, true, "Succeed", valueData);
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
      // const { date } = req.query;

      const today = moment().format("YYYY-MM-DD");
      const endDateToday = moment(today).endOf("day").toDate();
      const getTrack = await TrackG20.find({
        date: {
          $gte: today,
          $lte: endDateToday,
        },
        id_officer: AESDecrypt(req.auth.officer, {
          isSafeUrl: true,
          parseMode: "string",
        }),
      })
        .limit(1)
        .sort({
          created_at: -1,
        });
      response(res, true, "Succeed", getTrack.length ? getTrack[0] : {});
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
