const db = require("../config/database");
const response = require("../lib/response");
const {ImportFile, Dakgarlantas, Poldaa, Polres, Konvensional, Lalulintas, Turjagwali, Dikmaslantas, Penyebaran, Sim, Bpkb, Ranmor, Stnk, ImportFileOps, Langgarlantas, Langgarmotor, Langgarmobil, Barangbukti, Kendaraanterlibat, Profesipelaku, Usia, Simpelaku, Lokasikawasan, Statusjalan, Dikmaslantasops, Giatlantas, Lakalantas, Fungsijalan, Pekerjaankorban, Pekerjaanpelaku, Pendidikankorban, Penyebaranops, Ranmorops, Usiakorban, Usiapelaku, Turjagwaliops, ImportFileNtmc, Programtv, Programonline, Programmedsos, Offairprogram, Mediatv, Medsos, Sosial, Radio, Pengaduan, ImportFileMasyarakat, Kegiatanmasyarakat} = require("../model/import_file");
const { Op, Sequelize } = require("sequelize");
const { AESDecrypt } = require("../lib/encryption");
const Validator = require('fastest-validator')
const check = new Validator()
const _ = require("lodash");

/**
 * Function
 * Decrypt ID
 */
const decAes = (param) =>
  AESDecrypt(param, {
    isSafeUrl: true,
    parseMode: "string",
  });

/**
 * Class Import
 * For process data daily report
 */

