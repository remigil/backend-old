const { AESDecrypt } = require("../lib/encryption");
const response = require("../lib/response");
const Vip = require("../model/vip"); 
const db = require("../config/database");
module.exports = class VipController {
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
      const modelAttr = Object.keys(Vip.getAttributes());
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
      const data = await Vip.findAll(getData);
      const count = await Vip.count({
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
    try {
      await Vip.create(
        {
          name_vip: req.body.name_vip,
          country_arrival_vip: req.body?.country_arrival_vip, 
          position_vip: req.body?.position_vip, 
          description_vip: req.body?.description_vip, 
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
      await Vip.update(
        {
          name_vip: req.body.name_vip,
          country_arrival_vip: req.body?.country_arrival_vip, 
          position_vip: req.body?.position_vip, 
          description_vip: req.body?.description_vip, 
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
      await Vip.destroy({
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
