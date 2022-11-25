const { AESDecrypt } = require("../../lib/encryption");
const response = require("../../lib/response");
const Provinsi = require("../../model/provinsi");
const db = require("../../config/database");
const fs = require("fs");
const { Op, Sequelize } = require("sequelize");
const readXlsxFile = require("read-excel-file/node");
const _ = require("lodash");
const formidable = require("formidable");
const pagination = require("../../lib/pagination-parser");

module.exports = class ProvinsiController {
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
      const modelAttr = Object.keys(Provinsi.getAttributes());
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
      const data = await Provinsi.findAll(getData);
      const count = await Provinsi.count({
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

  static getId = async (req, res) => {
    try {
      const data = await Provinsi.findOne({
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

  static importExcell = async (req, res) => {
    const t = await db.transaction();
    try {
      let readExcell = [
        {
          nama: "Aceh (NAD)",
          kode: "11",
        },
        {
          nama: "Sumatera Utara",
          kode: "12",
        },
        {
          nama: "Sumatera Barat",
          kode: "13",
        },
        {
          nama: "Riau",
          kode: "14",
        },
        {
          nama: "Jambi",
          kode: "15",
        },
        {
          nama: "Sumatera Selatan",
          kode: "16",
        },
        {
          nama: "Bengkulu",
          kode: "17",
        },
        {
          nama: "Lampung",
          kode: "18",
        },
        {
          nama: "Kepulauan Bangka Belitung",
          kode: "19",
        },
        {
          nama: "Kepulauan Riau",
          kode: "21",
        },
        {
          nama: "DKI Jakarta",
          kode: "31",
        },
        {
          nama: "Jawa Barat",
          kode: "32",
        },
        {
          nama: "Jawa Tengah",
          kode: "33",
        },
        {
          nama: "DI Yogyakarta",
          kode: "34",
        },
        {
          nama: "Jawa Timur",
          kode: "35",
        },
        {
          nama: "Banten",
          kode: "36",
        },
        {
          nama: "Bali",
          kode: "51",
        },
        {
          nama: "Nusa Tenggara Barat (NTB)",
          kode: "52",
        },
        {
          nama: "Nusa Tenggara Timur (NTT)",
          kode: "53",
        },
        {
          nama: "Kalimantan Barat",
          kode: "61",
        },
        {
          nama: "Kalimantan Tengah",
          kode: "62",
        },
        {
          nama: "Kalimantan Selatan",
          kode: "63",
        },
        {
          nama: "Kalimantan Timur",
          kode: "64",
        },
        {
          nama: "Kalimantan Utara",
          kode: "65",
        },
        {
          nama: "Sulawesi Utara",
          kode: "71",
        },
        {
          nama: "Sulawesi Tengah",
          kode: "72",
        },
        {
          nama: "Sulawesi Selatan",
          kode: "73",
        },
        {
          nama: "Sulawesi Tenggara",
          kode: "74",
        },
        {
          nama: "Gorontalo",
          kode: "75",
        },
        {
          nama: "Sulawesi Barat",
          kode: "76",
        },
        {
          nama: "Maluku",
          kode: "81",
        },
        {
          nama: "Maluku Utara",
          kode: "82",
        },
        {
          nama: "Papua",
          kode: "91",
        },
        {
          nama: "Papua Barat",
          kode: "92",
        },
      ];
      const ress = await Provinsi.bulkCreate(readExcell, {
        transaction: t,
      });
      await t.commit();

      response(res, true, "Succed", ress);
    } catch (error) {
      await t.rollback();
      response(res, false, "Failed", error.message);
    }
  };
};