module.exports = class ImportFileController {
  static getJenisSatker = async (req, res) => {
    try {
      let data = await ImportFile.findAll({
        where: {
          jenis_satker: req.params.id,
        },
      });
      response(res, true, "Succeed", data);
    } catch (error) {
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * SECTION IMPORT LAPORAN HARIAN
   * [BEGIN]
   */

  /**
   * Function process import file
   */
  static file = async (req, res) => {
    const transaction = await db.transaction();
    try {
      /**
       * Validate parameter
       */

      const schema = {
        // polda_id: { type: 'string'},
        jenis_satker: { type: "string" },
        jenis_laporan: { type: "string" },
        tanggal: { type: "string" },
        file_name: { type: "string" },
        file_client_name: { type: "string" },
        file_ext: { type: "string" },
        file_type: { type: "string" },
        status: { type: "string" },
        imported_by: { type: "string" },
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Parameter
         */
        // const polda_id = req.body.polda_id
        const jenis_satker = req.body.jenis_satker;
        const jenis_laporan = req.body.jenis_laporan;
        const tanggal = req.body.tanggal;
        const file_name = req.body.file_name;
        const file_client_name = req.body.file_client_name;
        const file_ext = req.body.file_ext;
        const file_type = req.body.file_type;
        const status = req.body.status;
        const imported_by = req.body.imported_by;

        /**
         * Data Payload
         */
        const Data = {
          // polda_id: decAes(polda_id),
          jenis_satker: jenis_satker,
          jenis_laporan: jenis_laporan,
          tanggal: tanggal,
          file_name: file_name,
          file_client_name: file_client_name,
          file_ext: file_ext,
          file_type: file_type,
          status: status,
          imported_by: decAes(imported_by),
        };

        /**
         * Transaction process
         */
        await ImportFile.create(Data, { transaction: transaction });
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  static rmfile = async (req, res) => {
    const transaction = await db.transaction();
    try {
      /**
       * Validate parameter
       */

      const schema = {
        id: { type: "string" },
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Parameter
         */
        const id = decAes(req.body.id);

        /**
         * Transaction process
         */
        await ImportFile.destroy({
          where: { id: id },
          transaction: transaction,
        });
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * Function list of data import
   */
  static list = async (req, res) => {
    try {
      const {
        length = 10,
        start = 0,
        serverSide = null,
        search = null,
        filter = [],
        filterSearch = [],
        order = 0,
        orderDirection = "asc",
      } = req.query;

      const modelAttr = Object.keys(ImportFile.getAttributes());
      let getDataRules = { where: null };

      if (serverSide?.toLowerCase() === "true") {
        getDataRules.limit = length;
        getDataRules.offset = start;
      }

      if (order <= modelAttr.length) {
        getDataRules.order = [[modelAttr[order], orderDirection.toUpperCase()]];
      }

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
        getDataRules.where = {
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
        getDataRules.where = {
          ...getDataRules.where,
          ...filters,
        };
      }

      const data = await ImportFile.findAll(getDataRules);
      const count = await ImportFile.count({
        where: getDataRules?.where,
      });

      response(res, true, "Succeed", {
        data,
        recordsFiltered: count,
        recordsTotal: count,
      });
    } catch (e) {
      response(res, false, "Failed", e.message);
    }
  };

  /**
   * Function process dakgarlantas
   */
  static dakgarlantas = async (req, res) => {
    const transaction = await db.transaction();
    const param = req.body;
    const source_id = decAes(param.source_id);
    const value = param.value;
    try {
      /**
       * Validate parameter
       */

      const schema = {
        value: ["string", "array"],
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Data Payload
         */
        let Data = [];
        let Destroy = [];
        for (let i in value) {
          /**
           * Define Parameter
           */
          const polda_id = value[i].polda_id;
          // const polres_name = value[i].polres_name
          const date = value[i].date;
          const capture_camera = value[i].capture_camera;
          const statis = value[i].statis;
          const mobile = value[i].mobile;
          const online = value[i].online;
          const posko = value[i].posko;
          const preemtif = value[i].preemtif;
          const odol_227 = value[i].odol_227;
          const odol_307 = value[i].odol_307;

          /**
           * Get ID Polda
           */
          let getIdPolda = await Poldaa.findOne({
            where: {
              name_polda: polda_id,
            },
          });

          /**
           * Get ID Polres
           */
          //  let getIdPolres = await Polres.findOne({
          //     where: {
          //         name_polres: polres_name
          //     }
          // });

          /**
           * Data Payload
           */
          Data.push({
            polda_id: getIdPolda.dataValues.id,
            // polres_id: getIdPolres.dataValues.id,
            date: date,
            capture_camera: capture_camera,
            statis: statis,
            mobile: mobile,
            online: online,
            posko: posko,
            preemtif: preemtif,
            odol_227: odol_227,
            odol_307: odol_307,
          });

          /**
           * Check data if exist set to array destroy
           */
          let checkExist = await Dakgarlantas.findAll({
            where: {
              polda_id: getIdPolda.dataValues.id,
              // polres_id: getIdPolres.dataValues.id,
              date: date,
            },
          });

          /**
           * Data Destroy & Update to new value
           */
          for (let i in checkExist) {
            if (checkExist[i].dataValues.id != null) {
              Destroy.push(checkExist[i].dataValues.id);
            }
          }
        }

        /**
         * Transaction process
         */
        await Dakgarlantas.destroy({
          where: { id: Destroy },
          transaction: transaction,
        });
        await Dakgarlantas.bulkCreate(Data, { transaction: transaction });
        await ImportFile.update(
          { status: 1 },
          { where: { id: source_id }, transaction: transaction }
        );
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * Function process konvensional
   */
  static konvensional = async (req, res) => {
    const transaction = await db.transaction();
    const param = req.body;
    const source_id = decAes(param.source_id);
    const value = param.value;
    try {
      /**
       * Validate parameter
       */

      const schema = {
        value: ["string", "array"],
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Data Payload
         */
        let Data = [];
        let Destroy = [];
        for (let i in value) {
          /**
           * Define Parameter
           */
          const polda_id = value[i].polda_id;
          // const polres_name = value[i].polres_name
          const date = value[i].date;
          const pelanggaran_berat = value[i].pelanggaran_berat;
          const pelanggaran_sedang = value[i].pelanggaran_sedang;
          const pelanggaran_ringan = value[i].pelanggaran_ringan;
          const teguran = value[i].teguran;

          /**
           * Get ID Polda
           */
          let getIdPolda = await Poldaa.findOne({
            where: {
              name_polda: polda_id,
            },
          });

          /**
           * Get ID Polres
           */
          // let getIdPolres = await Polres.findOne({
          //     where: {
          //         name_polres: polres_name
          //     }
          // });

          /**
           * Data Payload
           */
          Data.push({
            polda_id: getIdPolda.dataValues.id,
            // polres_id: getIdPolres.dataValues.id,
            date: date,
            pelanggaran_berat: pelanggaran_berat,
            pelanggaran_sedang: pelanggaran_sedang,
            pelanggaran_ringan: pelanggaran_ringan,
            teguran: teguran,
          });

          /**
           * Check data if exist set to array destroy
           */
          let checkExist = await Konvensional.findAll({
            where: {
              polda_id: getIdPolda.dataValues.id,
              // polres_id: getIdPolres.dataValues.id,
              date: date,
            },
          });

          /**
           * Data Destroy & Update to new value
           */
          for (let i in checkExist) {
            if (checkExist[i].dataValues.id != null) {
              Destroy.push(checkExist[i].dataValues.id);
            }
          }
        }

        /**
         * Transaction process
         */
        await Konvensional.destroy({
          where: { id: Destroy },
          transaction: transaction,
        });
        await Konvensional.bulkCreate(Data, { transaction: transaction });
        await ImportFile.update(
          { status: 1 },
          { where: { id: source_id }, transaction: transaction }
        );
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * Function process lalulintas
   */
  static lalulintas = async (req, res) => {
    const transaction = await db.transaction();
    const param = req.body;
    const source_id = decAes(param.source_id);
    const value = param.value;
    try {
      /**
       * Validate parameter
       */

      const schema = {
        value: ["string", "array"],
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Data Payload
         */
        let Data = [];
        let Destroy = [];
        for (let i in value) {
          /**
           * Define Parameter
           */
          const polda_id = value[i].polda_id;
          // const polres_name = value[i].polres_name
          const date = value[i].date;
          const meninggal_dunia = value[i].meninggal_dunia;
          const luka_berat = value[i].luka_berat;
          const luka_ringan = value[i].luka_ringan;
          const kerugian_material = value[i].kerugian_material;
          const insiden_kecelakaan = value[i].insiden_kecelakaan;
          const total_korban = value[i].total_korban;

          /**
           * Get ID Polda
           */
          let getIdPolda = await Poldaa.findOne({
            where: {
              name_polda: polda_id,
            },
          });

          /**
           * Get ID Polres
           */
          // let getIdPolres = await Polres.findOne({
          //     where: {
          //         name_polres: polres_name
          //     }
          // });

          /**
           * Data Payload
           */
          Data.push({
            polda_id: getIdPolda.dataValues.id,
            // polres_id: getIdPolres.dataValues.id,
            date: date,
            meninggal_dunia: meninggal_dunia,
            luka_berat: luka_berat,
            luka_ringan: luka_ringan,
            kerugian_material: kerugian_material,
            insiden_kecelakaan: insiden_kecelakaan,
            total_korban: total_korban,
          });

          /**
           * Check data if exist set to array destroy
           */
          let checkExist = await Lalulintas.findAll({
            where: {
              polda_id: getIdPolda.dataValues.id,
              // polres_id: getIdPolres.dataValues.id,
              date: date,
            },
          });

          /**
           * Data Destroy & Update to new value
           */
          for (let i in checkExist) {
            if (checkExist[i].dataValues.id != null) {
              Destroy.push(checkExist[i].dataValues.id);
            }
          }
        }

        /**
         * Transaction process
         */
        await Lalulintas.destroy({
          where: { id: Destroy },
          transaction: transaction,
        });
        await Lalulintas.bulkCreate(Data, { transaction: transaction });
        await ImportFile.update(
          { status: 1 },
          { where: { id: source_id }, transaction: transaction }
        );
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * Function process turjagwali
   */
  static turjagwali = async (req, res) => {
    const transaction = await db.transaction();
    const param = req.body;
    const source_id = decAes(param.source_id);
    const value = param.value;
    try {
      /**
       * Validate parameter
       */

      const schema = {
        value: ["string", "array"],
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Data Payload
         */
        let Data = [];
        let Destroy = [];
        for (let i in value) {
          /**
           * Define Parameter
           */
          const polda_id = value[i].polda_id;
          // const polres_name = value[i].polres_name
          const date = value[i].date;
          const penjagaan = value[i].penjagaan;
          const pengawalan = value[i].pengawalan;
          const patroli = value[i].patroli;
          const pengaturan = value[i].pengaturan;

          /**
           * Get ID Polda
           */
          let getIdPolda = await Poldaa.findOne({
            where: {
              name_polda: polda_id,
            },
          });

          /**
           * Get ID Polres
           */
          // let getIdPolres = await Polres.findOne({
          //     where: {
          //         name_polres: polres_name
          //     }
          // });

          /**
           * Data Payload
           */
          Data.push({
            polda_id: getIdPolda.dataValues.id,
            // polres_id: getIdPolres.dataValues.id,
            date: date,
            penjagaan: penjagaan,
            pengawalan: pengawalan,
            patroli: patroli,
            pengaturan: pengaturan,
          });
          /**
           * Check data if exist set to array destroy
           */
          let checkExist = await Turjagwali.findAll({
            where: {
              polda_id: getIdPolda.dataValues.id,
              // polres_id: getIdPolres.dataValues.id,
              date: date,
            },
          });

          /**
           * Data Destroy & Update to new value
           */
          for (let i in checkExist) {
            if (checkExist[i].dataValues.id != null) {
              Destroy.push(checkExist[i].dataValues.id);
            }
          }
        }

        /**
         * Transaction process
         */
        await Turjagwali.destroy({
          where: { id: Destroy },
          transaction: transaction,
        });
        await Turjagwali.bulkCreate(Data, { transaction: transaction });
        await ImportFile.update(
          { status: 1 },
          { where: { id: source_id }, transaction: transaction }
        );
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * Function process dikmaslantas
   */
  static dikmaslantas = async (req, res) => {
    const transaction = await db.transaction();
    const param = req.body;
    const source_id = decAes(param.source_id);
    const value = param.value;
    try {
      /**
       * Validate parameter
       */

      const schema = {
        value: ["string", "array"],
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Data Payload
         */
        let Data = [];
        let Destroy = [];
        for (let i in value) {
          /**
           * Define Parameter
           */
          const polda_id = value[i].polda_id;
          // const polres_name = value[i].polres_name
          const date = value[i].date;
          const media_cetak = value[i].media_cetak;
          const media_elektronik = value[i].media_elektronik;
          const media_sosial = value[i].media_sosial;
          const laka_langgar = value[i].laka_langgar;

          /**
           * Get ID Polda
           */
          let getIdPolda = await Poldaa.findOne({
            where: {
              name_polda: polda_id,
            },
          });

          /**
           * Get ID Polres
           */
          // let getIdPolres = await Polres.findOne({
          //     where: {
          //         name_polres: polres_name
          //     }
          // });

          /**
           * Data Payload
           */
          Data.push({
            polda_id: getIdPolda.dataValues.id,
            // polres_id: getIdPolres.dataValues.id,
            date: date,
            media_cetak: media_cetak,
            media_elektronik: media_elektronik,
            media_sosial: media_sosial,
            laka_langgar: laka_langgar,
          });

          /**
           * Check data if exist set to array destroy
           */
          let checkExist = await Dikmaslantas.findAll({
            where: {
              polda_id: getIdPolda.dataValues.id,
              // polres_id: getIdPolres.dataValues.id,
              date: date,
            },
          });

          /**
           * Data Destroy & Update to new value
           */
          for (let i in checkExist) {
            if (checkExist[i].dataValues.id != null) {
              Destroy.push(checkExist[i].dataValues.id);
            }
          }
        }

        /**
         * Transaction process
         */
        await Dikmaslantas.destroy({
          where: { id: Destroy },
          transaction: transaction,
        });
        await Dikmaslantas.bulkCreate(Data, { transaction: transaction });
        await ImportFile.update(
          { status: 1 },
          { where: { id: source_id }, transaction: transaction }
        );
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * Function process penyebaran
   */
  static penyebaran = async (req, res) => {
    const transaction = await db.transaction();
    const param = req.body;
    const source_id = decAes(param.source_id);
    const value = param.value;
    try {
      /**
       * Validate parameter
       */

      const schema = {
        value: ["string", "array"],
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Data Payload
         */
        let Data = [];
        let Destroy = [];
        for (let i in value) {
          /**
           * Define Parameter
           */
          const polda_id = value[i].polda_id;
          // const polres_name = value[i].polres_name
          const date = value[i].date;
          const stiker = value[i].stiker;
          const leaflet = value[i].leaflet;
          const spanduk = value[i].spanduk;
          const billboard = value[i].billboard;
          const jemensosprek = value[i].jemensosprek;

          /**
           * Get ID Polda
           */
          let getIdPolda = await Poldaa.findOne({
            where: {
              name_polda: polda_id,
            },
          });

          /**
           * Get ID Polres
           */
          // let getIdPolres = await Polres.findOne({
          //     where: {
          //         name_polres: polres_name
          //     }
          // });

          /**
           * Data Payload
           */
          Data.push({
            polda_id: getIdPolda.dataValues.id,
            // polres_id: getIdPolres.dataValues.id,
            date: date,
            stiker: stiker,
            leaflet: leaflet,
            spanduk: spanduk,
            billboard: billboard,
            jemensosprek: jemensosprek,
          });

          /**
           * Check data if exist set to array destroy
           */
          let checkExist = await Penyebaran.findAll({
            where: {
              polda_id: getIdPolda.dataValues.id,
              // polres_id: getIdPolres.dataValues.id,
              date: date,
            },
          });

          /**
           * Data Destroy & Update to new value
           */
          for (let i in checkExist) {
            if (checkExist[i].dataValues.id != null) {
              Destroy.push(checkExist[i].dataValues.id);
            }
          }
        }

        /**
         * Transaction process
         */
        await Penyebaran.destroy({
          where: { id: Destroy },
          transaction: transaction,
        });
        await Penyebaran.bulkCreate(Data, { transaction: transaction });
        await ImportFile.update(
          { status: 1 },
          { where: { id: source_id }, transaction: transaction }
        );
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * Function process sim
   */
  static sim = async (req, res) => {
    const transaction = await db.transaction();
    const param = req.body;
    const source_id = decAes(param.source_id);
    const value = param.value;

    try {
      /**
       * Validate parameter
       */

      const schema = {
        value: ["string", "array"],
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Data Payload
         */
        let Data = [];
        let Destroy = [];

        for (let i in value) {
          /**
           * Define Parameter
           */

          const polda_id = value[i].polda_id;
          // const polres_name = value[i].polres_name
          const date = value[i].date;
          const baru = 0;
          const perpanjangan = 0;
          const baru_a = value[i].baru_a;
          const baru_c = value[i].baru_c;
          const baru_c1 = value[i].baru_c1;
          const baru_c2 = value[i].baru_c2;

          const baru_d = value[i].baru_d;
          const baru_d1 = value[i].baru_d1;

          const perpanjangan_a = value[i].perpanjangan_a;
          const perpanjangan_au = value[i].perpanjangan_au;
          const perpanjangan_c = value[i].perpanjangan_c;
          const perpanjangan_c1 = value[i].perpanjangan_c1;
          const perpanjangan_c2 = value[i].perpanjangan_c2;
          const perpanjangan_d = value[i].perpanjangan_d;
          const perpanjangan_d1 = value[i].perpanjangan_d1;
          const perpanjangan_b1 = value[i].perpanjangan_b1;
          const perpanjangan_b1u = value[i].perpanjangan_b1u;
          const perpanjangan_b2 = value[i].perpanjangan_b2u;
          const perpanjangan_b2u = value[i].perpanjangan_b2u;

          const peningkatan_au = value[i].peningkatan_au;
          const peningkatan_b1 = value[i].peningkatan_b1;
          const peningkatan_b1u = value[i].peningkatan_b1u;
          const peningkatan_b2 = value[i].peningkatan_b2;
          const peningkatan_b2u = value[i].peningkatan_b2u;

          /**
           * Get ID Polda
           */
          let getIdPolda = await Poldaa.findOne({
            where: {
              name_polda: polda_id,
            },
          });

          /**
           * Get ID Polres
           */
          // let getIdPolres = await Polres.findOne({
          //     where: {
          //         name_polres: polres_name
          //     }
          // });

          /**
           * Data Payload
           */
          Data.push({
            polda_id: getIdPolda.dataValues.id,
            // polres_id: getIdPolres.dataValues.id,
            date: date,
            baru_a: baru_a,
            baru_c: baru_c,
            baru_c1: baru_c1,
            baru_c2: baru_c2,
            baru_d: baru_d,
            baru_d1: baru_d1,

            perpanjangan_a: perpanjangan_a,
            perpanjangan_au: perpanjangan_au,
            perpanjangan_c: perpanjangan_c,
            perpanjangan_c1: perpanjangan_c1,
            perpanjangan_c2: perpanjangan_c2,
            perpanjangan_d: perpanjangan_d,
            perpanjangan_d1: perpanjangan_d1,
            perpanjangan_b1: perpanjangan_b1,
            perpanjangan_b1u: perpanjangan_b1u,
            perpanjangan_b2: perpanjangan_b2,
            perpanjangan_b2u: perpanjangan_b2u,

            peningkatan_au: peningkatan_au,
            peningkatan_b1: peningkatan_b1,
            peningkatan_b1u: peningkatan_b1u,
            peningkatan_b2: peningkatan_b2,
            peningkatan_b2u: peningkatan_b2u,
          });

          /**
           * Check data if exist set to array destroy
           */
          let checkExist = await Sim.findAll({
            where: {
              polda_id: getIdPolda.dataValues.id,
              // polres_id: getIdPolres.dataValues.id,
              date: date,
            },
          });

          /**
           * Data Destroy & Update to new value
           */
          for (let i in checkExist) {
            if (checkExist[i].dataValues.id != null) {
              Destroy.push(checkExist[i].dataValues.id);
            }
          }
        }

        /**
         * Transaction process
         */
        await Sim.destroy({
          where: { id: Destroy },
          transaction: transaction,
        });
        await Sim.bulkCreate(Data, { transaction: transaction });
        await ImportFile.update(
          { status: 1 },
          { where: { id: source_id }, transaction: transaction }
        );
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * Function process bpkb
   */
  static bpkb = async (req, res) => {
    const transaction = await db.transaction();
    const param = req.body;
    const source_id = decAes(param.source_id);
    const value = param.value;
    try {
      /**
       * Validate parameter
       */

      const schema = {
        value: ["string", "array"],
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Data Payload
         */
        let Data = [];
        let Destroy = [];
        for (let i in value) {
          /**
           * Define Parameter
           */
          const polda_id = value[i].polda_id;
          // const polres_name = value[i].polres_name
          const date = value[i].date;
          const baru = value[i].baru;
          const perpanjangan = value[i].perpanjangan;

          const rubentina = value[i].rubentina;
          const bbn_1 = value[i].bbn_1;
          const bbn_2 = value[i].bbn_2;
          const mutasi_masuk = value[i].mutasi_masuk;
          const mutasi_keluar = value[i].mutasi_keluar;
          const perubahan_pergantian = value[i].perubahan_pergantian;

          /**
           * Get ID Polda
           */
          let getIdPolda = await Poldaa.findOne({
            where: {
              name_polda: polda_id,
            },
          });

          /**
           * Get ID Polres
           */
          // let getIdPolres = await Polres.findOne({
          //   where: {
          //     name_polres: polres_name,
          //   },
          // });

          /**
           * Data Payload
           */
          Data.push({
            polda_id: getIdPolda.dataValues.id,
            // polres_id: getIdPolres.dataValues.id,
            date: date,
            baru: baru,
            perpanjangan: perpanjangan,
            rubentina: rubentina,
            bbn_1: bbn_1,
            bbn_2: bbn_2,
            mutasi_masuk: mutasi_masuk,
            mutasi_keluar: mutasi_keluar,
            perubahan_pergantian: perubahan_pergantian,
          });

          /**
           * Check data if exist set to array destroy
           */
          let checkExist = await Bpkb.findAll({
            where: {
              polda_id: getIdPolda.dataValues.id,
              // polres_id: getIdPolres.dataValues.id,
              date: date,
            },
          });

          /**
           * Data Destroy & Update to new value
           */
          for (let i in checkExist) {
            if (checkExist[i].dataValues.id != null) {
              Destroy.push(checkExist[i].dataValues.id);
            }
          }
        }

        /**
         * Transaction process
         */
        await Bpkb.destroy({
          where: { id: Destroy },
          transaction: transaction,
        });
        await Bpkb.bulkCreate(Data, { transaction: transaction });
        await ImportFile.update(
          { status: 1 },
          { where: { id: source_id }, transaction: transaction }
        );
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * Function process ranmor
   */
  static ranmor = async (req, res) => {
    const transaction = await db.transaction();
    const param = req.body;
    const source_id = decAes(param.source_id);
    const value = param.value;
    try {
      /**
       * Validate parameter
       */

      const schema = {
        value: ["string", "array"],
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Data Payload
         */
        let Data = [];
        let Destroy = [];
        for (let i in value) {
          /**
           * Define Parameter
           */
          const polda_id = value[i].polda_id;
          // const polres_name = value[i].polres_name
          const date = value[i].date;
          const mobil_penumpang = value[i].mobil_penumpang;
          const mobil_barang = value[i].mobil_barang;
          const mobil_bus = value[i].mobil_bus;
          const ransus = value[i].ransus;
          const sepeda_motor = value[i].sepeda_motor;

          /**
           * Get ID Polda
           */
          let getIdPolda = await Poldaa.findOne({
            where: {
              name_polda: polda_id,
            },
          });

          /**
           * Get ID Polres
           */
          // let getIdPolres = await Polres.findOne({
          //     where: {
          //         name_polres: polres_name
          //     }
          // });

          /**
           * Data Payload
           */
          Data.push({
            polda_id: getIdPolda.dataValues.id,
            // polres_id: getIdPolres.dataValues.id,
            date: date,
            mobil_penumpang: mobil_penumpang,
            mobil_barang: mobil_barang,
            mobil_bus: mobil_bus,
            ransus: ransus,
            sepeda_motor: sepeda_motor,
          });

          /**
           * Check data if exist set to array destroy
           */
          let checkExist = await Ranmor.findAll({
            where: {
              polda_id: getIdPolda.dataValues.id,
              // polres_id: getIdPolres.dataValues.id,
              date: date,
            },
          });

          /**
           * Data Destroy & Update to new value
           */
          for (let i in checkExist) {
            if (checkExist[i].dataValues.id != null) {
              Destroy.push(checkExist[i].dataValues.id);
            }
          }
        }

        /**
         * Transaction process
         */
        await Ranmor.destroy({
          where: { id: Destroy },
          transaction: transaction,
        });
        await Ranmor.bulkCreate(Data, { transaction: transaction });
        await ImportFile.update(
          { status: 1 },
          { where: { id: source_id }, transaction: transaction }
        );
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * Function process stnk
   */
  static stnk = async (req, res) => {
    const transaction = await db.transaction();
    const param = req.body;
    const source_id = decAes(param.source_id);
    const value = param.value;
    try {
      /**
       * Validate parameter
       */

      const schema = {
        value: ["string", "array"],
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Data Payload
         */
        let Data = [];
        let Destroy = [];
        for (let i in value) {
          /**
           * Define Parameter
           */
          const polda_id = value[i].polda_id;
          // const polres_name = value[i].polres_name
          const date = value[i].date;
          const baru = value[i].baru;
          const perpanjangan = value[i].perpanjangan;
          const rubentina = value[i].rubentina;
          const bbn_1_r2 = value[i].bbn_1_r2;
          const bbn_1_r4 = value[i].bbn_1_r4;
          const perubahan_r2 = value[i].perubahan_r2;
          const perubahan_r4 = value[i].perubahan_r4;
          const perpanjangan_r2 = value[i].perpanjangan_r2;
          const perpanjangan_r4 = value[i].perpanjangan_r4;
          const mutasi_keluar_r2 = value[i].mutasi_keluar_r2;
          const mutasi_keluar_r4 = value[i].mutasi_keluar_r4;
          const mutasi_masuk_r2 = value[i].mutasi_masuk_r2;
          const mutasi_masuk_r4 = value[i].mutasi_masuk_r4;
          const pengesahan_r2 = value[i].pengesahan_r2;
          const pengesahan_r4 = value[i].pengesahan_r4;
          const samolnas_r2 = value[i].samolnas_r2;
          const samolnas_r4 = value[i].samolnas_r4;

          /**
           * Get ID Polda
           */
          let getIdPolda = await Poldaa.findOne({
            where: {
              name_polda: polda_id,
            },
          });

          /**
           * Get ID Polres
           */
          // let getIdPolres = await Polres.findOne({
          //     where: {
          //         name_polres: polres_name
          //     }
          // });

          /**
           * Data Payload
           */
          Data.push({
            polda_id: getIdPolda.dataValues.id,
            // polres_id: getIdPolres.dataValues.id,
            date: date,
            baru: baru,
            perpanjangan: perpanjangan,
            rubentina: rubentina,
            bbn_1_r2: bbn_1_r2,
            bbn_1_r4: bbn_1_r4,
            perubahan_r2: perubahan_r2,
            perubahan_r4: perubahan_r4,
            perpanjangan_r2: perpanjangan_r2,
            perpanjangan_r4: perpanjangan_r4,
            mutasi_keluar_r2: mutasi_keluar_r2,
            mutasi_keluar_r4: mutasi_keluar_r4,
            mutasi_masuk_r2: mutasi_masuk_r2,
            mutasi_masuk_r4: mutasi_masuk_r4,
            pengesahan_r2: pengesahan_r2,
            pengesahan_r4: pengesahan_r4,
            samolnas_r2: samolnas_r2,
            samolnas_r4: samolnas_r4,
          });

          /**
           * Check data if exist set to array destroy
           */
          let checkExist = await Stnk.findAll({
            where: {
              polda_id: getIdPolda.dataValues.id,
              // polres_id: getIdPolres.dataValues.id,
              date: date,
            },
          });

          /**
           * Data Destroy & Update to new value
           */
          for (let i in checkExist) {
            if (checkExist[i].dataValues.id != null) {
              Destroy.push(checkExist[i].dataValues.id);
            }
          }
        }

        /**
         * Transaction process
         */
        await Stnk.destroy({
          where: { id: Destroy },
          transaction: transaction,
        });
        await Stnk.bulkCreate(Data, { transaction: transaction });
        await ImportFile.update(
          { status: 1 },
          { where: { id: source_id }, transaction: transaction }
        );
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * [END]
   * SECTION IMPORT LAPORAN HARIAN
   */

  /**
   * ===============================================================================================================================
   */

  /**
   * SECTION IMPORT LAPORAN OPERASI KHUSUS
   * [BEGIN]
   */

  /**
   * Function process import file
   */
  static operasi = async (req, res) => {
    const transaction = await db.transaction();
    try {
      /**
       * Validate parameter
       */

      const schema = {
        operasi_id: { type: "string" },
        jenis_satker: { type: "string" },
        jenis_laporan: { type: "string" },
        tanggal: { type: "string" },
        file_name: { type: "string" },
        file_client_name: { type: "string" },
        file_ext: { type: "string" },
        file_type: { type: "string" },
        status: { type: "string" },
        imported_by: { type: "string" },
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Parameter
         */
        const operasi_id = req.body.operasi_id;
        const jenis_satker = req.body.jenis_satker;
        const jenis_laporan = req.body.jenis_laporan;
        const tanggal = req.body.tanggal;
        const file_name = req.body.file_name;
        const file_client_name = req.body.file_client_name;
        const file_ext = req.body.file_ext;
        const file_type = req.body.file_type;
        const status = req.body.status;
        const imported_by = req.body.imported_by;

        /**
         * Data Payload
         */
        const Data = {
          operasi_id: decAes(operasi_id),
          jenis_satker: jenis_satker,
          jenis_laporan: jenis_laporan,
          tanggal: tanggal,
          file_name: file_name,
          file_client_name: file_client_name,
          file_ext: file_ext,
          file_type: file_type,
          status: status,
          imported_by: decAes(imported_by),
        };

        /**
         * Transaction process
         */
        await ImportFileOps.create(Data, { transaction: transaction });
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  static rmfileops = async (req, res) => {
    const transaction = await db.transaction();
    try {
      /**
       * Validate parameter
       */

      const schema = {
        id: { type: "string" },
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Parameter
         */
        const id = decAes(req.body.id);

        /**
         * Transaction process
         */
        await ImportFileOps.destroy({
          where: { id: id },
          transaction: transaction,
        });
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * Function list of data import
   */
  static listops = async (req, res) => {
    try {
      const {
        length = 10,
        start = 0,
        serverSide = null,
        search = null,
        filter = [],
        filterSearch = [],
        order = 0,
        orderDirection = "asc",
      } = req.query;

      const modelAttr = Object.keys(ImportFileOps.getAttributes());
      let getDataRules = { where: null };

      if (serverSide?.toLowerCase() === "true") {
        getDataRules.limit = length;
        getDataRules.offset = start;
      }

      if (order <= modelAttr.length) {
        getDataRules.order = [[modelAttr[order], orderDirection.toUpperCase()]];
      }

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
        getDataRules.where = {
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
        getDataRules.where = {
          ...getDataRules.where,
          ...filters,
        };
      }

      const data = await ImportFileOps.findAll(getDataRules);
      const count = await ImportFileOps.count({
        where: getDataRules?.where,
      });

      response(res, true, "Succeed", {
        data,
        recordsFiltered: count,
        recordsTotal: count,
      });
    } catch (e) {
      response(res, false, "Failed", e.message);
    }
  };

  /**
   * Function process langgarlantas
   */
  static langgarlantas = async (req, res) => {
    const transaction = await db.transaction();
    const param = req.body;
    const source_id = decAes(param.source_id);
    const value = param.value;
    try {
      /**
       * Validate parameter
       */

      const schema = {
        value: ["string", "array"],
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Data Payload
         */
        let Data = [];
        let Destroy = [];
        for (let i in value) {
          /**
           * Define Parameter
           */
          const polda_id = value[i].polda_id;
          // const polres_name = value[i].polres_name
          const operasi_id = value[i].operasi_id;
          const date = value[i].date;
          const statis = value[i].statis;
          const mobile = value[i].mobile;
          const teguran = value[i].teguran;
          const pelanggaran_berat = value[i].pelanggaran_berat;
          const pelanggaran_sedang = value[i].pelanggaran_sedang;
          const pelanggaran_ringan = value[i].pelanggaran_ringan;

          /**
           * Get ID Polda
           */
          let getIdPolda = await Poldaa.findOne({
            where: {
              name_polda: polda_id,
            },
          });

          /**
           * Get ID Polres
           */
          //  let getIdPolres = await Polres.findOne({
          //     where: {
          //         name_polres: polres_name
          //     }
          // });

          /**
           * Data Payload
           */
          Data.push({
            polda_id: getIdPolda.dataValues.id,
            // polres_id: getIdPolres.dataValues.id,
            operasi_id: operasi_id,
            date: date,
            statis: statis,
            mobile: mobile,
            teguran: teguran,
            pelanggaran_berat: pelanggaran_berat,
            pelanggaran_sedang: pelanggaran_sedang,
            pelanggaran_ringan: pelanggaran_ringan,
          });

          /**
           * Check data if exist set to array destroy
           */
          let checkExist = await Langgarlantas.findAll({
            where: {
              polda_id: getIdPolda.dataValues.id,
              // polres_id: getIdPolres.dataValues.id,
              operasi_id: operasi_id,
              date: date,
            },
          });

          /**
           * Data Destroy & Update to new value
           */
          for (let i in checkExist) {
            if (checkExist[i].dataValues.id != null) {
              Destroy.push(checkExist[i].dataValues.id);
            }
          }
        }

        /**
         * Transaction process
         */
        await Langgarlantas.destroy({
          where: { id: Destroy },
          transaction: transaction,
        });
        await Langgarlantas.bulkCreate(Data, { transaction: transaction });
        await ImportFileOps.update(
          { status: 1 },
          { where: { id: source_id }, transaction: transaction }
        );
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * Function process langgarmotor
   */
  static langgarmotor = async (req, res) => {
    const transaction = await db.transaction();
    const param = req.body;
    const source_id = decAes(param.source_id);
    const value = param.value;
    try {
      /**
       * Validate parameter
       */

      const schema = {
        value: ["string", "array"],
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Data Payload
         */
        let Data = [];
        let Destroy = [];
        for (let i in value) {
          /**
           * Define Parameter
           */
          const polda_id = value[i].polda_id;
          // const polres_name = value[i].polres_name
          const operasi_id = value[i].operasi_id;
          const date = value[i].date;
          const tanpa_helm = value[i].tanpa_helm;
          const lawan_arus = value[i].lawan_arus;
          const bermain_hp = value[i].bermain_hp;
          const pengaruh_alkohol = value[i].pengaruh_alkohol;
          const max_kecepatan = value[i].max_kecepatan;
          const dibawah_umur = value[i].dibawah_umur;
          const lain_lain = value[i].lain_lain;

          /**
           * Get ID Polda
           */
          let getIdPolda = await Poldaa.findOne({
            where: {
              name_polda: polda_id,
            },
          });

          /**
           * Get ID Polres
           */
          //  let getIdPolres = await Polres.findOne({
          //     where: {
          //         name_polres: polres_name
          //     }
          // });

          /**
           * Data Payload
           */
          Data.push({
            polda_id: getIdPolda.dataValues.id,
            // polres_id: getIdPolres.dataValues.id,
            operasi_id: operasi_id,
            date: date,
            tanpa_helm: tanpa_helm,
            lawan_arus: lawan_arus,
            bermain_hp: bermain_hp,
            pengaruh_alkohol: pengaruh_alkohol,
            max_kecepatan: max_kecepatan,
            dibawah_umur: dibawah_umur,
            lain_lain: lain_lain,
          });

          /**
           * Check data if exist set to array destroy
           */
          let checkExist = await Langgarmotor.findAll({
            where: {
              polda_id: getIdPolda.dataValues.id,
              // polres_id: getIdPolres.dataValues.id,
              operasi_id: operasi_id,
              date: date,
            },
          });

          /**
           * Data Destroy & Update to new value
           */
          for (let i in checkExist) {
            if (checkExist[i].dataValues.id != null) {
              Destroy.push(checkExist[i].dataValues.id);
            }
          }
        }

        /**
         * Transaction process
         */
        await Langgarmotor.destroy({
          where: { id: Destroy },
          transaction: transaction,
        });
        await Langgarmotor.bulkCreate(Data, { transaction: transaction });
        await ImportFileOps.update(
          { status: 1 },
          { where: { id: source_id }, transaction: transaction }
        );
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * Function process langgarmobil
   */
  static langgarmobil = async (req, res) => {
    const transaction = await db.transaction();
    const param = req.body;
    const source_id = decAes(param.source_id);
    const value = param.value;
    try {
      /**
       * Validate parameter
       */

      const schema = {
        value: ["string", "array"],
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Data Payload
         */
        let Data = [];
        let Destroy = [];
        for (let i in value) {
          /**
           * Define Parameter
           */
          const polda_id = value[i].polda_id;
          // const polres_name = value[i].polres_name
          const operasi_id = value[i].operasi_id;
          const date = value[i].date;
          const lawan_arus = value[i].lawan_arus;
          const bermain_hp = value[i].bermain_hp;
          const pengaruh_alkohol = value[i].pengaruh_alkohol;
          const max_kecepatan = value[i].max_kecepatan;
          const dibawah_umur = value[i].dibawah_umur;
          const tanpa_sabuk = value[i].tanpa_sabuk;
          const lain_lain = value[i].lain_lain;

          /**
           * Get ID Polda
           */
          let getIdPolda = await Poldaa.findOne({
            where: {
              name_polda: polda_id,
            },
          });

          /**
           * Get ID Polres
           */
          //  let getIdPolres = await Polres.findOne({
          //     where: {
          //         name_polres: polres_name
          //     }
          // });

          /**
           * Data Payload
           */
          Data.push({
            polda_id: getIdPolda.dataValues.id,
            // polres_id: getIdPolres.dataValues.id,
            operasi_id: operasi_id,
            date: date,
            lawan_arus: lawan_arus,
            bermain_hp: bermain_hp,
            pengaruh_alkohol: pengaruh_alkohol,
            max_kecepatan: max_kecepatan,
            dibawah_umur: dibawah_umur,
            tanpa_sabuk: tanpa_sabuk,
            lain_lain: lain_lain,
          });

          /**
           * Check data if exist set to array destroy
           */
          let checkExist = await Langgarmobil.findAll({
            where: {
              polda_id: getIdPolda.dataValues.id,
              // polres_id: getIdPolres.dataValues.id,
              operasi_id: operasi_id,
              date: date,
            },
          });

          /**
           * Data Destroy & Update to new value
           */
          for (let i in checkExist) {
            if (checkExist[i].dataValues.id != null) {
              Destroy.push(checkExist[i].dataValues.id);
            }
          }
        }

        /**
         * Transaction process
         */
        await Langgarmobil.destroy({
          where: { id: Destroy },
          transaction: transaction,
        });
        await Langgarmobil.bulkCreate(Data, { transaction: transaction });
        await ImportFileOps.update(
          { status: 1 },
          { where: { id: source_id }, transaction: transaction }
        );
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * Function process barangbukti
   */
  static barangbukti = async (req, res) => {
    const transaction = await db.transaction();
    const param = req.body;
    const source_id = decAes(param.source_id);
    const value = param.value;
    try {
      /**
       * Validate parameter
       */

      const schema = {
        value: ["string", "array"],
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Data Payload
         */
        let Data = [];
        let Destroy = [];
        for (let i in value) {
          /**
           * Define Parameter
           */
          const polda_id = value[i].polda_id;
          // const polres_name = value[i].polres_name
          const operasi_id = value[i].operasi_id;
          const date = value[i].date;
          const sim = value[i].sim;
          const stnk = value[i].stnk;
          const kendaraan_bermotor = value[i].kendaraan_bermotor;

          /**
           * Get ID Polda
           */
          let getIdPolda = await Poldaa.findOne({
            where: {
              name_polda: polda_id,
            },
          });

          /**
           * Get ID Polres
           */
          //  let getIdPolres = await Polres.findOne({
          //     where: {
          //         name_polres: polres_name
          //     }
          // });

          /**
           * Data Payload
           */
          Data.push({
            polda_id: getIdPolda.dataValues.id,
            // polres_id: getIdPolres.dataValues.id,
            operasi_id: operasi_id,
            date: date,
            sim: sim,
            stnk: stnk,
            kendaraan_bermotor: kendaraan_bermotor,
          });

          /**
           * Check data if exist set to array destroy
           */
          let checkExist = await Barangbukti.findAll({
            where: {
              polda_id: getIdPolda.dataValues.id,
              // polres_id: getIdPolres.dataValues.id,
              operasi_id: operasi_id,
              date: date,
            },
          });

          /**
           * Data Destroy & Update to new value
           */
          for (let i in checkExist) {
            if (checkExist[i].dataValues.id != null) {
              Destroy.push(checkExist[i].dataValues.id);
            }
          }
        }

        /**
         * Transaction process
         */
        await Barangbukti.destroy({
          where: { id: Destroy },
          transaction: transaction,
        });
        await Barangbukti.bulkCreate(Data, { transaction: transaction });
        await ImportFileOps.update(
          { status: 1 },
          { where: { id: source_id }, transaction: transaction }
        );
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * Function process kendaraanterlibat
   */
  static kendaraanterlibat = async (req, res) => {
    const transaction = await db.transaction();
    const param = req.body;
    const source_id = decAes(param.source_id);
    const value = param.value;
    try {
      /**
       * Validate parameter
       */

      const schema = {
        value: ["string", "array"],
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Data Payload
         */
        let Data = [];
        let Destroy = [];
        for (let i in value) {
          /**
           * Define Parameter
           */
          const polda_id = value[i].polda_id;
          // const polres_name = value[i].polres_name
          const operasi_id = value[i].operasi_id;
          const date = value[i].date;
          const sepeda_motor = value[i].sepeda_motor;
          const mobil_penumpang = value[i].mobil_penumpang;
          const bus = value[i].bus;
          const mobil_barang = value[i].mobil_barang;
          const ransus = value[i].ransus;

          /**
           * Get ID Polda
           */
          let getIdPolda = await Poldaa.findOne({
            where: {
              name_polda: polda_id,
            },
          });

          /**
           * Get ID Polres
           */
          //  let getIdPolres = await Polres.findOne({
          //     where: {
          //         name_polres: polres_name
          //     }
          // });

          /**
           * Data Payload
           */
          Data.push({
            polda_id: getIdPolda.dataValues.id,
            // polres_id: getIdPolres.dataValues.id,
            operasi_id: operasi_id,
            date: date,
            sepeda_motor: sepeda_motor,
            mobil_penumpang: mobil_penumpang,
            bus: bus,
            mobil_barang: mobil_barang,
            ransus: ransus,
          });

          /**
           * Check data if exist set to array destroy
           */
          let checkExist = await Kendaraanterlibat.findAll({
            where: {
              polda_id: getIdPolda.dataValues.id,
              // polres_id: getIdPolres.dataValues.id,
              operasi_id: operasi_id,
              date: date,
            },
          });

          /**
           * Data Destroy & Update to new value
           */
          for (let i in checkExist) {
            if (checkExist[i].dataValues.id != null) {
              Destroy.push(checkExist[i].dataValues.id);
            }
          }
        }

        /**
         * Transaction process
         */
        await Kendaraanterlibat.destroy({
          where: { id: Destroy },
          transaction: transaction,
        });
        await Kendaraanterlibat.bulkCreate(Data, { transaction: transaction });
        await ImportFileOps.update(
          { status: 1 },
          { where: { id: source_id }, transaction: transaction }
        );
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * Function process profesipelaku
   */
  static profesipelaku = async (req, res) => {
    const transaction = await db.transaction();
    const param = req.body;
    const source_id = decAes(param.source_id);
    const value = param.value;
    try {
      /**
       * Validate parameter
       */

      const schema = {
        value: ["string", "array"],
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Data Payload
         */
        let Data = [];
        let Destroy = [];
        for (let i in value) {
          /**
           * Define Parameter
           */
          const polda_id = value[i].polda_id;
          // const polres_name = value[i].polres_name
          const operasi_id = value[i].operasi_id;
          const date = value[i].date;
          const pns = value[i].pns;
          const karyawan = value[i].karyawan;
          const mahasiswa_pelajar = value[i].mahasiswa_pelajar;
          const pengemudi = value[i].pengemudi;
          const tni = value[i].tni;
          const polri = value[i].polri;
          const lain_lain = value[i].lain_lain;

          /**
           * Get ID Polda
           */
          let getIdPolda = await Poldaa.findOne({
            where: {
              name_polda: polda_id,
            },
          });

          /**
           * Get ID Polres
           */
          //  let getIdPolres = await Polres.findOne({
          //     where: {
          //         name_polres: polres_name
          //     }
          // });

          /**
           * Data Payload
           */
          Data.push({
            polda_id: getIdPolda.dataValues.id,
            // polres_id: getIdPolres.dataValues.id,
            operasi_id: operasi_id,
            date: date,
            pns: pns,
            karyawan: karyawan,
            mahasiswa_pelajar: mahasiswa_pelajar,
            pengemudi: pengemudi,
            tni: tni,
            polri: polri,
            lain_lain: lain_lain,
          });

          /**
           * Check data if exist set to array destroy
           */
          let checkExist = await Profesipelaku.findAll({
            where: {
              polda_id: getIdPolda.dataValues.id,
              // polres_id: getIdPolres.dataValues.id,
              operasi_id: operasi_id,
              date: date,
            },
          });

          /**
           * Data Destroy & Update to new value
           */
          for (let i in checkExist) {
            if (checkExist[i].dataValues.id != null) {
              Destroy.push(checkExist[i].dataValues.id);
            }
          }
        }

        /**
         * Transaction process
         */
        await Profesipelaku.destroy({
          where: { id: Destroy },
          transaction: transaction,
        });
        await Profesipelaku.bulkCreate(Data, { transaction: transaction });
        await ImportFileOps.update(
          { status: 1 },
          { where: { id: source_id }, transaction: transaction }
        );
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * Function process usia
   */
  static usia = async (req, res) => {
    const transaction = await db.transaction();
    const param = req.body;
    const source_id = decAes(param.source_id);
    const value = param.value;
    try {
      /**
       * Validate parameter
       */

      const schema = {
        value: ["string", "array"],
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Data Payload
         */
        let Data = [];
        let Destroy = [];
        for (let i in value) {
          /**
           * Define Parameter
           */
          const polda_id = value[i].polda_id;
          // const polres_name = value[i].polres_name
          const operasi_id = value[i].operasi_id;
          const date = value[i].date;
          const max_15 = value[i].max_15;
          const max_20 = value[i].max_20;
          const max_25 = value[i].max_25;
          const max_30 = value[i].max_30;
          const max_35 = value[i].max_35;
          const max_40 = value[i].max_40;
          const max_45 = value[i].max_45;
          const max_50 = value[i].max_50;
          const max_55 = value[i].max_55;
          const max_60 = value[i].max_60;
          const lain_lain = value[i].lain_lain;

          /**
           * Get ID Polda
           */
          let getIdPolda = await Poldaa.findOne({
            where: {
              name_polda: polda_id,
            },
          });

          /**
           * Get ID Polres
           */
          //  let getIdPolres = await Polres.findOne({
          //     where: {
          //         name_polres: polres_name
          //     }
          // });

          /**
           * Data Payload
           */
          Data.push({
            polda_id: getIdPolda.dataValues.id,
            // polres_id: getIdPolres.dataValues.id,
            operasi_id: operasi_id,
            date: date,
            max_15: max_15,
            max_20: max_20,
            max_25: max_25,
            max_30: max_30,
            max_35: max_35,
            max_40: max_40,
            max_45: max_45,
            max_50: max_50,
            max_55: max_55,
            max_60: max_60,
            lain_lain: lain_lain,
          });

          /**
           * Check data if exist set to array destroy
           */
          let checkExist = await Usia.findAll({
            where: {
              polda_id: getIdPolda.dataValues.id,
              // polres_id: getIdPolres.dataValues.id,
              operasi_id: operasi_id,
              date: date,
            },
          });

          /**
           * Data Destroy & Update to new value
           */
          for (let i in checkExist) {
            if (checkExist[i].dataValues.id != null) {
              Destroy.push(checkExist[i].dataValues.id);
            }
          }
        }

        /**
         * Transaction process
         */
        await Usia.destroy({
          where: { id: Destroy },
          transaction: transaction,
        });
        await Usia.bulkCreate(Data, { transaction: transaction });
        await ImportFileOps.update(
          { status: 1 },
          { where: { id: source_id }, transaction: transaction }
        );
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * Function process simpelaku
   */
  static simpelaku = async (req, res) => {
    const transaction = await db.transaction();
    const param = req.body;
    const source_id = decAes(param.source_id);
    const value = param.value;
    try {
      /**
       * Validate parameter
       */

      const schema = {
        value: ["string", "array"],
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Data Payload
         */
        let Data = [];
        let Destroy = [];
        for (let i in value) {
          /**
           * Define Parameter
           */
          const polda_id = value[i].polda_id;
          // const polres_name = value[i].polres_name
          const operasi_id = value[i].operasi_id;
          const date = value[i].date;
          const sim_a = value[i].sim_a;
          const sim_a_umum = value[i].sim_a_umum;
          const sim_b = value[i].sim_b;
          const sim_b_satu_umum = value[i].sim_b_satu_umum;
          const sim_b_dua = value[i].sim_b_dua;
          const sim_b_dua_umum = value[i].sim_b_dua_umum;
          const sim_c = value[i].sim_c;
          const sim_d = value[i].sim_d;
          const sim_internasional = value[i].sim_internasional;
          const tanpa_sim = value[i].tanpa_sim;

          /**
           * Get ID Polda
           */
          let getIdPolda = await Poldaa.findOne({
            where: {
              name_polda: polda_id,
            },
          });

          /**
           * Get ID Polres
           */
          //  let getIdPolres = await Polres.findOne({
          //     where: {
          //         name_polres: polres_name
          //     }
          // });

          /**
           * Data Payload
           */
          Data.push({
            polda_id: getIdPolda.dataValues.id,
            // polres_id: getIdPolres.dataValues.id,
            operasi_id: operasi_id,
            date: date,
            sim_a: sim_a,
            sim_a_umum: sim_a_umum,
            sim_b: sim_b,
            sim_b_satu_umum: sim_b_satu_umum,
            sim_b_dua: sim_b_dua,
            sim_b_dua_umum: sim_b_dua_umum,
            sim_c: sim_c,
            sim_d: sim_d,
            sim_internasional: sim_internasional,
            tanpa_sim: tanpa_sim,
          });

          /**
           * Check data if exist set to array destroy
           */
          let checkExist = await Simpelaku.findAll({
            where: {
              polda_id: getIdPolda.dataValues.id,
              // polres_id: getIdPolres.dataValues.id,
              operasi_id: operasi_id,
              date: date,
            },
          });

          /**
           * Data Destroy & Update to new value
           */
          for (let i in checkExist) {
            if (checkExist[i].dataValues.id != null) {
              Destroy.push(checkExist[i].dataValues.id);
            }
          }
        }

        /**
         * Transaction process
         */
        await Simpelaku.destroy({
          where: { id: Destroy },
          transaction: transaction,
        });
        await Simpelaku.bulkCreate(Data, { transaction: transaction });
        await ImportFileOps.update(
          { status: 1 },
          { where: { id: source_id }, transaction: transaction }
        );
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * Function process lokasikawasan
   */
  static lokasikawasan = async (req, res) => {
    const transaction = await db.transaction();
    const param = req.body;
    const source_id = decAes(param.source_id);
    const value = param.value;
    try {
      /**
       * Validate parameter
       */

      const schema = {
        value: ["string", "array"],
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Data Payload
         */
        let Data = [];
        let Destroy = [];
        for (let i in value) {
          /**
           * Define Parameter
           */
          const polda_id = value[i].polda_id;
          // const polres_name = value[i].polres_name
          const operasi_id = value[i].operasi_id;
          const date = value[i].date;
          const pemukiman = value[i].pemukiman;
          const perbelanjaan = value[i].perbelanjaan;
          const perkantoran = value[i].perkantoran;
          const wisata = value[i].wisata;
          const industri = value[i].industri;

          /**
           * Get ID Polda
           */
          let getIdPolda = await Poldaa.findOne({
            where: {
              name_polda: polda_id,
            },
          });

          /**
           * Get ID Polres
           */
          //  let getIdPolres = await Polres.findOne({
          //     where: {
          //         name_polres: polres_name
          //     }
          // });

          /**
           * Data Payload
           */
          Data.push({
            polda_id: getIdPolda.dataValues.id,
            // polres_id: getIdPolres.dataValues.id,
            operasi_id: operasi_id,
            date: date,
            pemukiman: pemukiman,
            perbelanjaan: perbelanjaan,
            perkantoran: perkantoran,
            wisata: wisata,
            industri: industri,
          });

          /**
           * Check data if exist set to array destroy
           */
          let checkExist = await Lokasikawasan.findAll({
            where: {
              polda_id: getIdPolda.dataValues.id,
              // polres_id: getIdPolres.dataValues.id,
              operasi_id: operasi_id,
              date: date,
            },
          });

          /**
           * Data Destroy & Update to new value
           */
          for (let i in checkExist) {
            if (checkExist[i].dataValues.id != null) {
              Destroy.push(checkExist[i].dataValues.id);
            }
          }
        }

        /**
         * Transaction process
         */
        await Lokasikawasan.destroy({
          where: { id: Destroy },
          transaction: transaction,
        });
        await Lokasikawasan.bulkCreate(Data, { transaction: transaction });
        await ImportFileOps.update(
          { status: 1 },
          { where: { id: source_id }, transaction: transaction }
        );
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * Function process statusjalan
   */
  static statusjalan = async (req, res) => {
    const transaction = await db.transaction();
    const param = req.body;
    const source_id = decAes(param.source_id);
    const value = param.value;
    try {
      /**
       * Validate parameter
       */

      const schema = {
        value: ["string", "array"],
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Data Payload
         */
        let Data = [];
        let Destroy = [];
        for (let i in value) {
          /**
           * Define Parameter
           */
          const polda_id = value[i].polda_id;
          // const polres_name = value[i].polres_name
          const operasi_id = value[i].operasi_id;
          const date = value[i].date;
          const nasional = value[i].nasional;
          const provinsi = value[i].provinsi;
          const kab_kota = value[i].kab_kota;
          const desa_lingkungan = value[i].desa_lingkungan;

          /**
           * Get ID Polda
           */
          let getIdPolda = await Poldaa.findOne({
            where: {
              name_polda: polda_id,
            },
          });

          /**
           * Get ID Polres
           */
          //  let getIdPolres = await Polres.findOne({
          //     where: {
          //         name_polres: polres_name
          //     }
          // });

          /**
           * Data Payload
           */
          Data.push({
            polda_id: getIdPolda.dataValues.id,
            // polres_id: getIdPolres.dataValues.id,
            operasi_id: operasi_id,
            date: date,
            nasional: nasional,
            provinsi: provinsi,
            kab_kota: kab_kota,
            desa_lingkungan: desa_lingkungan,
          });

          /**
           * Check data if exist set to array destroy
           */
          let checkExist = await Statusjalan.findAll({
            where: {
              polda_id: getIdPolda.dataValues.id,
              // polres_id: getIdPolres.dataValues.id,
              operasi_id: operasi_id,
              date: date,
            },
          });

          /**
           * Data Destroy & Update to new value
           */
          for (let i in checkExist) {
            if (checkExist[i].dataValues.id != null) {
              Destroy.push(checkExist[i].dataValues.id);
            }
          }
        }

        /**
         * Transaction process
         */
        await Statusjalan.destroy({
          where: { id: Destroy },
          transaction: transaction,
        });
        await Statusjalan.bulkCreate(Data, { transaction: transaction });
        await ImportFileOps.update(
          { status: 1 },
          { where: { id: source_id }, transaction: transaction }
        );
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * Function process dikmaslantasops
   */
  static dikmaslantasops = async (req, res) => {
    const transaction = await db.transaction();
    const param = req.body;
    const source_id = decAes(param.source_id);
    const value = param.value;
    try {
      /**
       * Validate parameter
       */

      const schema = {
        value: ["string", "array"],
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Data Payload
         */
        let Data = [];
        let Destroy = [];
        for (let i in value) {
          /**
           * Define Parameter
           */
          const polda_id = value[i].polda_id;
          // const polres_name = value[i].polres_name
          const operasi_id = value[i].operasi_id;
          const date = value[i].date;
          const media_cetak = value[i].media_cetak;
          const media_elektronik = value[i].media_elektronik;
          const media_sosial = value[i].media_sosial;
          const laka_langgar = value[i].laka_langgar;

          /**
           * Get ID Polda
           */
          let getIdPolda = await Poldaa.findOne({
            where: {
              name_polda: polda_id,
            },
          });

          /**
           * Get ID Polres
           */
          //  let getIdPolres = await Polres.findOne({
          //     where: {
          //         name_polres: polres_name
          //     }
          // });

          /**
           * Data Payload
           */
          Data.push({
            polda_id: getIdPolda.dataValues.id,
            // polres_id: getIdPolres.dataValues.id,
            operasi_id: operasi_id,
            date: date,
            media_cetak: media_cetak,
            media_elektronik: media_elektronik,
            media_sosial: media_sosial,
            laka_langgar: laka_langgar,
          });

          /**
           * Check data if exist set to array destroy
           */
          let checkExist = await Dikmaslantasops.findAll({
            where: {
              polda_id: getIdPolda.dataValues.id,
              // polres_id: getIdPolres.dataValues.id,
              operasi_id: operasi_id,
              date: date,
            },
          });

          /**
           * Data Destroy & Update to new value
           */
          for (let i in checkExist) {
            if (checkExist[i].dataValues.id != null) {
              Destroy.push(checkExist[i].dataValues.id);
            }
          }
        }

        /**
         * Transaction process
         */
        await Dikmaslantasops.destroy({
          where: { id: Destroy },
          transaction: transaction,
        });
        await Dikmaslantasops.bulkCreate(Data, { transaction: transaction });
        await ImportFileOps.update(
          { status: 1 },
          { where: { id: source_id }, transaction: transaction }
        );
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * Function process giatlantas
   */
  static giatlantas = async (req, res) => {
    const transaction = await db.transaction();
    const param = req.body;
    const source_id = decAes(param.source_id);
    const value = param.value;
    try {
      /**
       * Validate parameter
       */

      const schema = {
        value: ["string", "array"],
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Data Payload
         */
        let Data = [];
        let Destroy = [];
        for (let i in value) {
          /**
           * Define Parameter
           */
          const polda_id = value[i].polda_id;
          // const polres_name = value[i].polres_name
          const operasi_id = value[i].operasi_id;
          const date = value[i].date;
          const pengaturan = value[i].pengaturan;
          const penjagaan = value[i].penjagaan;
          const pengawalan = value[i].pengawalan;
          const patroli = value[i].patroli;

          /**
           * Get ID Polda
           */
          let getIdPolda = await Poldaa.findOne({
            where: {
              name_polda: polda_id,
            },
          });

          /**
           * Get ID Polres
           */
          //  let getIdPolres = await Polres.findOne({
          //     where: {
          //         name_polres: polres_name
          //     }
          // });

          /**
           * Data Payload
           */
          Data.push({
            polda_id: getIdPolda.dataValues.id,
            // polres_id: getIdPolres.dataValues.id,
            operasi_id: operasi_id,
            date: date,
            pengaturan: pengaturan,
            penjagaan: penjagaan,
            pengawalan: pengawalan,
            patroli: patroli,
          });

          /**
           * Check data if exist set to array destroy
           */
          let checkExist = await Giatlantas.findAll({
            where: {
              polda_id: getIdPolda.dataValues.id,
              // polres_id: getIdPolres.dataValues.id,
              operasi_id: operasi_id,
              date: date,
            },
          });

          /**
           * Data Destroy & Update to new value
           */
          for (let i in checkExist) {
            if (checkExist[i].dataValues.id != null) {
              Destroy.push(checkExist[i].dataValues.id);
            }
          }
        }

        /**
         * Transaction process
         */
        await Giatlantas.destroy({
          where: { id: Destroy },
          transaction: transaction,
        });
        await Giatlantas.bulkCreate(Data, { transaction: transaction });
        await ImportFileOps.update(
          { status: 1 },
          { where: { id: source_id }, transaction: transaction }
        );
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * Function process lakalantas
   */
  static lakalantas = async (req, res) => {
    const transaction = await db.transaction();
    const param = req.body;
    const source_id = decAes(param.source_id);
    const value = param.value;
    try {
      /**
       * Validate parameter
       */

      const schema = {
        value: ["string", "array"],
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Data Payload
         */
        let Data = [];
        let Destroy = [];
        for (let i in value) {
          /**
           * Define Parameter
           */
          const polda_id = value[i].polda_id;
          // const polres_name = value[i].polres_name
          const operasi_id = value[i].operasi_id;
          const date = value[i].date;
          const meninggal_dunia = value[i].meninggal_dunia;
          const luka_berat = value[i].luka_berat;
          const luka_ringan = value[i].luka_ringan;
          const kerugian_material = value[i].kerugian_material;

          /**
           * Get ID Polda
           */
          let getIdPolda = await Poldaa.findOne({
            where: {
              name_polda: polda_id,
            },
          });

          /**
           * Get ID Polres
           */
          //  let getIdPolres = await Polres.findOne({
          //     where: {
          //         name_polres: polres_name
          //     }
          // });

          /**
           * Data Payload
           */
          Data.push({
            polda_id: getIdPolda.dataValues.id,
            // polres_id: getIdPolres.dataValues.id,
            operasi_id: operasi_id,
            date: date,
            meninggal_dunia: meninggal_dunia,
            luka_berat: luka_berat,
            luka_ringan: luka_ringan,
            kerugian_material: kerugian_material,
          });

          /**
           * Check data if exist set to array destroy
           */
          let checkExist = await Lakalantas.findAll({
            where: {
              polda_id: getIdPolda.dataValues.id,
              // polres_id: getIdPolres.dataValues.id,
              operasi_id: operasi_id,
              date: date,
            },
          });

          /**
           * Data Destroy & Update to new value
           */
          for (let i in checkExist) {
            if (checkExist[i].dataValues.id != null) {
              Destroy.push(checkExist[i].dataValues.id);
            }
          }
        }

        /**
         * Transaction process
         */
        await Lakalantas.destroy({
          where: { id: Destroy },
          transaction: transaction,
        });
        await Lakalantas.bulkCreate(Data, { transaction: transaction });
        await ImportFileOps.update(
          { status: 1 },
          { where: { id: source_id }, transaction: transaction }
        );
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * Function process fungsijalan
   */
  static fungsijalan = async (req, res) => {
    const transaction = await db.transaction();
    const param = req.body;
    const source_id = decAes(param.source_id);
    const value = param.value;
    try {
      /**
       * Validate parameter
       */

      const schema = {
        value: ["string", "array"],
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Data Payload
         */
        let Data = [];
        let Destroy = [];
        for (let i in value) {
          /**
           * Define Parameter
           */
          const polda_id = value[i].polda_id;
          // const polres_name = value[i].polres_name
          const operasi_id = value[i].operasi_id;
          const date = value[i].date;
          const arteri = value[i].arteri;
          const kolektor = value[i].kolektor;
          const lokal = value[i].lokal;
          const lingkungan = value[i].lingkungan;

          /**
           * Get ID Polda
           */
          let getIdPolda = await Poldaa.findOne({
            where: {
              name_polda: polda_id,
            },
          });

          /**
           * Get ID Polres
           */
          //  let getIdPolres = await Polres.findOne({
          //     where: {
          //         name_polres: polres_name
          //     }
          // });

          /**
           * Data Payload
           */
          Data.push({
            polda_id: getIdPolda.dataValues.id,
            // polres_id: getIdPolres.dataValues.id,
            operasi_id: operasi_id,
            date: date,
            arteri: arteri,
            kolektor: kolektor,
            lokal: lokal,
            lingkungan: lingkungan,
          });

          /**
           * Check data if exist set to array destroy
           */
          let checkExist = await Fungsijalan.findAll({
            where: {
              polda_id: getIdPolda.dataValues.id,
              // polres_id: getIdPolres.dataValues.id,
              operasi_id: operasi_id,
              date: date,
            },
          });

          /**
           * Data Destroy & Update to new value
           */
          for (let i in checkExist) {
            if (checkExist[i].dataValues.id != null) {
              Destroy.push(checkExist[i].dataValues.id);
            }
          }
        }

        /**
         * Transaction process
         */
        await Fungsijalan.destroy({
          where: { id: Destroy },
          transaction: transaction,
        });
        await Fungsijalan.bulkCreate(Data, { transaction: transaction });
        await ImportFileOps.update(
          { status: 1 },
          { where: { id: source_id }, transaction: transaction }
        );
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * Function process pekerjaankorban
   */
  static pekerjaankorban = async (req, res) => {
    const transaction = await db.transaction();
    const param = req.body;
    const source_id = decAes(param.source_id);
    const value = param.value;
    try {
      /**
       * Validate parameter
       */

      const schema = {
        value: ["string", "array"],
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Data Payload
         */
        let Data = [];
        let Destroy = [];
        for (let i in value) {
          /**
           * Define Parameter
           */
          const polda_id = value[i].polda_id;
          // const polres_name = value[i].polres_name
          const operasi_id = value[i].operasi_id;
          const date = value[i].date;
          const pns = value[i].pns;
          const karyawan = value[i].karyawan;
          const mahasiswa = value[i].mahasiswa;
          const pengemudi = value[i].pengemudi;
          const tni = value[i].tni;
          const polri = value[i].polri;
          const lain_lain = value[i].lain_lain;

          /**
           * Get ID Polda
           */
          let getIdPolda = await Poldaa.findOne({
            where: {
              name_polda: polda_id,
            },
          });

          /**
           * Get ID Polres
           */
          //  let getIdPolres = await Polres.findOne({
          //     where: {
          //         name_polres: polres_name
          //     }
          // });

          /**
           * Data Payload
           */
          Data.push({
            polda_id: getIdPolda.dataValues.id,
            // polres_id: getIdPolres.dataValues.id,
            operasi_id: operasi_id,
            date: date,
            pns: pns,
            karyawan: karyawan,
            mahasiswa: mahasiswa,
            pengemudi: pengemudi,
            tni: tni,
            polri: polri,
            lain_lain: lain_lain,
          });

          /**
           * Check data if exist set to array destroy
           */
          let checkExist = await Pekerjaankorban.findAll({
            where: {
              polda_id: getIdPolda.dataValues.id,
              // polres_id: getIdPolres.dataValues.id,
              operasi_id: operasi_id,
              date: date,
            },
          });

          /**
           * Data Destroy & Update to new value
           */
          for (let i in checkExist) {
            if (checkExist[i].dataValues.id != null) {
              Destroy.push(checkExist[i].dataValues.id);
            }
          }
        }

        /**
         * Transaction process
         */
        await Pekerjaankorban.destroy({
          where: { id: Destroy },
          transaction: transaction,
        });
        await Pekerjaankorban.bulkCreate(Data, { transaction: transaction });
        await ImportFileOps.update(
          { status: 1 },
          { where: { id: source_id }, transaction: transaction }
        );
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * Function process pekerjaanpelaku
   */
  static pekerjaanpelaku = async (req, res) => {
    const transaction = await db.transaction();
    const param = req.body;
    const source_id = decAes(param.source_id);
    const value = param.value;
    try {
      /**
       * Validate parameter
       */

      const schema = {
        value: ["string", "array"],
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Data Payload
         */
        let Data = [];
        let Destroy = [];
        for (let i in value) {
          /**
           * Define Parameter
           */
          const polda_id = value[i].polda_id;
          // const polres_name = value[i].polres_name
          const operasi_id = value[i].operasi_id;
          const date = value[i].date;
          const pns = value[i].pns;
          const karyawan = value[i].karyawan;
          const mahasiswa = value[i].mahasiswa;
          const pengemudi = value[i].pengemudi;
          const tni = value[i].tni;
          const polri = value[i].polri;
          const lain_lain = value[i].lain_lain;

          /**
           * Get ID Polda
           */
          let getIdPolda = await Poldaa.findOne({
            where: {
              name_polda: polda_id,
            },
          });

          /**
           * Get ID Polres
           */
          //  let getIdPolres = await Polres.findOne({
          //     where: {
          //         name_polres: polres_name
          //     }
          // });

          /**
           * Data Payload
           */
          Data.push({
            polda_id: getIdPolda.dataValues.id,
            // polres_id: getIdPolres.dataValues.id,
            operasi_id: operasi_id,
            date: date,
            pns: pns,
            karyawan: karyawan,
            mahasiswa: mahasiswa,
            pengemudi: pengemudi,
            tni: tni,
            polri: polri,
            lain_lain: lain_lain,
          });

          /**
           * Check data if exist set to array destroy
           */
          let checkExist = await Pekerjaanpelaku.findAll({
            where: {
              polda_id: getIdPolda.dataValues.id,
              // polres_id: getIdPolres.dataValues.id,
              operasi_id: operasi_id,
              date: date,
            },
          });

          /**
           * Data Destroy & Update to new value
           */
          for (let i in checkExist) {
            if (checkExist[i].dataValues.id != null) {
              Destroy.push(checkExist[i].dataValues.id);
            }
          }
        }

        /**
         * Transaction process
         */
        await Pekerjaanpelaku.destroy({
          where: { id: Destroy },
          transaction: transaction,
        });
        await Pekerjaanpelaku.bulkCreate(Data, { transaction: transaction });
        await ImportFileOps.update(
          { status: 1 },
          { where: { id: source_id }, transaction: transaction }
        );
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * Function process pendidikankorban
   */
  static pendidikankorban = async (req, res) => {
    const transaction = await db.transaction();
    const param = req.body;
    const source_id = decAes(param.source_id);
    const value = param.value;
    try {
      /**
       * Validate parameter
       */

      const schema = {
        value: ["string", "array"],
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Data Payload
         */
        let Data = [];
        let Destroy = [];
        for (let i in value) {
          /**
           * Define Parameter
           */
          const polda_id = value[i].polda_id;
          // const polres_name = value[i].polres_name
          const operasi_id = value[i].operasi_id;
          const date = value[i].date;
          const sd = value[i].sd;
          const sltp = value[i].sltp;
          const slta = value[i].slta;
          const d3 = value[i].d3;
          const s1 = value[i].s1;
          const s2 = value[i].s2;
          const tidak_diketahui = value[i].tidak_diketahui;

          /**
           * Get ID Polda
           */
          let getIdPolda = await Poldaa.findOne({
            where: {
              name_polda: polda_id,
            },
          });

          /**
           * Get ID Polres
           */
          //  let getIdPolres = await Polres.findOne({
          //     where: {
          //         name_polres: polres_name
          //     }
          // });

          /**
           * Data Payload
           */
          Data.push({
            polda_id: getIdPolda.dataValues.id,
            // polres_id: getIdPolres.dataValues.id,
            operasi_id: operasi_id,
            date: date,
            sd: sd,
            sltp: sltp,
            slta: slta,
            d3: d3,
            s1: s1,
            s2: s2,
            tidak_diketahui: tidak_diketahui,
          });

          /**
           * Check data if exist set to array destroy
           */
          let checkExist = await Pendidikankorban.findAll({
            where: {
              polda_id: getIdPolda.dataValues.id,
              // polres_id: getIdPolres.dataValues.id,
              operasi_id: operasi_id,
              date: date,
            },
          });

          /**
           * Data Destroy & Update to new value
           */
          for (let i in checkExist) {
            if (checkExist[i].dataValues.id != null) {
              Destroy.push(checkExist[i].dataValues.id);
            }
          }
        }

        /**
         * Transaction process
         */
        await Pendidikankorban.destroy({
          where: { id: Destroy },
          transaction: transaction,
        });
        await Pendidikankorban.bulkCreate(Data, { transaction: transaction });
        await ImportFileOps.update(
          { status: 1 },
          { where: { id: source_id }, transaction: transaction }
        );
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * Function process penyebaranops
   */
  static penyebaranops = async (req, res) => {
    const transaction = await db.transaction();
    const param = req.body;
    const source_id = decAes(param.source_id);
    const value = param.value;
    try {
      /**
       * Validate parameter
       */

      const schema = {
        value: ["string", "array"],
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Data Payload
         */
        let Data = [];
        let Destroy = [];
        for (let i in value) {
          /**
           * Define Parameter
           */
          const polda_id = value[i].polda_id;
          // const polres_name = value[i].polres_name
          const operasi_id = value[i].operasi_id;
          const date = value[i].date;
          const spanduk = value[i].spanduk;
          const leaflet = value[i].leaflet;
          const stiker = value[i].stiker;
          const billboard = value[i].billboard;

          /**
           * Get ID Polda
           */
          let getIdPolda = await Poldaa.findOne({
            where: {
              name_polda: polda_id,
            },
          });

          /**
           * Get ID Polres
           */
          //  let getIdPolres = await Polres.findOne({
          //     where: {
          //         name_polres: polres_name
          //     }
          // });

          /**
           * Data Payload
           */
          Data.push({
            polda_id: getIdPolda.dataValues.id,
            // polres_id: getIdPolres.dataValues.id,
            operasi_id: operasi_id,
            date: date,
            spanduk: spanduk,
            leaflet: leaflet,
            stiker: stiker,
            billboard: billboard,
          });

          /**
           * Check data if exist set to array destroy
           */
          let checkExist = await Penyebaranops.findAll({
            where: {
              polda_id: getIdPolda.dataValues.id,
              // polres_id: getIdPolres.dataValues.id,
              operasi_id: operasi_id,
              date: date,
            },
          });

          /**
           * Data Destroy & Update to new value
           */
          for (let i in checkExist) {
            if (checkExist[i].dataValues.id != null) {
              Destroy.push(checkExist[i].dataValues.id);
            }
          }
        }

        /**
         * Transaction process
         */
        await Penyebaranops.destroy({
          where: { id: Destroy },
          transaction: transaction,
        });
        await Penyebaranops.bulkCreate(Data, { transaction: transaction });
        await ImportFileOps.update(
          { status: 1 },
          { where: { id: source_id }, transaction: transaction }
        );
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * Function process ranmorops
   */
  static ranmorops = async (req, res) => {
    const transaction = await db.transaction();
    const param = req.body;
    const source_id = decAes(param.source_id);
    const value = param.value;
    try {
      /**
       * Validate parameter
       */

      const schema = {
        value: ["string", "array"],
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Data Payload
         */
        let Data = [];
        let Destroy = [];
        for (let i in value) {
          /**
           * Define Parameter
           */
          const polda_id = value[i].polda_id;
          // const polres_name = value[i].polres_name
          const operasi_id = value[i].operasi_id;
          const date = value[i].date;
          const sepeda_motor = value[i].sepeda_motor;
          const mobil_penumpang = value[i].mobil_penumpang;
          const bus = value[i].bus;
          const mobil_barang = value[i].mobil_barang;
          const ransus = value[i].ransus;

          /**
           * Get ID Polda
           */
          let getIdPolda = await Poldaa.findOne({
            where: {
              name_polda: polda_id,
            },
          });

          /**
           * Get ID Polres
           */
          //  let getIdPolres = await Polres.findOne({
          //     where: {
          //         name_polres: polres_name
          //     }
          // });

          /**
           * Data Payload
           */
          Data.push({
            polda_id: getIdPolda.dataValues.id,
            // polres_id: getIdPolres.dataValues.id,
            operasi_id: operasi_id,
            date: date,
            sepeda_motor: sepeda_motor,
            mobil_penumpang: mobil_penumpang,
            bus: bus,
            mobil_barang: mobil_barang,
            ransus: ransus,
          });

          /**
           * Check data if exist set to array destroy
           */
          let checkExist = await Ranmorops.findAll({
            where: {
              polda_id: getIdPolda.dataValues.id,
              // polres_id: getIdPolres.dataValues.id,
              operasi_id: operasi_id,
              date: date,
            },
          });

          /**
           * Data Destroy & Update to new value
           */
          for (let i in checkExist) {
            if (checkExist[i].dataValues.id != null) {
              Destroy.push(checkExist[i].dataValues.id);
            }
          }
        }

        /**
         * Transaction process
         */
        await Ranmorops.destroy({
          where: { id: Destroy },
          transaction: transaction,
        });
        await Ranmorops.bulkCreate(Data, { transaction: transaction });
        await ImportFileOps.update(
          { status: 1 },
          { where: { id: source_id }, transaction: transaction }
        );
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * Function process usiakorban
   */
  static usiakorban = async (req, res) => {
    const transaction = await db.transaction();
    const param = req.body;
    const source_id = decAes(param.source_id);
    const value = param.value;
    try {
      /**
       * Validate parameter
       */

      const schema = {
        value: ["string", "array"],
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Data Payload
         */
        let Data = [];
        let Destroy = [];
        for (let i in value) {
          /**
           * Define Parameter
           */
          const polda_id = value[i].polda_id;
          // const polres_name = value[i].polres_name
          const operasi_id = value[i].operasi_id;
          const date = value[i].date;
          const max_4 = value[i].max_4;
          const max_9 = value[i].max_9;
          const max_14 = value[i].max_14;
          const max_19 = value[i].max_19;
          const max_24 = value[i].max_24;
          const max_29 = value[i].max_29;
          const max_34 = value[i].max_34;
          const max_39 = value[i].max_39;
          const max_44 = value[i].max_44;
          const max_49 = value[i].max_49;
          const max_54 = value[i].max_54;
          const max_59 = value[i].max_59;
          const lain_lain = value[i].lain_lain;

          /**
           * Get ID Polda
           */
          let getIdPolda = await Poldaa.findOne({
            where: {
              name_polda: polda_id,
            },
          });

          /**
           * Get ID Polres
           */
          //  let getIdPolres = await Polres.findOne({
          //     where: {
          //         name_polres: polres_name
          //     }
          // });

          /**
           * Data Payload
           */
          Data.push({
            polda_id: getIdPolda.dataValues.id,
            // polres_id: getIdPolres.dataValues.id,
            operasi_id: operasi_id,
            date: date,
            max_4: max_4,
            max_9: max_9,
            max_14: max_14,
            max_19: max_19,
            max_24: max_24,
            max_29: max_29,
            max_34: max_34,
            max_39: max_39,
            max_44: max_44,
            max_49: max_49,
            max_54: max_54,
            max_59: max_59,
            lain_lain: lain_lain,
          });

          /**
           * Check data if exist set to array destroy
           */
          let checkExist = await Usiakorban.findAll({
            where: {
              polda_id: getIdPolda.dataValues.id,
              // polres_id: getIdPolres.dataValues.id,
              operasi_id: operasi_id,
              date: date,
            },
          });

          /**
           * Data Destroy & Update to new value
           */
          for (let i in checkExist) {
            if (checkExist[i].dataValues.id != null) {
              Destroy.push(checkExist[i].dataValues.id);
            }
          }
        }

        /**
         * Transaction process
         */
        await Usiakorban.destroy({
          where: { id: Destroy },
          transaction: transaction,
        });
        await Usiakorban.bulkCreate(Data, { transaction: transaction });
        await ImportFileOps.update(
          { status: 1 },
          { where: { id: source_id }, transaction: transaction }
        );
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * Function process usiapelaku
   */
  static usiapelaku = async (req, res) => {
    const transaction = await db.transaction();
    const param = req.body;
    const source_id = decAes(param.source_id);
    const value = param.value;
    try {
      /**
       * Validate parameter
       */

      const schema = {
        value: ["string", "array"],
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Data Payload
         */
        let Data = [];
        let Destroy = [];
        for (let i in value) {
          /**
           * Define Parameter
           */
          const polda_id = value[i].polda_id;
          // const polres_name = value[i].polres_name
          const operasi_id = value[i].operasi_id;
          const date = value[i].date;
          const max_14 = value[i].max_14;
          const max_16 = value[i].max_16;
          const max_21 = value[i].max_21;
          const max_29 = value[i].max_29;
          const max_39 = value[i].max_39;
          const max_49 = value[i].max_49;
          const max_59 = value[i].max_59;
          const lain_lain = value[i].lain_lain;
          const tidak_diketahui = value[i].tidak_diketahui;

          /**
           * Get ID Polda
           */
          let getIdPolda = await Poldaa.findOne({
            where: {
              name_polda: polda_id,
            },
          });

          /**
           * Get ID Polres
           */
          //  let getIdPolres = await Polres.findOne({
          //     where: {
          //         name_polres: polres_name
          //     }
          // });

          /**
           * Data Payload
           */
          Data.push({
            polda_id: getIdPolda.dataValues.id,
            // polres_id: getIdPolres.dataValues.id,
            operasi_id: operasi_id,
            date: date,
            max_14: max_14,
            max_16: max_16,
            max_21: max_21,
            max_29: max_29,
            max_39: max_39,
            max_49: max_49,
            max_59: max_59,
            lain_lain: lain_lain,
            tidak_diketahui: tidak_diketahui,
          });

          /**
           * Check data if exist set to array destroy
           */
          let checkExist = await Usiapelaku.findAll({
            where: {
              polda_id: getIdPolda.dataValues.id,
              // polres_id: getIdPolres.dataValues.id,
              operasi_id: operasi_id,
              date: date,
            },
          });

          /**
           * Data Destroy & Update to new value
           */
          for (let i in checkExist) {
            if (checkExist[i].dataValues.id != null) {
              Destroy.push(checkExist[i].dataValues.id);
            }
          }
        }

        /**
         * Transaction process
         */
        await Usiapelaku.destroy({
          where: { id: Destroy },
          transaction: transaction,
        });
        await Usiapelaku.bulkCreate(Data, { transaction: transaction });
        await ImportFileOps.update(
          { status: 1 },
          { where: { id: source_id }, transaction: transaction }
        );
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * Function process turjagwaliops
   */
  static turjagwaliops = async (req, res) => {
    const transaction = await db.transaction();
    const param = req.body;
    const source_id = decAes(param.source_id);
    const value = param.value;
    try {
      /**
       * Validate parameter
       */

      const schema = {
        value: ["string", "array"],
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Data Payload
         */
        let Data = [];
        let Destroy = [];
        for (let i in value) {
          /**
           * Define Parameter
           */
          const polda_id = value[i].polda_id;
          // const polres_name = value[i].polres_name
          const operasi_id = value[i].operasi_id;
          const date = value[i].date;
          const penjagaan = value[i].penjagaan;
          const pengawalan = value[i].pengawalan;
          const patroli = value[i].patroli;
          const pengaturan = value[i].pengaturan;

          /**
           * Get ID Polda
           */
          let getIdPolda = await Poldaa.findOne({
            where: {
              name_polda: polda_id,
            },
          });

          /**
           * Get ID Polres
           */
          //  let getIdPolres = await Polres.findOne({
          //     where: {
          //         name_polres: polres_name
          //     }
          // });

          /**
           * Data Payload
           */
          Data.push({
            polda_id: getIdPolda.dataValues.id,
            // polres_id: getIdPolres.dataValues.id,
            operasi_id: operasi_id,
            date: date,
            penjagaan: penjagaan,
            pengawalan: pengawalan,
            patroli: patroli,
            pengaturan: pengaturan,
          });

          /**
           * Check data if exist set to array destroy
           */
          let checkExist = await Turjagwaliops.findAll({
            where: {
              polda_id: getIdPolda.dataValues.id,
              // polres_id: getIdPolres.dataValues.id,
              operasi_id: operasi_id,
              date: date,
            },
          });

          /**
           * Data Destroy & Update to new value
           */
          for (let i in checkExist) {
            if (checkExist[i].dataValues.id != null) {
              Destroy.push(checkExist[i].dataValues.id);
            }
          }
        }

        /**
         * Transaction process
         */
        await Turjagwaliops.destroy({
          where: { id: Destroy },
          transaction: transaction,
        });
        await Turjagwaliops.bulkCreate(Data, { transaction: transaction });
        await ImportFileOps.update(
          { status: 1 },
          { where: { id: source_id }, transaction: transaction }
        );
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * [END]
   * SECTION IMPORT LAPORAN OPERASI KHUSUS
   */

  /**
   * ===============================================================================================================================
   */

  /**
   * SECTION IMPORT LAPORAN NTMC
   * [BEGIN]
   */

  /**
   * Function process import file
   */
  static ntmc = async (req, res) => {
    const transaction = await db.transaction();
    try {
      /**
       * Validate parameter
       */

      const schema = {
        jenis_satker: { type: "string" },
        jenis_laporan: { type: "string" },
        tanggal: { type: "string" },
        file_name: { type: "string" },
        file_client_name: { type: "string" },
        file_ext: { type: "string" },
        file_type: { type: "string" },
        status: { type: "string" },
        imported_by: { type: "string" },
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Parameter
         */
        const jenis_satker = req.body.jenis_satker;
        const jenis_laporan = req.body.jenis_laporan;
        const tanggal = req.body.tanggal;
        const file_name = req.body.file_name;
        const file_client_name = req.body.file_client_name;
        const file_ext = req.body.file_ext;
        const file_type = req.body.file_type;
        const status = req.body.status;
        const imported_by = req.body.imported_by;

        /**
         * Data Payload
         */
        const Data = {
          jenis_satker: jenis_satker,
          jenis_laporan: jenis_laporan,
          tanggal: tanggal,
          file_name: file_name,
          file_client_name: file_client_name,
          file_ext: file_ext,
          file_type: file_type,
          status: status,
          imported_by: decAes(imported_by),
        };

        /**
         * Transaction process
         */
        await ImportFileNtmc.create(Data, { transaction: transaction });
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  static rmfilentmc = async (req, res) => {
    const transaction = await db.transaction();
    try {
      /**
       * Validate parameter
       */

      const schema = {
        id: { type: "string" },
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Parameter
         */
        const id = decAes(req.body.id);

        /**
         * Transaction process
         */
        await ImportFileNtmc.destroy({
          where: { id: id },
          transaction: transaction,
        });
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * Function list of data import
   */
  static listntmc = async (req, res) => {
    try {
      const {
        length = 10,
        start = 0,
        serverSide = null,
        search = null,
        filter = [],
        filterSearch = [],
        order = 0,
        orderDirection = "asc",
      } = req.query;

      const modelAttr = Object.keys(ImportFileNtmc.getAttributes());
      let getDataRules = { where: null };

      if (serverSide?.toLowerCase() === "true") {
        getDataRules.limit = length;
        getDataRules.offset = start;
      }

      if (order <= modelAttr.length) {
        getDataRules.order = [[modelAttr[order], orderDirection.toUpperCase()]];
      }

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
        getDataRules.where = {
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
        getDataRules.where = {
          ...getDataRules.where,
          ...filters,
        };
      }

      const data = await ImportFileNtmc.findAll(getDataRules);
      const count = await ImportFileNtmc.count({
        where: getDataRules?.where,
      });

      response(res, true, "Succeed", {
        data,
        recordsFiltered: count,
        recordsTotal: count,
      });
    } catch (e) {
      response(res, false, "Failed", e.message);
    }
  };

  /**
   * Function process programtv
   */
  static programtv = async (req, res) => {
    const transaction = await db.transaction();
    const param = req.body;
    const source_id = decAes(param.source_id);
    const value = param.value;
    try {
      /**
       * Validate parameter
       */

      const schema = {
        value: ["string", "array"],
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Data Payload
         */
        let Data = [];
        let Destroy = [];
        for (let i in value) {
          /**
           * Define Parameter
           */
          const date = value[i].date;
          const program = value[i].program;
          const live_report = value[i].live_report;
          const live_program = value[i].live_program;
          const tapping = value[i].tapping;
          const vlog_cctv = value[i].vlog_cctv;

          /**
           * Data Payload
           */
          Data.push({
            date: date,
            program: program,
            live_report: live_report,
            live_program: live_program,
            tapping: tapping,
            vlog_cctv: vlog_cctv,
          });

          /**
           * Check data if exist set to array destroy
           */
          let checkExist = await Programtv.findAll({
            where: {
              date: date,
            },
          });

          /**
           * Data Destroy & Update to new value
           */
          for (let i in checkExist) {
            if (checkExist[i].dataValues.id != null) {
              Destroy.push(checkExist[i].dataValues.id);
            }
          }
        }

        /**
         * Transaction process
         */
        await Programtv.destroy({
          where: { id: Destroy },
          transaction: transaction,
        });
        await Programtv.bulkCreate(Data, { transaction: transaction });
        await ImportFileNtmc.update(
          { status: 1 },
          { where: { id: source_id }, transaction: transaction }
        );
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * Function process programonline
   */
  static programonline = async (req, res) => {
    const transaction = await db.transaction();
    const param = req.body;
    const source_id = decAes(param.source_id);
    const value = param.value;
    try {
      /**
       * Validate parameter
       */

      const schema = {
        value: ["string", "array"],
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Data Payload
         */
        let Data = [];
        let Destroy = [];
        for (let i in value) {
          /**
           * Define Parameter
           */
          const date = value[i].date;
          const web_ntmc = value[i].web_ntmc;
          const web_korlantas = value[i].web_korlantas;

          /**
           * Data Payload
           */
          Data.push({
            date: date,
            web_ntmc: web_ntmc,
            web_korlantas: web_korlantas,
          });

          /**
           * Check data if exist set to array destroy
           */
          let checkExist = await Programonline.findAll({
            where: {
              date: date,
            },
          });

          /**
           * Data Destroy & Update to new value
           */
          for (let i in checkExist) {
            if (checkExist[i].dataValues.id != null) {
              Destroy.push(checkExist[i].dataValues.id);
            }
          }
        }

        /**
         * Transaction process
         */
        await Programonline.destroy({
          where: { id: Destroy },
          transaction: transaction,
        });
        await Programonline.bulkCreate(Data, { transaction: transaction });
        await ImportFileNtmc.update(
          { status: 1 },
          { where: { id: source_id }, transaction: transaction }
        );
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * Function process programmedsos
   */
  static programmedsos = async (req, res) => {
    const transaction = await db.transaction();
    const param = req.body;
    const source_id = decAes(param.source_id);
    const value = param.value;
    try {
      /**
       * Validate parameter
       */

      const schema = {
        value: ["string", "array"],
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Data Payload
         */
        let Data = [];
        let Destroy = [];
        for (let i in value) {
          /**
           * Define Parameter
           */
          const date = value[i].date;
          const facebook = value[i].facebook;
          const instagram = value[i].instagram;
          const twitter = value[i].twitter;

          /**
           * Data Payload
           */
          Data.push({
            date: date,
            facebook: facebook,
            instagram: instagram,
            twitter: twitter,
          });

          /**
           * Check data if exist set to array destroy
           */
          let checkExist = await Programmedsos.findAll({
            where: {
              date: date,
            },
          });

          /**
           * Data Destroy & Update to new value
           */
          for (let i in checkExist) {
            if (checkExist[i].dataValues.id != null) {
              Destroy.push(checkExist[i].dataValues.id);
            }
          }
        }

        /**
         * Transaction process
         */
        await Programmedsos.destroy({
          where: { id: Destroy },
          transaction: transaction,
        });
        await Programmedsos.bulkCreate(Data, { transaction: transaction });
        await ImportFileNtmc.update(
          { status: 1 },
          { where: { id: source_id }, transaction: transaction }
        );
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * Function process offairprogram
   */
  static offairprogram = async (req, res) => {
    const transaction = await db.transaction();
    const param = req.body;
    const source_id = decAes(param.source_id);
    const value = param.value;
    try {
      /**
       * Validate parameter
       */

      const schema = {
        value: ["string", "array"],
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Data Payload
         */
        let Data = [];
        let Destroy = [];
        for (let i in value) {
          /**
           * Define Parameter
           */
          const date = value[i].date;
          const sosialisasi = value[i].sosialisasi;
          const timtam = value[i].timtam;

          /**
           * Data Payload
           */
          Data.push({
            date: date,
            sosialisasi: sosialisasi,
            timtam: timtam,
          });

          /**
           * Check data if exist set to array destroy
           */
          let checkExist = await Offairprogram.findAll({
            where: {
              date: date,
            },
          });

          /**
           * Data Destroy & Update to new value
           */
          for (let i in checkExist) {
            if (checkExist[i].dataValues.id != null) {
              Destroy.push(checkExist[i].dataValues.id);
            }
          }
        }

        /**
         * Transaction process
         */
        await Offairprogram.destroy({
          where: { id: Destroy },
          transaction: transaction,
        });
        await Offairprogram.bulkCreate(Data, { transaction: transaction });
        await ImportFileNtmc.update(
          { status: 1 },
          { where: { id: source_id }, transaction: transaction }
        );
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * Function process mediatv
   */
  static mediatv = async (req, res) => {
    const transaction = await db.transaction();
    const param = req.body;
    const source_id = decAes(param.source_id);
    const value = param.value;
    try {
      /**
       * Validate parameter
       */

      const schema = {
        value: ["string", "array"],
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Data Payload
         */
        let Data = [];
        let Destroy = [];
        for (let i in value) {
          /**
           * Define Parameter
           */
          const date = value[i].date;
          const media_tv = value[i].media_tv;

          /**
           * Data Payload
           */
          Data.push({
            date: date,
            media_tv: media_tv,
          });

          /**
           * Check data if exist set to array destroy
           */
          let checkExist = await Mediatv.findAll({
            where: {
              date: date,
            },
          });

          /**
           * Data Destroy & Update to new value
           */
          for (let i in checkExist) {
            if (checkExist[i].dataValues.id != null) {
              Destroy.push(checkExist[i].dataValues.id);
            }
          }
        }

        /**
         * Transaction process
         */
        await Mediatv.destroy({
          where: { id: Destroy },
          transaction: transaction,
        });
        await Mediatv.bulkCreate(Data, { transaction: transaction });
        await ImportFileNtmc.update(
          { status: 1 },
          { where: { id: source_id }, transaction: transaction }
        );
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * Function process medsos
   */
  static medsos = async (req, res) => {
    const transaction = await db.transaction();
    const param = req.body;
    const source_id = decAes(param.source_id);
    const value = param.value;
    try {
      /**
       * Validate parameter
       */

      const schema = {
        value: ["string", "array"],
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Data Payload
         */
        let Data = [];
        let Destroy = [];
        for (let i in value) {
          /**
           * Define Parameter
           */
          const date = value[i].date;
          const positif_korlantas = value[i].positif_korlantas;
          const negatif_korlantas = value[i].negatif_korlantas;
          const lakalantas = value[i].lakalantas;
          const positif_polri = value[i].positif_polri;
          const negatif_polri = value[i].negatif_polri;
          const liputan = value[i].liputan;
          const kategori = value[i].kategori;

          /**
           * Data Payload
           */
          Data.push({
            date: date,
            positif_korlantas: positif_korlantas,
            negatif_korlantas: negatif_korlantas,
            lakalantas: lakalantas,
            positif_polri: positif_polri,
            negatif_polri: negatif_polri,
            liputan: liputan,
            kategori: kategori,
          });

          /**
           * Check data if exist set to array destroy
           */
          let checkExist = await Medsos.findAll({
            where: {
              date: date,
              kategori: kategori,
            },
          });

          /**
           * Data Destroy & Update to new value
           */
          for (let i in checkExist) {
            if (checkExist[i].dataValues.id != null) {
              Destroy.push(checkExist[i].dataValues.id);
            }
          }
        }

        /**
         * Transaction process
         */
        await Medsos.destroy({
          where: { id: Destroy },
          transaction: transaction,
        });
        await Medsos.bulkCreate(Data, { transaction: transaction });
        await ImportFileNtmc.update(
          { status: 1 },
          { where: { id: source_id }, transaction: transaction }
        );
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * Function process sosial
   */
  static sosial = async (req, res) => {
    const transaction = await db.transaction();
    const param = req.body;
    const source_id = decAes(param.source_id);
    const value = param.value;
    try {
      /**
       * Validate parameter
       */

      const schema = {
        value: ["string", "array"],
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Data Payload
         */
        let Data = [];
        let Destroy = [];
        for (let i in value) {
          /**
           * Define Parameter
           */
          const date = value[i].date;
          const facebook = value[i].facebook;
          const twitter = value[i].twitter;

          /**
           * Data Payload
           */
          Data.push({
            date: date,
            facebook: facebook,
            twitter: twitter,
          });

          /**
           * Check data if exist set to array destroy
           */
          let checkExist = await Sosial.findAll({
            where: {
              date: date,
            },
          });

          /**
           * Data Destroy & Update to new value
           */
          for (let i in checkExist) {
            if (checkExist[i].dataValues.id != null) {
              Destroy.push(checkExist[i].dataValues.id);
            }
          }
        }

        /**
         * Transaction process
         */
        await Sosial.destroy({
          where: { id: Destroy },
          transaction: transaction,
        });
        await Sosial.bulkCreate(Data, { transaction: transaction });
        await ImportFileNtmc.update(
          { status: 1 },
          { where: { id: source_id }, transaction: transaction }
        );
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * Function process radio
   */
  static radio = async (req, res) => {
    const transaction = await db.transaction();
    const param = req.body;
    const source_id = decAes(param.source_id);
    const value = param.value;
    try {
      /**
       * Validate parameter
       */

      const schema = {
        value: ["string", "array"],
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Data Payload
         */
        let Data = [];
        let Destroy = [];
        for (let i in value) {
          /**
           * Define Parameter
           */
          const date = value[i].date;
          const gen_fm = value[i].gen_fm;
          const jak_fm = value[i].jak_fm;
          const most_fm = value[i].most_fm;
          const kiss_fm = value[i].kiss_fm;

          /**
           * Data Payload
           */
          Data.push({
            date: date,
            gen_fm: gen_fm,
            jak_fm: jak_fm,
            most_fm: most_fm,
            kiss_fm: kiss_fm,
          });

          /**
           * Check data if exist set to array destroy
           */
          let checkExist = await Radio.findAll({
            where: {
              date: date,
            },
          });

          /**
           * Data Destroy & Update to new value
           */
          for (let i in checkExist) {
            if (checkExist[i].dataValues.id != null) {
              Destroy.push(checkExist[i].dataValues.id);
            }
          }
        }

        /**
         * Transaction process
         */
        await Radio.destroy({
          where: { id: Destroy },
          transaction: transaction,
        });
        await Radio.bulkCreate(Data, { transaction: transaction });
        await ImportFileNtmc.update(
          { status: 1 },
          { where: { id: source_id }, transaction: transaction }
        );
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * Function process pengaduan
   */
  static pengaduan = async (req, res) => {
    const transaction = await db.transaction();
    const param = req.body;
    const source_id = decAes(param.source_id);
    const value = param.value;
    try {
      /**
       * Validate parameter
       */

      const schema = {
        value: ["string", "array"],
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Data Payload
         */
        let Data = [];
        let Destroy = [];
        for (let i in value) {
          /**
           * Define Parameter
           */
          const date = value[i].date;
          const radio_pjr = value[i].radio_pjr;
          const sms_9119 = value[i].sms_9119;
          const wa_center = value[i].wa_center;
          const call_center = value[i].call_center;

          /**
           * Data Payload
           */
          Data.push({
            date: date,
            radio_pjr: radio_pjr,
            sms_9119: sms_9119,
            wa_center: wa_center,
            call_center: call_center,
          });

          /**
           * Check data if exist set to array destroy
           */
          let checkExist = await Pengaduan.findAll({
            where: {
              date: date,
            },
          });

          /**
           * Data Destroy & Update to new value
           */
          for (let i in checkExist) {
            if (checkExist[i].dataValues.id != null) {
              Destroy.push(checkExist[i].dataValues.id);
            }
          }
        }

        /**
         * Transaction process
         */
        await Pengaduan.destroy({
          where: { id: Destroy },
          transaction: transaction,
        });
        await Pengaduan.bulkCreate(Data, { transaction: transaction });
        await ImportFileNtmc.update(
          { status: 1 },
          { where: { id: source_id }, transaction: transaction }
        );
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * [END]
   * SECTION IMPORT LAPORAN NTMC
   */

  /**
   * ===============================================================================================================================
   */

  /**
   * SECTION IMPORT LAPORAN KEGIATAN MASYARAKAT
   * [BEGIN]
   */

  /**
   * Function process import file
   */
  static masyarakat = async (req, res) => {
    const transaction = await db.transaction();
    try {
      /**
       * Validate parameter
       */

      const schema = {
        jenis_satker: { type: "string" },
        jenis_laporan: { type: "string" },
        tanggal: { type: "string" },
        file_name: { type: "string" },
        file_client_name: { type: "string" },
        file_ext: { type: "string" },
        file_type: { type: "string" },
        status: { type: "string" },
        imported_by: { type: "string" },
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Parameter
         */
        const jenis_satker = req.body.jenis_satker;
        const jenis_laporan = req.body.jenis_laporan;
        const tanggal = req.body.tanggal;
        const file_name = req.body.file_name;
        const file_client_name = req.body.file_client_name;
        const file_ext = req.body.file_ext;
        const file_type = req.body.file_type;
        const status = req.body.status;
        const imported_by = req.body.imported_by;

        /**
         * Data Payload
         */
        const Data = {
          jenis_satker: jenis_satker,
          jenis_laporan: jenis_laporan,
          tanggal: tanggal,
          file_name: file_name,
          file_client_name: file_client_name,
          file_ext: file_ext,
          file_type: file_type,
          status: status,
          imported_by: decAes(imported_by),
        };

        /**
         * Transaction process
         */
        await ImportFileMasyarakat.create(Data, { transaction: transaction });
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  static rmfilemasy = async (req, res) => {
    const transaction = await db.transaction();
    try {
      /**
       * Validate parameter
       */

      const schema = {
        id: { type: "string" },
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Parameter
         */
        const id = decAes(req.body.id);

        /**
         * Transaction process
         */
        await ImportFileMasyarakat.destroy({
          where: { id: id },
          transaction: transaction,
        });
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * Function list of data import
   */
  static listmasy = async (req, res) => {
    try {
      const {
        length = 10,
        start = 0,
        serverSide = null,
        search = null,
        filter = [],
        filterSearch = [],
        order = 0,
        orderDirection = "asc",
      } = req.query;

      const modelAttr = Object.keys(ImportFileMasyarakat.getAttributes());
      let getDataRules = { where: null };

      if (serverSide?.toLowerCase() === "true") {
        getDataRules.limit = length;
        getDataRules.offset = start;
      }

      if (order <= modelAttr.length) {
        getDataRules.order = [[modelAttr[order], orderDirection.toUpperCase()]];
      }

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
        getDataRules.where = {
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
        getDataRules.where = {
          ...getDataRules.where,
          ...filters,
        };
      }

      const data = await ImportFileMasyarakat.findAll(getDataRules);
      const count = await ImportFileMasyarakat.count({
        where: getDataRules?.where,
      });

      response(res, true, "Succeed", {
        data,
        recordsFiltered: count,
        recordsTotal: count,
      });
    } catch (e) {
      response(res, false, "Failed", e.message);
    }
  };

  /**
   * Function process kegiatanmasyarakat
   */
  static kegiatanmasyarakat = async (req, res) => {
    const transaction = await db.transaction();
    const param = req.body;
    const source_id = decAes(param.source_id);
    const value = param.value;
    try {
      /**
       * Validate parameter
       */

      const schema = {
        value: ["string", "array"],
      };
      const valid = check.validate(req.body, schema);

      if (valid === true) {
        /**
         * Data Payload
         */
        let Data = [];
        let Destroy = [];
        for (let i in value) {
          /**
           * Define Parameter
           */
          const polda_id = value[i].polda_id;
          // const polres_name = value[i].polres_name
          const date = value[i].date;
          const tegur_prokes = value[i].tegur_prokes;
          const masker = value[i].masker;
          const sosial_prokes = value[i].sosial_prokes;
          const baksos = value[i].baksos;

          /**
           * Get ID Polda
           */
          let getIdPolda = await Poldaa.findOne({
            where: {
              name_polda: polda_id,
            },
          });

          /**
           * Get ID Polres
           */
          //  let getIdPolres = await Polres.findOne({
          //     where: {
          //         name_polres: polres_name
          //     }
          // });

          /**
           * Data Payload
           */
          Data.push({
            polda_id: getIdPolda.dataValues.id,
            // polres_id: getIdPolres.dataValues.id,
            date: date,
            tegur_prokes: tegur_prokes,
            masker: masker,
            sosial_prokes: sosial_prokes,
            baksos: baksos,
          });

          /**
           * Check data if exist set to array destroy
           */
          let checkExist = await Kegiatanmasyarakat.findAll({
            where: {
              polda_id: getIdPolda.dataValues.id,
              // polres_id: getIdPolres.dataValues.id,
              date: date,
            },
          });

          /**
           * Data Destroy & Update to new value
           */
          for (let i in checkExist) {
            if (checkExist[i].dataValues.id != null) {
              Destroy.push(checkExist[i].dataValues.id);
            }
          }
        }

        /**
         * Transaction process
         */
        await Kegiatanmasyarakat.destroy({
          where: { id: Destroy },
          transaction: transaction,
        });
        await Kegiatanmasyarakat.bulkCreate(Data, { transaction: transaction });
        await ImportFileMasyarakat.update(
          { status: 1 },
          { where: { id: source_id }, transaction: transaction }
        );
        await transaction.commit();
        response(res, true, "Success", "Success");
      } else {
        /**
         * Validate Error
         */
        response(
          res,
          false,
          "Failed",
          "You have some error please check parameter"
        );
      }
    } catch (error) {
      /**
       * Rollback if error
       */
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  /**
   * [END]
   * SECTION IMPORT LAPORAN NTMC
   */
};
