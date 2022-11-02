const { AESDecrypt } = require("../lib/encryption");
const response = require("../lib/response");
const db = require("../config/database");
const { Op, Sequelize } = require("sequelize");
const moment = require("moment");
const { TrackG20 } = require("../model/tracking/g20");
const dateParse = (date) => {
  const aaa = moment.tz(date, "Etc/GMT-5");
  return aaa.format("YYYY-MM-DD");
};
module.exports = class CheckDataController {
  static check = async (req, res) => {
    try {
      const today = dateParse(moment());

      let getTrack = await TrackG20.aggregate(
        [
          {
            $match: {
              dateOnly: today,
            },
          },
          {
            $group: {
              _id: "$nrp_user",
              max_date: {
                $max: "$updated_at",
              },
              records: {
                $push: "$$ROOT",
              },
            },
          },
          {
            $project: {
              nrp_user: {
                $filter: {
                  input: "$records",
                  as: "records",
                  cond: {
                    $eq: ["$$records.updated_at", "$max_date"],
                  },
                },
              },
            },
          },
          {
            $replaceRoot: {
              newRoot: {
                results: "$nrp_user",
              },
            },
          },
        ],
        {
          allowDiskUse: true,
        }
      );
      getTrack = getTrack.map((datanya) => datanya.results[0]);
      response(res, true, "Berhasil", getTrack, 200);
    } catch (error) {
      response(res, false, error.message, error, 400);
    }
  };
};
