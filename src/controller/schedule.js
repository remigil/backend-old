const { AESEncrypt, AESDecrypt } = require("../lib/encryption");
const response = require("../lib/response");
const Schedule = require("../model/schedule");
const Account = require("../model/account");
const Vip = require("../model/vip");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const db = require("../config/database");
const Renpam = require("../model/renpam");
const fs = require("fs");
const pagination = require("../lib/pagination-parser");
const TrxAccountOfficer = require("../model/trx_account_officer");
const Officer = require("../model/officer");

const field = {
  activity: null,
  id_vip: null,
  id_account: null,
  date_schedule: null,
  start_time: null,
  end_time: null,
  address_schedule: null,
  coordinate_schedule: null,
  status_schedule: 0,
  photo_schedule: null,
};
const queryGlobal = ({ select, join, condition, account_id }) => {
  let query = `SELECT 
                
                ${select}
              FROM renpam r
              INNER JOIN renpam_account ra ON ra.renpam_id=r.id
              ${join}
              WHERE 1=1
              AND ra.account_id=${AESDecrypt(account_id, {
                isSafeUrl: true,
                parseMode: "string",
              })}
              ${condition ? condition : ""}
            `;

  return query;
};
const castingJumlahHariIni = (data, today) => {
  let getToday = data.filter((e) => e.tanggal == today);
  return getToday.length ? getToday[0].data : [];
};
module.exports = class ScheduleController {
  static trx = async (req, res) => {
    try {
      let queryRepam = [];
      let { date, operation_id, type, jumlahHariini } = req.query;
      let jumlah_data = {
        renpam: {
          jumlah: 0,
          data: [],
        },
        vip: {
          jumlah: 0,
          data: [],
        },
        kegiatan: {
          jumlah: 0,
          data: [],
        },
        petugas: {
          jumlah: 0,
          data: [],
        },
      };

      let dateIterator = "";
      let no = 0;
      for (const iterator of date.split(",")) {
        dateIterator += `'${iterator}'`;
        if (no != date.split(",").length - 1) {
          dateIterator += ",";
        }
        no++;
      }
      if (date != undefined) {
        queryRepam.push(`r.date IN (${dateIterator})`);
      }

      let [dateGroup] = await db.query(`
      SELECT r.date FROM renpam r
      INNER JOIN renpam_account ra ON ra.renpam_id=r.id
      WHERE ra.account_id=${AESDecrypt(req.auth.uid, {
        isSafeUrl: true,
        parseMode: "string",
      })}
      ${queryRepam.length ? "AND " + queryRepam.join("AND") : ""}
      GROUP BY r.date`);
      if (operation_id != undefined) {
        queryRepam.push(
          `r.operation_id=${AESDecrypt(operation_id, {
            isSafeUrl: true,
            parseMode: "string",
          })}`
        );
      }
      // renpam data
      let renpamData = [];
      for (const iterator of dateGroup) {
        let [result_renpam] = await db.query(
          queryGlobal({
            select: `
            s.*,
                  s.id as id_schedule,
            r.id as id_ranpam,
            r.name_renpam,
            r.type_renpam,
            r.route,
            r.route_alternatif_1,
            r.route_alternatif_2,
            r.coordinate_guarding,
            r.date,
            r.start_time as renpam_start_time,
            r.end_time as renpam_end_time,
            r.title_start,
            r.title_end,
            r.note_kakor,
            CASE WHEN (r.status_renpam is NULL OR r.status_renpam = 0) THEN 'belum' ELSE 'sudah' END renpam_status,
            CASE 
            WHEN r.type_renpam = 1 THEN 'Patroli' 
            WHEN r.type_renpam = 2 THEN 'Pengawalan' 
            WHEN r.type_renpam = 3 THEN 'Penjagaan'
            ELSE 'Patroli' END AS title_renpam_type,
            r.direction_route,
            r.direction_route_alter1,
            r.direction_route_alter2,
            r.estimasi,
            r.estimasi_alter1,
            r.estimasi_alter2
            `,
            join: `
            LEFT JOIN schedule s ON s.id=r.schedule_id
            `,
            condition: `
            AND r.date='${iterator.date}' 
            order by r.date ASC`,
            account_id: req.auth.uid,
          })
        );
        result_renpam = result_renpam.map((renpam) => ({
          ...renpam,
          route: renpam.route
            ? renpam.route.map(
                (route) => route.latLng?.lng + "," + route.latLng?.lat
              )
            : "",
          route_alternatif_1: renpam.route_alternatif_1
            ? renpam.route_alternatif_1.map(
                (route) => route.latLng?.lng + "," + route.latLng?.lat
              )
            : "",
          route_alternatif_2: renpam.route_alternatif_2
            ? renpam.route_alternatif_2.map(
                (route) => route.latLng?.lng + "," + route.latLng?.lat
              )
            : "",
          address_route_1: renpam.route
            ? renpam.route.map((route) => ({
                address: route.name,
              }))
            : [],
          address_route_2: renpam.route_alternatif_1
            ? renpam.route_alternatif_1.map((route) => ({
                address: route.name,
              }))
            : [],
          address_route_3: renpam.route_alternatif_2
            ? renpam.route_alternatif_2.map((route) => ({
                address: route.name,
              }))
            : [],
        }));

        renpamData.push({
          tanggal: iterator.date,
          data: result_renpam,
        });
      }
      // vip data
      let vipData = [];
      for (const iterator of dateGroup) {
        let [result_vip] = await db.query(
          queryGlobal({
            select: `
          
              v.name_vip,
              v.country_arrival_vip,
              v.position_vip,
               v.id as id_vip
            `,
            join: `
            LEFT JOIN schedule s ON s.id=r.schedule_id
              INNER JOIN renpam_vip rv ON rv.renpam_id=r.id
              INNER JOIN vip v ON v.id=rv.vip_id
            `,
            condition: `
             AND r.date='${iterator.date}' 
              GROUP BY v.id
            `,
            account_id: req.auth.uid,
          })
        );

        vipData.push({
          tanggal: iterator.date,
          data: result_vip,
        });
      }
      // kegiatan data
      let kegiatanData = [];
      for (const iterator of dateGroup) {
        // AND s.date_schedule='${iterator.date}'
        let [result_kegiatan] = await db.query(
          queryGlobal({
            select: `
            r.id as id_ranpam,
            r.*,
            s.*,
                s.id as id_schedule
          `,
            join: `
          INNER JOIN schedule s ON s.id=r.schedule_id
            
          `,
            condition: `
              AND r.date='${iterator.date}'
              

              order by r.date ASC
            `,
            account_id: req.auth.uid,
          })
        );
        //
        let kegiatanDataItem = [];
        for (const iterator of result_kegiatan) {
          let [get_vip] = await db.query(`
              SELECT v.* from vip v
              inner join renpam_vip rv ON v.id=rv.vip_id
              where rv.renpam_id=${iterator.id_ranpam}
          `);

          kegiatanDataItem.push({
            ...iterator,
            vip: get_vip,
          });
        }
        // result_kegiatan.forEach(async(kegiatan, index)=>{
        //   let [vip_kegiatan] = await
        // })
        // let [kegiatanWithVip] =
        if (result_kegiatan.length) {
          kegiatanData.push({
            tanggal: iterator.date,
            data: kegiatanDataItem,
          });
        }
      }
      // petugas data

      const idOfficer = AESDecrypt(req.auth.officer, {
        isSafeUrl: true,
        parseMode: "string",
      });
      let account_id = await TrxAccountOfficer.findOne({
        where: {
          officer_id: parseInt(idOfficer),
        },
      });

      let dataAccount = await Account.findOne({
        where: {
          id: account_id.account_id,
        },
        include: [
          {
            model: Officer,
            as: "officers",
            required: true,
          },
        ],
      });

      jumlah_data = {
        ...jumlah_data,
        renpam: {
          jumlah: castingJumlahHariIni(renpamData, jumlahHariini).length,
          data: renpamData,
        },
        vip: {
          jumlah: castingJumlahHariIni(vipData, jumlahHariini).length,
          data: vipData,
        },
        kegiatan: {
          jumlah: castingJumlahHariIni(kegiatanData, jumlahHariini).length,
          data: kegiatanData,
        },
        petugas: {
          jumlah: dataAccount?.officers?.length,
          data: dataAccount?.officers,
        },
      };

      response(
        res,
        true,
        "Succeed",
        type ? { [type]: jumlah_data[type] } : jumlah_data
      );
    } catch (e) {
      response(res, false, "Failed", e.message);
    }
  };
  static get = async (req, res) => {
    try {
      const {
        length = 10,
        start = 0,
        serverSide = null,
        search = null,
        filter = [],
        filterSearch = [],
        order = null,
        orderDirection = "asc",
      } = req.query;
      const modelAttr = Object.keys(Schedule.getAttributes());
      let getData = { where: null };
      if (serverSide?.toLowerCase() === "true") {
        const resPage = pagination.getPagination(length, start);
        getData.limit = resPage.limit;
        getData.offset = resPage.offset;
      }
      // getDataRules.order = [[modelAttr[order], orderDirection.toUpperCase()]];
      getData.order = [
        [
          order != null ? order : "id",
          orderDirection != null ? orderDirection : "asc",
        ],
      ];
      if (search != null) {
        let whereBuilder = [];
        modelAttr.forEach((key) => {
          whereBuilder.push(
            Sequelize.where(
              Sequelize.fn(
                "lower",
                Sequelize.cast(Sequelize.col(key), "varchar")
              ),
              {
                [Op.like]: `%${search.toLowerCase()}%`,
              }
            )
          );
        });
        getData.where = {
          [Op.or]: whereBuilder,
        };
      }
      if (
        filter != null &&
        filter.length > 0 &&
        filterSearch != null &&
        filterSearch.length > 0
      ) {
        const filters = [];
        filter.forEach((fKey, index) => {
          if (_.includes(modelAttr, fKey)) {
            filters[fKey] = filterSearch[index];
          }
        });
        getData.where = {
          ...getData.where,
          ...filters,
        };
      }
      const dataRes = await Schedule.findAll(getData);
      const count = await Schedule.count({
        where: getData?.where,
      });

      var data = [];
      var dummyData = {};
      for (let i = 0; i < dataRes.length; i++) {
        const dataRenpam = await Renpam.findAll({
          where: {
            schedule_id: AESDecrypt(dataRes[i]["id"], {
              isSafeUrl: true,
              parseMode: "string",
            }),
          },
        });

        // operation_id: null,
        // activity: null,
        // id_vip: null,
        // id_account: null,
        // date_schedule: null,
        // start_time: null,
        // end_time: null,
        // address_schedule: null,
        // coordinate_schedule: null,
        // status_schedule: 0,
        // photo_schedule: null,

        dummyData = {};
        dummyData["id"] = dataRes[i]["id"];
        dummyData["operation_id"] = dataRes[i]["operation_id"];
        dummyData["activity"] = dataRes[i]["activity"];
        dummyData["photo_schedule"] = dataRes[i]["photo_schedule"];
        dummyData["date_schedule"] = dataRes[i]["date_schedule"];
        dummyData["start_time"] = dataRes[i]["start_time"];
        dummyData["end_time"] = dataRes[i]["end_time"];
        dummyData["address_schedule"] = dataRes[i]["address_schedule"];
        dummyData["coordinate_schedule"] = dataRes[i]["coordinate_schedule"];
        dummyData["status_schedule"] = dataRes[i]["status_schedule"];
        dummyData["renpams"] = dataRenpam;

        dummyData["created_at"] = dataRes[i]["created_at"];
        dummyData["updated_at"] = dataRes[i]["updated_at"];
        dummyData["deleted_at"] = dataRes[i]["deleted_at"];

        data.push(dummyData);
      }

      response(res, true, "Succeed", {
        data,
        recordsFiltered: count,
        recordsTotal: count,
        // test: JSON.parse(adaw),
      });
    } catch (e) {
      response(res, false, "Failed", e.message);
    }
  };

  static getId = async (req, res) => {
    try {
      const data = await Schedule.findOne({
        where: {
          id: AESDecrypt(req.params.id, {
            isSafeUrl: true,
            parseMode: "string",
          }),
        },
      });

      response(res, true, "Succeed", {
        data,
      });
    } catch (e) {
      response(res, false, "Failed", e.message);
    }
  };

  static add = async (req, res) => {
    const transaction = await db.transaction();
    try {
      let fieldValue = {};

      Object.keys(field).forEach((val, key) => {
        fieldValue[val] = req.body[val];
        if (req.body[val]) {
          if (val == "id_account") {
            var dataIdAccount = [];
            const arrayIdAccount = fieldValue["id_account"].split(",");
            for (let i = 0; i < arrayIdAccount.length; i++) {
              dataIdAccount.push(
                AESDecrypt(arrayIdAccount[i], {
                  isSafeUrl: true,
                  parseMode: "string",
                })
              );
            }
            fieldValue[val] = dataIdAccount.toString();
          } else if (val == "id_vip") {
            var dataIdVip = [];
            const arrayIdVip = fieldValue["id_vip"].split(",");
            for (let i = 0; i < arrayIdVip.length; i++) {
              dataIdVip.push(
                AESDecrypt(arrayIdVip[i], {
                  isSafeUrl: true,
                  parseMode: "string",
                })
              );
            }
            fieldValue[val] = dataIdVip.toString();
          } else if (val == "photo_schedule") {
            let path = req.body.photo_schedule.filepath;
            let file = req.body.photo_schedule;
            let fileName = file.originalFilename;
            fs.renameSync(
              path,
              "./public/uploads/schedule/" + fileName,
              function (err) {
                if (err) throw err;
              }
            );
            fieldValue[val] = fileName;
          }
        }
      });
      await Schedule.create(fieldValue, { transaction: transaction });
      await transaction.commit();
      response(res, true, "Succeed", null);
    } catch (e) {
      await transaction.rollback();
      response(res, false, "Failed", e.message);
    }
  };
  static edit = async (req, res) => {
    const transaction = await db.transaction();
    try {
      let fieldValue = {};

      Object.keys(field).forEach((val, key) => {
        fieldValue[val] = req.body[val];
        if (req.body[val]) {
          if (val == "id_account") {
            var dataIdAccount = [];
            const arrayIdAccount = fieldValue["id_account"].split(",");
            for (let i = 0; i < arrayIdAccount.length; i++) {
              dataIdAccount.push(
                AESDecrypt(arrayIdAccount[i], {
                  isSafeUrl: true,
                  parseMode: "string",
                })
              );
            }
            fieldValue[val] = dataIdAccount.toString();
          } else if (val == "id_vip") {
            var dataIdVip = [];
            const arrayIdVip = fieldValue["id_vip"].split(",");
            for (let i = 0; i < arrayIdVip.length; i++) {
              dataIdVip.push(
                AESDecrypt(arrayIdVip[i], {
                  isSafeUrl: true,
                  parseMode: "string",
                })
              );
            }
            fieldValue[val] = dataIdVip.toString();
          }
        }
      });
      await Schedule.update(fieldValue, {
        where: {
          id: AESDecrypt(req.params.id, {
            isSafeUrl: true,
            parseMode: "string",
          }),
        },
        transaction: transaction,
      });
      await transaction.commit();
      response(res, true, "Succeed", null);
    } catch (e) {
      await transaction.rollback();
      response(res, false, "Failed", e.message);
    }
  };
  static delete = async (req, res) => {
    const transaction = await db.transaction();
    try {
      let fieldValue = {};
      fieldValue["deleted_at"] = new Date();
      await Schedule.update(fieldValue, {
        where: {
          id: AESDecrypt(req.body.id, {
            isSafeUrl: true,
            parseMode: "string",
          }),
        },
        transaction: transaction,
      });
      await transaction.commit();
      response(res, true, "Succeed", null);
    } catch (e) {
      await transaction.rollback();
      response(res, false, "Failed", e.message);
    }
  };
  static hardDelete = async (req, res) => {
    const transaction = await db.transaction();
    try {
      await Schedule.destroy({
        where: {
          id: AESDecrypt(req.body.id, {
            isSafeUrl: true,
            parseMode: "string",
          }),
        },
        transaction: transaction,
      });
      await transaction.commit();
      response(res, true, "Succeed", null);
    } catch (e) {
      await transaction.rollback();
      response(res, false, "Failed", e.message);
    }
  };
};
