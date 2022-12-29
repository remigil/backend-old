const cron = require("node-cron");
const db = require("../config/database");
const moment = require("moment");

const Count_polda_day = require("../model/count_garlantas_polda_day");
const Count_polda_month = require("../model/count_garlantas_polda_month");

const Polda = require("../model/polda");
const { Op, Sequelize } = require("sequelize");
exports.cronGarlantas = () => {
  const scheduledJobFunction = cron.schedule(" */1 * * * *", () => {
    console.log("Cron garlantas is running");
    update_polda_month();
  });

  scheduledJobFunction.start();
};

const update_polda_month = async () => {
  try {
    const transaction = await db.transaction();

    const startOfMonth = moment().startOf("month").format("YYYY-MM-DD");
    const endOfMonth = moment().endOf("month").format("YYYY-MM-DD");
    let allCountPoldaDay = await Polda.findAll({
      group: ["polda.id"],
      attributes: [
        "id",
        "name_polda",
        [
          Sequelize.fn("sum", Sequelize.col("pelanggaran_berat")),
          "pelanggaran_berat",
        ],
        [
          Sequelize.fn("sum", Sequelize.col("pelanggaran_sedang")),
          "pelanggaran_sedang",
        ],
        [
          Sequelize.fn("sum", Sequelize.col("pelanggaran_ringan")),
          "pelanggaran_ringan",
        ],
        [Sequelize.fn("sum", Sequelize.col("teguran")), "teguran"],
      ],
      include: [
        {
          model: Count_polda_day,
          required: false,
          as: "garlantas",
          attributes: [],
          where: {
            date: {
              [Op.between]: [startOfMonth, endOfMonth],
            },
          },
        },
      ],
      nest: true,
      subQuery: false,
      raw: true,
    });

    for (let i = 0; i < allCountPoldaDay.length; i++) {
      let checkData = await Count_polda_month.findOne({
        where: {
          polda_id: allCountPoldaDay[i].id,
          date: startOfMonth,
        },
      });

      let data = {
        polda_id: allCountPoldaDay[i].id,
        pelanggaran_berat: allCountPoldaDay[i].pelanggaran_berat,
        pelanggaran_ringan: allCountPoldaDay[i].pelanggaran_ringan,
        pelanggaran_sedang: allCountPoldaDay[i].pelanggaran_sedang,
        date: startOfMonth,
      };

      if (checkData) {
        let updateData = await Count_polda_month.update(data, {
          where: {
            polda_id: allCountPoldaDay[i].id,
            date: startOfMonth,
          },
        });
        console.log("update");
      } else {
        let insertData = await Count_polda_month.create(data);
        console.log("insert");
      }
    }
  } catch (error) {
    console.log(error);
  }
};

