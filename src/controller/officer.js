const { AESDecrypt } = require("../lib/encryption");
const response = require("../lib/response");
const Officer = require("../model/officer"); 
const db = require("../config/database");
const fs = require('fs');
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const formidable = require('formidable');

module.exports = class OfficerController {
  static get = async (req, res) => {
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
      const modelAttr = Object.keys(Officer.getAttributes());
      let getData = { where: null };
      if (serverSide?.toLowerCase() === "true") {
        getData.limit = length;
        getData.offset = start;
      }
      if (order <= modelAttr.length) {
        getData.order = [[modelAttr[order], orderDirection.toUpperCase()]];
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
      const data = await Officer.findAll(getData);
      const count = await Officer.count({
        where: getData?.where,
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
  static add = async (req, res) => {
    const transaction = await db.transaction();
    let inputs = {};
    var photo_officer = ''; 
    // return response(res, true, "Succeed", req.body.photo_officer); 
    try {
      if (req.body.photo_officer != null) { 
        let path = await req.body.photo_officer.filepath;
        let file = await req.body.photo_officer;
        let fileName = await file.originalFilename;
        await fs.renameSync(path, "./public/uploads/officer/" + fileName, function (err) {
          if (err) throw err;
        });
        photo_officer = await fileName; 
      }else{
        photo_officer = await null; 
      }
      await Officer.create(
        {
          name_officer: req.body.name_officer,
          photo_officer: photo_officer,
          nrp_officer: req.body?.nrp_officer,
          rank_officer: req.body?.rank_officer, 
          structural_officer: req.body?.structural_officer, 
          pam_officer: req.body?.pam_officer, 
          phone_officer: req.body?.phone_officer, 
          status_officer: req.body?.status_officer,  
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
  static edit = async (req, res) => {
    const transaction = await db.transaction();
    try {
      if (req.body.photo_officer != null) { 
        let path = await req.body.photo_officer.filepath;
        let file = await req.body.photo_officer;
        let fileName = await file.originalFilename;
        await fs.renameSync(path, "./public/uploads/officer/" + fileName, function (err) {
          if (err) throw err;
        });
        photo_officer = await fileName; 
      }else{
        photo_officer = await null; 
      }
      await Officer.update(
        {
          name_officer: req.body.name_officer,
          photo_officer: photo_officer,
          nrp_officer: req.body?.nrp_officer,
          rank_officer: req.body?.rank_officer, 
          structural_officer: req.body?.structural_officer, 
          pam_officer: req.body?.pam_officer, 
          phone_officer: req.body?.phone_officer, 
          status_officer: req.body?.status_officer,  
        },
        {
          where: {
            id: AESDecrypt(req.params.id, {
              isSafeUrl: true,
              parseMode: "string",
            }),
          },
          transaction: transaction,
        }
      );
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
      await Officer.destroy({
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
