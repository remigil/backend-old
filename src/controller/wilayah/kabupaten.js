const { AESDecrypt } = require("../../lib/encryption");
const response = require("../../lib/response");
const Kabupaten = require("../../model/kabkot");
const db = require("../../config/database");
const fs = require("fs");
const { Op, Sequelize } = require("sequelize");
const readXlsxFile = require("read-excel-file/node");
const _ = require("lodash");
const formidable = require("formidable");
const pagination = require("../../lib/pagination-parser");

module.exports = class KabupatenController {
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
      const modelAttr = Object.keys(Kabupaten.getAttributes());
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
      const data = await Kabupaten.findAll(getData);
      const count = await Kabupaten.count({
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
      const data = await Kabupaten.findOne({
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
          nama: "Kabupaten Aceh Selatan",
          kode: "11.01",
          kode_prov: "11",
        },
        {
          nama: "Kabupaten Aceh Tenggara",
          kode: "11.02",
          kode_prov: "11",
        },
        {
          nama: "Kabupaten Aceh Timur",
          kode: "11.03",
          kode_prov: "11",
        },
        {
          nama: "Kabupaten Aceh Tengah",
          kode: "11.04",
          kode_prov: "11",
        },
        {
          nama: "Kabupaten Aceh Barat",
          kode: "11.05",
          kode_prov: "11",
        },
        {
          nama: "Kabupaten Aceh Besar",
          kode: "11.06",
          kode_prov: "11",
        },
        {
          nama: "Kabupaten Pidie",
          kode: "11.07",
          kode_prov: "11",
        },
        {
          nama: "Kabupaten Aceh Utara",
          kode: "11.08",
          kode_prov: "11",
        },
        {
          nama: "Kabupaten Simeulue",
          kode: "11.09",
          kode_prov: "11",
        },
        {
          nama: "Kabupaten Aceh Singkil",
          kode: "11.1",
          kode_prov: "11",
        },
        {
          nama: "Kabupaten Bireuen",
          kode: "11.11",
          kode_prov: "11",
        },
        {
          nama: "Kabupaten Aceh Barat Daya",
          kode: "11.12",
          kode_prov: "11",
        },
        {
          nama: "Kabupaten Gayo Lues",
          kode: "11.13",
          kode_prov: "11",
        },
        {
          nama: "Kabupaten Aceh Jaya",
          kode: "11.14",
          kode_prov: "11",
        },
        {
          nama: "Kabupaten Nagan Raya",
          kode: "11.15",
          kode_prov: "11",
        },
        {
          nama: "Kabupaten Aceh Tamiang",
          kode: "11.16",
          kode_prov: "11",
        },
        {
          nama: "Kabupaten Bener Meriah",
          kode: "11.17",
          kode_prov: "11",
        },
        {
          nama: "Kabupaten Pidie Jaya",
          kode: "11.18",
          kode_prov: "11",
        },
        {
          nama: "Kota Banda Aceh",
          kode: "11.71",
          kode_prov: "11",
        },
        {
          nama: "Kota Sabang",
          kode: "11.72",
          kode_prov: "11",
        },
        {
          nama: "Kota Lhokseumawe",
          kode: "11.73",
          kode_prov: "11",
        },
        {
          nama: "Kota Langsa",
          kode: "11.74",
          kode_prov: "11",
        },
        {
          nama: "Kota Subulussalam",
          kode: "11.75",
          kode_prov: "11",
        },
        {
          nama: "Kabupaten Tapanuli Tengah",
          kode: "12.01",
          kode_prov: "12",
        },
        {
          nama: "Kabupaten Tapanuli Utara",
          kode: "12.02",
          kode_prov: "12",
        },
        {
          nama: "Kabupaten Tapanuli Selatan",
          kode: "12.03",
          kode_prov: "12",
        },
        {
          nama: "Kabupaten Nias",
          kode: "12.04",
          kode_prov: "12",
        },
        {
          nama: "Kabupaten Langkat",
          kode: "12.05",
          kode_prov: "12",
        },
        {
          nama: "Kabupaten Karo",
          kode: "12.06",
          kode_prov: "12",
        },
        {
          nama: "Kabupaten Deli Serdang",
          kode: "12.07",
          kode_prov: "12",
        },
        {
          nama: "Kabupaten Simalungun",
          kode: "12.08",
          kode_prov: "12",
        },
        {
          nama: "Kabupaten Asahan",
          kode: "12.09",
          kode_prov: "12",
        },
        {
          nama: "Kabupaten Labuhanbatu",
          kode: "12.1",
          kode_prov: "12",
        },
        {
          nama: "Kabupaten Dairi",
          kode: "12.11",
          kode_prov: "12",
        },
        {
          nama: "Kabupaten Toba Samosir",
          kode: "12.12",
          kode_prov: "12",
        },
        {
          nama: "Kabupaten Mandailing Natal",
          kode: "12.13",
          kode_prov: "12",
        },
        {
          nama: "Kabupaten Nias Selatan",
          kode: "12.14",
          kode_prov: "12",
        },
        {
          nama: "Kabupaten Pakpak Bharat",
          kode: "12.15",
          kode_prov: "12",
        },
        {
          nama: "Kabupaten Humbang Hasundutan",
          kode: "12.16",
          kode_prov: "12",
        },
        {
          nama: "Kabupaten Samosir",
          kode: "12.17",
          kode_prov: "12",
        },
        {
          nama: "Kabupaten Serdang Bedagai",
          kode: "12.18",
          kode_prov: "12",
        },
        {
          nama: "Kabupaten Batu Bara",
          kode: "12.19",
          kode_prov: "12",
        },
        {
          nama: "Kabupaten Padang Lawas Utara",
          kode: "12.2",
          kode_prov: "12",
        },
        {
          nama: "Kabupaten Padang Lawas",
          kode: "12.21",
          kode_prov: "12",
        },
        {
          nama: "Kabupaten Labuhanbatu Selatan",
          kode: "12.22",
          kode_prov: "12",
        },
        {
          nama: "Kabupaten Labuhanbatu Utara",
          kode: "12.23",
          kode_prov: "12",
        },
        {
          nama: "Kabupaten Nias Utara",
          kode: "12.24",
          kode_prov: "12",
        },
        {
          nama: "Kabupaten Nias Barat",
          kode: "12.25",
          kode_prov: "12",
        },
        {
          nama: "Kota Medan",
          kode: "12.71",
          kode_prov: "12",
        },
        {
          nama: "Kota Pematang Siantar",
          kode: "12.72",
          kode_prov: "12",
        },
        {
          nama: "Kota Sibolga",
          kode: "12.73",
          kode_prov: "12",
        },
        {
          nama: "Kota Tanjung Balai",
          kode: "12.74",
          kode_prov: "12",
        },
        {
          nama: "Kota Binjai",
          kode: "12.75",
          kode_prov: "12",
        },
        {
          nama: "Kota Tebing Tinggi",
          kode: "12.76",
          kode_prov: "12",
        },
        {
          nama: "Kota Padang Sidempuan",
          kode: "12.77",
          kode_prov: "12",
        },
        {
          nama: "Kota Gunungsitoli",
          kode: "12.78",
          kode_prov: "12",
        },
        {
          nama: "Kabupaten Pesisir Selatan",
          kode: "13.01",
          kode_prov: "13",
        },
        {
          nama: "Kabupaten Solok",
          kode: "13.02",
          kode_prov: "13",
        },
        {
          nama: "Kabupaten Sijunjung",
          kode: "13.03",
          kode_prov: "13",
        },
        {
          nama: "Kabupaten Tanah Datar",
          kode: "13.04",
          kode_prov: "13",
        },
        {
          nama: "Kabupaten Padang Pariaman",
          kode: "13.05",
          kode_prov: "13",
        },
        {
          nama: "Kabupaten Agam",
          kode: "13.06",
          kode_prov: "13",
        },
        {
          nama: "Kabupaten Lima Puluh Kota",
          kode: "13.07",
          kode_prov: "13",
        },
        {
          nama: "Kabupaten Pasaman",
          kode: "13.08",
          kode_prov: "13",
        },
        {
          nama: "Kabupaten Kepulauan Mentawai",
          kode: "13.09",
          kode_prov: "13",
        },
        {
          nama: "Kabupaten Dharmasraya",
          kode: "13.1",
          kode_prov: "13",
        },
        {
          nama: "Kabupaten Solok Selatan",
          kode: "13.11",
          kode_prov: "13",
        },
        {
          nama: "Kabupaten Pasaman Barat",
          kode: "13.12",
          kode_prov: "13",
        },
        {
          nama: "Kota Padang",
          kode: "13.71",
          kode_prov: "13",
        },
        {
          nama: "Kota Solok",
          kode: "13.72",
          kode_prov: "13",
        },
        {
          nama: "Kota Sawah Lunto",
          kode: "13.73",
          kode_prov: "13",
        },
        {
          nama: "Kota Padang Panjang",
          kode: "13.74",
          kode_prov: "13",
        },
        {
          nama: "Kota Bukittinggi",
          kode: "13.75",
          kode_prov: "13",
        },
        {
          nama: "Kota Payakumbuh",
          kode: "13.76",
          kode_prov: "13",
        },
        {
          nama: "Kota Pariaman",
          kode: "13.77",
          kode_prov: "13",
        },
        {
          nama: "Kabupaten Kampar",
          kode: "14.01",
          kode_prov: "14",
        },
        {
          nama: "Kabupaten Indragiri Hulu",
          kode: "14.02",
          kode_prov: "14",
        },
        {
          nama: "Kabupaten Bengkalis",
          kode: "14.03",
          kode_prov: "14",
        },
        {
          nama: "Kabupaten Indragiri Hilir",
          kode: "14.04",
          kode_prov: "14",
        },
        {
          nama: "Kabupaten Pelalawan",
          kode: "14.05",
          kode_prov: "14",
        },
        {
          nama: "Kabupaten Rokan Hulu",
          kode: "14.06",
          kode_prov: "14",
        },
        {
          nama: "Kabupaten Rokan Hilir",
          kode: "14.07",
          kode_prov: "14",
        },
        {
          nama: "Kabupaten Siak",
          kode: "14.08",
          kode_prov: "14",
        },
        {
          nama: "Kabupaten Kuantan Singingi",
          kode: "14.09",
          kode_prov: "14",
        },
        {
          nama: "Kabupaten Kepulauan Meranti",
          kode: "14.1",
          kode_prov: "14",
        },
        {
          nama: "Kota Pekanbaru",
          kode: "14.71",
          kode_prov: "14",
        },
        {
          nama: "Kota Dumai",
          kode: "14.72",
          kode_prov: "14",
        },
        {
          nama: "Kabupaten Kerinci",
          kode: "15.01",
          kode_prov: "15",
        },
        {
          nama: "Kabupaten Merangin",
          kode: "15.02",
          kode_prov: "15",
        },
        {
          nama: "Kabupaten Sarolangun",
          kode: "15.03",
          kode_prov: "15",
        },
        {
          nama: "Kabupaten Batang Hari",
          kode: "15.04",
          kode_prov: "15",
        },
        {
          nama: "Kabupaten Muaro Jambi",
          kode: "15.05",
          kode_prov: "15",
        },
        {
          nama: "Kabupaten Tanjung Jabung Barat",
          kode: "15.06",
          kode_prov: "15",
        },
        {
          nama: "Kabupaten Tanjung Jabung Timur",
          kode: "15.07",
          kode_prov: "15",
        },
        {
          nama: "Kabupaten Bungo",
          kode: "15.08",
          kode_prov: "15",
        },
        {
          nama: "Kabupaten Tebo",
          kode: "15.09",
          kode_prov: "15",
        },
        {
          nama: "Kota Jambi",
          kode: "15.71",
          kode_prov: "15",
        },
        {
          nama: "Kota Sungaipenuh",
          kode: "15.72",
          kode_prov: "15",
        },
        {
          nama: "Kabupaten Ogan Komering Ulu",
          kode: "16.01",
          kode_prov: "16",
        },
        {
          nama: "Kabupaten Ogan Komering Ilir",
          kode: "16.02",
          kode_prov: "16",
        },
        {
          nama: "Kabupaten Muara Enim",
          kode: "16.03",
          kode_prov: "16",
        },
        {
          nama: "Kabupaten Lahat",
          kode: "16.04",
          kode_prov: "16",
        },
        {
          nama: "Kabupaten Musi Rawas",
          kode: "16.05",
          kode_prov: "16",
        },
        {
          nama: "Kabupaten Musi Banyuasin",
          kode: "16.06",
          kode_prov: "16",
        },
        {
          nama: "Kabupaten Banyuasin",
          kode: "16.07",
          kode_prov: "16",
        },
        {
          nama: "Kabupaten Ogan Komering Ulu Timur",
          kode: "16.08",
          kode_prov: "16",
        },
        {
          nama: "Kabupaten Ogan Komering Ulu Selatan",
          kode: "16.09",
          kode_prov: "16",
        },
        {
          nama: "Kabupaten Ogan Ilir",
          kode: "16.1",
          kode_prov: "16",
        },
        {
          nama: "Kabupaten Empat Lawang",
          kode: "16.11",
          kode_prov: "16",
        },
        {
          nama: "Kabupaten Penukal Abab Lematang Ilir",
          kode: "16.12",
          kode_prov: "16",
        },
        {
          nama: "Kabupaten Musi Rawas Utara",
          kode: "16.13",
          kode_prov: "16",
        },
        {
          nama: "Kota Palembang",
          kode: "16.71",
          kode_prov: "16",
        },
        {
          nama: "Kota Pagar Alam",
          kode: "16.72",
          kode_prov: "16",
        },
        {
          nama: "Kota Lubuk Linggau",
          kode: "16.73",
          kode_prov: "16",
        },
        {
          nama: "Kota Prabumulih",
          kode: "16.74",
          kode_prov: "16",
        },
        {
          nama: "Kabupaten Bengkulu Selatan",
          kode: "17.01",
          kode_prov: "17",
        },
        {
          nama: "Kabupaten Rejang Lebong",
          kode: "17.02",
          kode_prov: "17",
        },
        {
          nama: "Kabupaten Bengkulu Utara",
          kode: "17.03",
          kode_prov: "17",
        },
        {
          nama: "Kabupaten Kaur",
          kode: "17.04",
          kode_prov: "17",
        },
        {
          nama: "Kabupaten Seluma",
          kode: "17.05",
          kode_prov: "17",
        },
        {
          nama: "Kabupaten Muko Muko",
          kode: "17.06",
          kode_prov: "17",
        },
        {
          nama: "Kabupaten Lebong",
          kode: "17.07",
          kode_prov: "17",
        },
        {
          nama: "Kabupaten Kepahiang",
          kode: "17.08",
          kode_prov: "17",
        },
        {
          nama: "Kabupaten Bengkulu Tengah",
          kode: "17.09",
          kode_prov: "17",
        },
        {
          nama: "Kota Bengkulu",
          kode: "17.71",
          kode_prov: "17",
        },
        {
          nama: "Kabupaten Lampung Selatan",
          kode: "18.01",
          kode_prov: "18",
        },
        {
          nama: "Kabupaten Lampung Tengah",
          kode: "18.02",
          kode_prov: "18",
        },
        {
          nama: "Kabupaten Lampung Utara",
          kode: "18.03",
          kode_prov: "18",
        },
        {
          nama: "Kabupaten Lampung Barat",
          kode: "18.04",
          kode_prov: "18",
        },
        {
          nama: "Kabupaten Tulang Bawang",
          kode: "18.05",
          kode_prov: "18",
        },
        {
          nama: "Kabupaten Tanggamus",
          kode: "18.06",
          kode_prov: "18",
        },
        {
          nama: "Kabupaten Lampung Timur",
          kode: "18.07",
          kode_prov: "18",
        },
        {
          nama: "Kabupaten Way Kanan",
          kode: "18.08",
          kode_prov: "18",
        },
        {
          nama: "Kabupaten Pesawaran",
          kode: "18.09",
          kode_prov: "18",
        },
        {
          nama: "Kabupaten Pringsewu",
          kode: "18.1",
          kode_prov: "18",
        },
        {
          nama: "Kabupaten Mesuji",
          kode: "18.11",
          kode_prov: "18",
        },
        {
          nama: "Kabupaten Tulang Bawang Barat",
          kode: "18.12",
          kode_prov: "18",
        },
        {
          nama: "Kabupaten Pesisir Barat",
          kode: "18.13",
          kode_prov: "18",
        },
        {
          nama: "Kota Bandar Lampung",
          kode: "18.71",
          kode_prov: "18",
        },
        {
          nama: "Kota Metro",
          kode: "18.72",
          kode_prov: "18",
        },
        {
          nama: "Kabupaten Bangka",
          kode: "19.01",
          kode_prov: "19",
        },
        {
          nama: "Kabupaten Belitung",
          kode: "19.02",
          kode_prov: "19",
        },
        {
          nama: "Kabupaten Bangka Selatan",
          kode: "19.03",
          kode_prov: "19",
        },
        {
          nama: "Kabupaten Bangka Tengah",
          kode: "19.04",
          kode_prov: "19",
        },
        {
          nama: "Kabupaten Bangka Barat",
          kode: "19.05",
          kode_prov: "19",
        },
        {
          nama: "Kabupaten Belitung Timur",
          kode: "19.06",
          kode_prov: "19",
        },
        {
          nama: "Kota Pangkal Pinang",
          kode: "19.71",
          kode_prov: "19",
        },
        {
          nama: "Kabupaten Bintan",
          kode: "21.01",
          kode_prov: "21",
        },
        {
          nama: "Kabupaten Karimun",
          kode: "21.02",
          kode_prov: "21",
        },
        {
          nama: "Kabupaten Natuna",
          kode: "21.03",
          kode_prov: "21",
        },
        {
          nama: "Kabupaten Lingga",
          kode: "21.04",
          kode_prov: "21",
        },
        {
          nama: "Kabupaten Kepulauan Anambas",
          kode: "21.05",
          kode_prov: "21",
        },
        {
          nama: "Kota Batam",
          kode: "21.71",
          kode_prov: "21",
        },
        {
          nama: "Kota Tanjung Pinang",
          kode: "21.72",
          kode_prov: "21",
        },
        {
          nama: "Kabupaten Kepulauan Seribu",
          kode: "31.01",
          kode_prov: "31",
        },
        {
          nama: "Kota Jakarta Pusat",
          kode: "31.71",
          kode_prov: "31",
        },
        {
          nama: "Kota Jakarta Utara",
          kode: "31.72",
          kode_prov: "31",
        },
        {
          nama: "Kota Jakarta Barat",
          kode: "31.73",
          kode_prov: "31",
        },
        {
          nama: "Kota Jakarta Selatan",
          kode: "31.74",
          kode_prov: "31",
        },
        {
          nama: "Kota Jakarta Timur",
          kode: "31.75",
          kode_prov: "31",
        },
        {
          nama: "Kabupaten Bogor",
          kode: "32.01",
          kode_prov: "32",
        },
        {
          nama: "Kabupaten Sukabumi",
          kode: "32.02",
          kode_prov: "32",
        },
        {
          nama: "Kabupaten Cianjur",
          kode: "32.03",
          kode_prov: "32",
        },
        {
          nama: "Kabupaten Bandung",
          kode: "32.04",
          kode_prov: "32",
        },
        {
          nama: "Kabupaten Garut",
          kode: "32.05",
          kode_prov: "32",
        },
        {
          nama: "Kabupaten Tasikmalaya",
          kode: "32.06",
          kode_prov: "32",
        },
        {
          nama: "Kabupaten Ciamis",
          kode: "32.07",
          kode_prov: "32",
        },
        {
          nama: "Kabupaten Kuningan",
          kode: "32.08",
          kode_prov: "32",
        },
        {
          nama: "Kabupaten Cirebon",
          kode: "32.09",
          kode_prov: "32",
        },
        {
          nama: "Kabupaten Majalengka",
          kode: "32.1",
          kode_prov: "32",
        },
        {
          nama: "Kabupaten Sumedang",
          kode: "32.11",
          kode_prov: "32",
        },
        {
          nama: "Kabupaten Indramayu",
          kode: "32.12",
          kode_prov: "32",
        },
        {
          nama: "Kabupaten Subang",
          kode: "32.13",
          kode_prov: "32",
        },
        {
          nama: "Kabupaten Purwakarta",
          kode: "32.14",
          kode_prov: "32",
        },
        {
          nama: "Kabupaten Karawang",
          kode: "32.15",
          kode_prov: "32",
        },
        {
          nama: "Kabupaten Bekasi",
          kode: "32.16",
          kode_prov: "32",
        },
        {
          nama: "Kabupaten Bandung Barat",
          kode: "32.17",
          kode_prov: "32",
        },
        {
          nama: "Kabupaten Pangandaran",
          kode: "32.18",
          kode_prov: "32",
        },
        {
          nama: "Kota Bogor",
          kode: "32.71",
          kode_prov: "32",
        },
        {
          nama: "Kota Sukabumi",
          kode: "32.72",
          kode_prov: "32",
        },
        {
          nama: "Kota Bandung",
          kode: "32.73",
          kode_prov: "32",
        },
        {
          nama: "Kota Cirebon",
          kode: "32.74",
          kode_prov: "32",
        },
        {
          nama: "Kota Bekasi",
          kode: "32.75",
          kode_prov: "32",
        },
        {
          nama: "Kota Depok",
          kode: "32.76",
          kode_prov: "32",
        },
        {
          nama: "Kota Cimahi",
          kode: "32.77",
          kode_prov: "32",
        },
        {
          nama: "Kota Tasikmalaya",
          kode: "32.78",
          kode_prov: "32",
        },
        {
          nama: "Kota Banjar",
          kode: "32.79",
          kode_prov: "32",
        },
        {
          nama: "Kabupaten Cilacap",
          kode: "33.01",
          kode_prov: "33",
        },
        {
          nama: "Kabupaten Banyumas",
          kode: "33.02",
          kode_prov: "33",
        },
        {
          nama: "Kabupaten Purbalingga",
          kode: "33.03",
          kode_prov: "33",
        },
        {
          nama: "Kabupaten Banjarnegara",
          kode: "33.04",
          kode_prov: "33",
        },
        {
          nama: "Kabupaten Kebumen",
          kode: "33.05",
          kode_prov: "33",
        },
        {
          nama: "Kabupaten Purworejo",
          kode: "33.06",
          kode_prov: "33",
        },
        {
          nama: "Kabupaten Wonosobo",
          kode: "33.07",
          kode_prov: "33",
        },
        {
          nama: "Kabupaten Magelang",
          kode: "33.08",
          kode_prov: "33",
        },
        {
          nama: "Kabupaten Boyolali",
          kode: "33.09",
          kode_prov: "33",
        },
        {
          nama: "Kabupaten Klaten",
          kode: "33.1",
          kode_prov: "33",
        },
        {
          nama: "Kabupaten Sukoharjo",
          kode: "33.11",
          kode_prov: "33",
        },
        {
          nama: "Kabupaten Wonogiri",
          kode: "33.12",
          kode_prov: "33",
        },
        {
          nama: "Kabupaten Karanganyar",
          kode: "33.13",
          kode_prov: "33",
        },
        {
          nama: "Kabupaten Sragen",
          kode: "33.14",
          kode_prov: "33",
        },
        {
          nama: "Kabupaten Grobogan",
          kode: "33.15",
          kode_prov: "33",
        },
        {
          nama: "Kota Magelang",
          kode: "33.71",
          kode_prov: "33",
        },
        {
          nama: "Kota Surakarta",
          kode: "33.72",
          kode_prov: "33",
        },
        {
          nama: "Kota Salatiga",
          kode: "33.73",
          kode_prov: "33",
        },
        {
          nama: "Kota Semarang",
          kode: "33.74",
          kode_prov: "33",
        },
        {
          nama: "Kota Pekalongan",
          kode: "33.75",
          kode_prov: "33",
        },
        {
          nama: "Kota Tegal",
          kode: "33.76",
          kode_prov: "33",
        },
        {
          nama: "Kabupaten Kulon Progo",
          kode: "34.01",
          kode_prov: "34",
        },
        {
          nama: "Kabupaten Bantul",
          kode: "34.02",
          kode_prov: "34",
        },
        {
          nama: "Kabupaten Gunung Kidul",
          kode: "34.03",
          kode_prov: "34",
        },
        {
          nama: "Kabupaten Sleman",
          kode: "34.04",
          kode_prov: "34",
        },
        {
          nama: "Kota Yogyakarta",
          kode: "34.71",
          kode_prov: "34",
        },
        {
          nama: "Kabupaten Pacitan",
          kode: "35.01",
          kode_prov: "35",
        },
        {
          nama: "Kabupaten Ponorogo",
          kode: "35.02",
          kode_prov: "35",
        },
        {
          nama: "Kabupaten Trenggalek",
          kode: "35.03",
          kode_prov: "35",
        },
        {
          nama: "Kabupaten Tulungagung",
          kode: "35.04",
          kode_prov: "35",
        },
        {
          nama: "Kabupaten Blitar",
          kode: "35.05",
          kode_prov: "35",
        },
        {
          nama: "Kabupaten Kediri",
          kode: "35.06",
          kode_prov: "35",
        },
        {
          nama: "Kabupaten Malang",
          kode: "35.07",
          kode_prov: "35",
        },
        {
          nama: "Kabupaten Lumajang",
          kode: "35.08",
          kode_prov: "35",
        },
        {
          nama: "Kabupaten Jember",
          kode: "35.09",
          kode_prov: "35",
        },
        {
          nama: "Kabupaten Banyuwangi",
          kode: "35.1",
          kode_prov: "35",
        },
        {
          nama: "Kabupaten Bondowoso",
          kode: "35.11",
          kode_prov: "35",
        },
        {
          nama: "Kabupaten Situbondo",
          kode: "35.12",
          kode_prov: "35",
        },
        {
          nama: "Kabupaten Probolinggo",
          kode: "35.13",
          kode_prov: "35",
        },
        {
          nama: "Kabupaten Pasuruan",
          kode: "35.14",
          kode_prov: "35",
        },
        {
          nama: "Kabupaten Sidoarjo",
          kode: "35.15",
          kode_prov: "35",
        },
        {
          nama: "Kabupaten Mojokerto",
          kode: "35.16",
          kode_prov: "35",
        },
        {
          nama: "Kabupaten Jombang",
          kode: "35.17",
          kode_prov: "35",
        },
        {
          nama: "Kabupaten Nganjuk",
          kode: "35.18",
          kode_prov: "35",
        },
        {
          nama: "Kabupaten Madiun",
          kode: "35.19",
          kode_prov: "35",
        },
        {
          nama: "Kabupaten Magetan",
          kode: "35.2",
          kode_prov: "35",
        },
        {
          nama: "Kabupaten Ngawi",
          kode: "35.21",
          kode_prov: "35",
        },
        {
          nama: "Kabupaten Bojonegoro",
          kode: "35.22",
          kode_prov: "35",
        },
        {
          nama: "Kabupaten Tuban",
          kode: "35.23",
          kode_prov: "35",
        },
        {
          nama: "Kabupaten Lamongan",
          kode: "35.24",
          kode_prov: "35",
        },
        {
          nama: "Kabupaten Gresik",
          kode: "35.25",
          kode_prov: "35",
        },
        {
          nama: "Kabupaten Bangkalan",
          kode: "35.26",
          kode_prov: "35",
        },
        {
          nama: "Kabupaten Sampang",
          kode: "35.27",
          kode_prov: "35",
        },
        {
          nama: "Kabupaten Pamekasan",
          kode: "35.28",
          kode_prov: "35",
        },
        {
          nama: "Kabupaten Sumenep",
          kode: "35.29",
          kode_prov: "35",
        },
        {
          nama: "Kota Kediri",
          kode: "35.71",
          kode_prov: "35",
        },
        {
          nama: "Kota Blitar",
          kode: "35.72",
          kode_prov: "35",
        },
        {
          nama: "Kota Malang",
          kode: "35.73",
          kode_prov: "35",
        },
        {
          nama: "Kota Probolinggo",
          kode: "35.74",
          kode_prov: "35",
        },
        {
          nama: "Kota Pasuruan",
          kode: "35.75",
          kode_prov: "35",
        },
        {
          nama: "Kota Mojokerto",
          kode: "35.76",
          kode_prov: "35",
        },
        {
          nama: "Kota Madiun",
          kode: "35.77",
          kode_prov: "35",
        },
        {
          nama: "Kota Surabaya",
          kode: "35.78",
          kode_prov: "35",
        },
        {
          nama: "Kota Batu",
          kode: "35.79",
          kode_prov: "35",
        },
        {
          nama: "Kabupaten Pandeglang",
          kode: "36.01",
          kode_prov: "36",
        },
        {
          nama: "Kabupaten Lebak",
          kode: "36.02",
          kode_prov: "36",
        },
        {
          nama: "Kabupaten Tangerang",
          kode: "36.03",
          kode_prov: "36",
        },
        {
          nama: "Kabupaten Serang",
          kode: "36.04",
          kode_prov: "36",
        },
        {
          nama: "Kota Tangerang",
          kode: "36.71",
          kode_prov: "36",
        },
        {
          nama: "Kota Cilegon",
          kode: "36.72",
          kode_prov: "36",
        },
        {
          nama: "Kota Serang",
          kode: "36.73",
          kode_prov: "36",
        },
        {
          nama: "Kota Tangerang Selatan",
          kode: "36.74",
          kode_prov: "36",
        },
        {
          nama: "Kabupaten Jembrana",
          kode: "51.01",
          kode_prov: "51",
        },
        {
          nama: "Kabupaten Tabanan",
          kode: "51.02",
          kode_prov: "51",
        },
        {
          nama: "Kabupaten Badung",
          kode: "51.03",
          kode_prov: "51",
        },
        {
          nama: "Kabupaten Gianyar",
          kode: "51.04",
          kode_prov: "51",
        },
        {
          nama: "Kabupaten Klungkung",
          kode: "51.05",
          kode_prov: "51",
        },
        {
          nama: "Kabupaten Bangli",
          kode: "51.06",
          kode_prov: "51",
        },
        {
          nama: "Kabupaten Karangasem",
          kode: "51.07",
          kode_prov: "51",
        },
        {
          nama: "Kabupaten Buleleng",
          kode: "51.08",
          kode_prov: "51",
        },
        {
          nama: "Kota Denpasar",
          kode: "51.71",
          kode_prov: "51",
        },
        {
          nama: "Kabupaten Lombok Barat",
          kode: "52.01",
          kode_prov: "52",
        },
        {
          nama: "Kabupaten Lombok Tengah",
          kode: "52.02",
          kode_prov: "52",
        },
        {
          nama: "Kabupaten Lombok Timur",
          kode: "52.03",
          kode_prov: "52",
        },
        {
          nama: "Kabupaten Sumbawa",
          kode: "52.04",
          kode_prov: "52",
        },
        {
          nama: "Kabupaten Dompu",
          kode: "52.05",
          kode_prov: "52",
        },
        {
          nama: "Kabupaten Bima",
          kode: "52.06",
          kode_prov: "52",
        },
        {
          nama: "Kabupaten Sumbawa Barat",
          kode: "52.07",
          kode_prov: "52",
        },
        {
          nama: "Kabupaten Lombok Utara",
          kode: "52.08",
          kode_prov: "52",
        },
        {
          nama: "Kota Mataram",
          kode: "52.71",
          kode_prov: "52",
        },
        {
          nama: "Kota Bima",
          kode: "52.72",
          kode_prov: "52",
        },
        {
          nama: "Kabupaten Kupang",
          kode: "53.01",
          kode_prov: "53",
        },
        {
          nama: "Kabupaten Timor Tengah Selatan",
          kode: "53.02",
          kode_prov: "53",
        },
        {
          nama: "Kabupaten Timor Tengah Utara",
          kode: "53.03",
          kode_prov: "53",
        },
        {
          nama: "Kabupaten Belu",
          kode: "53.04",
          kode_prov: "53",
        },
        {
          nama: "Kabupaten Alor",
          kode: "53.05",
          kode_prov: "53",
        },
        {
          nama: "Kabupaten Flores Timur",
          kode: "53.06",
          kode_prov: "53",
        },
        {
          nama: "Kabupaten Sikka",
          kode: "53.07",
          kode_prov: "53",
        },
        {
          nama: "Kabupaten Ende",
          kode: "53.08",
          kode_prov: "53",
        },
        {
          nama: "Kabupaten Ngada",
          kode: "53.09",
          kode_prov: "53",
        },
        {
          nama: "Kabupaten Manggarai",
          kode: "53.1",
          kode_prov: "53",
        },
        {
          nama: "Kabupaten Sumba Timur",
          kode: "53.11",
          kode_prov: "53",
        },
        {
          nama: "Kabupaten Sumba Barat",
          kode: "53.12",
          kode_prov: "53",
        },
        {
          nama: "Kabupaten Lembata",
          kode: "53.13",
          kode_prov: "53",
        },
        {
          nama: "Kabupaten Rote Ndao",
          kode: "53.14",
          kode_prov: "53",
        },
        {
          nama: "Kabupaten Manggarai Barat",
          kode: "53.15",
          kode_prov: "53",
        },
        {
          nama: "Kabupaten Nagekeo",
          kode: "53.16",
          kode_prov: "53",
        },
        {
          nama: "Kabupaten Sumba Tengah",
          kode: "53.17",
          kode_prov: "53",
        },
        {
          nama: "Kabupaten Sumba Barat Daya",
          kode: "53.18",
          kode_prov: "53",
        },
        {
          nama: "Kabupaten Manggarai Timur",
          kode: "53.19",
          kode_prov: "53",
        },
        {
          nama: "Kabupaten Sabu Raijua",
          kode: "53.2",
          kode_prov: "53",
        },
        {
          nama: "Kabupaten Malaka",
          kode: "53.21",
          kode_prov: "53",
        },
        {
          nama: "Kota Kupang",
          kode: "53.71",
          kode_prov: "53",
        },
        {
          nama: "Kabupaten Sambas",
          kode: "61.01",
          kode_prov: "61",
        },
        {
          nama: "Kabupaten Mempawah",
          kode: "61.02",
          kode_prov: "61",
        },
        {
          nama: "Kabupaten Sanggau",
          kode: "61.03",
          kode_prov: "61",
        },
        {
          nama: "Kabupaten Ketapang",
          kode: "61.04",
          kode_prov: "61",
        },
        {
          nama: "Kabupaten Sintang",
          kode: "61.05",
          kode_prov: "61",
        },
        {
          nama: "Kabupaten Kapuas Hulu",
          kode: "61.06",
          kode_prov: "61",
        },
        {
          nama: "Kabupaten Bengkayang",
          kode: "61.07",
          kode_prov: "61",
        },
        {
          nama: "Kabupaten Landak",
          kode: "61.08",
          kode_prov: "61",
        },
        {
          nama: "Kabupaten Sekadau",
          kode: "61.09",
          kode_prov: "61",
        },
        {
          nama: "Kabupaten Melawi",
          kode: "61.1",
          kode_prov: "61",
        },
        {
          nama: "Kabupaten Kayong Utara",
          kode: "61.11",
          kode_prov: "61",
        },
        {
          nama: "Kabupaten Kubu Raya",
          kode: "61.12",
          kode_prov: "61",
        },
        {
          nama: "Kota Pontianak",
          kode: "61.71",
          kode_prov: "61",
        },
        {
          nama: "Kota Singkawang",
          kode: "61.72",
          kode_prov: "61",
        },
        {
          nama: "Kabupaten Kotawaringin Barat",
          kode: "62.01",
          kode_prov: "62",
        },
        {
          nama: "Kabupaten Kotawaringin Timur",
          kode: "62.02",
          kode_prov: "62",
        },
        {
          nama: "Kabupaten Kapuas",
          kode: "62.03",
          kode_prov: "62",
        },
        {
          nama: "Kabupaten Barito Selatan",
          kode: "62.04",
          kode_prov: "62",
        },
        {
          nama: "Kabupaten Barito Utara",
          kode: "62.05",
          kode_prov: "62",
        },
        {
          nama: "Kabupaten Katingan",
          kode: "62.06",
          kode_prov: "62",
        },
        {
          nama: "Kabupaten Seruyan",
          kode: "62.07",
          kode_prov: "62",
        },
        {
          nama: "Kabupaten Sukamara",
          kode: "62.08",
          kode_prov: "62",
        },
        {
          nama: "Kabupaten Lamandau",
          kode: "62.09",
          kode_prov: "62",
        },
        {
          nama: "Kabupaten Gunung Mas",
          kode: "62.1",
          kode_prov: "62",
        },
        {
          nama: "Kabupaten Pulang Pisau",
          kode: "62.11",
          kode_prov: "62",
        },
        {
          nama: "Kabupaten Murung Raya",
          kode: "62.12",
          kode_prov: "62",
        },
        {
          nama: "Kabupaten Barito Timur",
          kode: "62.13",
          kode_prov: "62",
        },
        {
          nama: "Kota Palangka Raya",
          kode: "62.71",
          kode_prov: "62",
        },
        {
          nama: "Kabupaten Kutai Kartanegara",
          kode: "64.02",
          kode_prov: "64",
        },
        {
          nama: "Kabupaten Berau",
          kode: "64.03",
          kode_prov: "64",
        },
        {
          nama: "Kabupaten Kutai Barat",
          kode: "64.07",
          kode_prov: "64",
        },
        {
          nama: "Kabupaten Kutai Timur",
          kode: "64.08",
          kode_prov: "64",
        },
        {
          nama: "Kabupaten Penajam Paser Utara",
          kode: "64.09",
          kode_prov: "64",
        },
        {
          nama: "Kabupaten Mahakam Ulu",
          kode: "64.11",
          kode_prov: "64",
        },
        {
          nama: "Kota Balikpapan",
          kode: "64.71",
          kode_prov: "64",
        },
        {
          nama: "Kota Samarinda",
          kode: "64.72",
          kode_prov: "64",
        },
        {
          nama: "Kota Bontang",
          kode: "64.74",
          kode_prov: "64",
        },
        {
          nama: "Kabupaten Bulungan",
          kode: "65.01",
          kode_prov: "65",
        },
        {
          nama: "Kabupaten Malinau",
          kode: "65.02",
          kode_prov: "65",
        },
        {
          nama: "Kabupaten Nunukan",
          kode: "65.03",
          kode_prov: "65",
        },
        {
          nama: "Kabupaten Tana Tidung",
          kode: "65.04",
          kode_prov: "65",
        },
        {
          nama: "Kota Tarakan",
          kode: "65.71",
          kode_prov: "65",
        },
        {
          nama: "Kabupaten Bolaang Mongondow",
          kode: "71.01",
          kode_prov: "71",
        },
        {
          nama: "Kabupaten Minahasa",
          kode: "71.02",
          kode_prov: "71",
        },
        {
          nama: "Kabupaten Kepulauan Sangihe",
          kode: "71.03",
          kode_prov: "71",
        },
        {
          nama: "Kabupaten Kepulauan Talaud",
          kode: "71.04",
          kode_prov: "71",
        },
        {
          nama: "Kabupaten Minahasa Selatan",
          kode: "71.05",
          kode_prov: "71",
        },
        {
          nama: "Kabupaten Minahasa Utara",
          kode: "71.06",
          kode_prov: "71",
        },
        {
          nama: "Kabupaten Minahasa Tenggara",
          kode: "71.07",
          kode_prov: "71",
        },
        {
          nama: "Kabupaten Bolaang Mongondow Utara",
          kode: "71.08",
          kode_prov: "71",
        },
        {
          nama: "Kabupaten Kepulauan Siau Tagulandang Biaro (Sitaro)",
          kode: "71.09",
          kode_prov: "71",
        },
        {
          nama: "Kabupaten Bolaang Mongondow Timur",
          kode: "71.1",
          kode_prov: "71",
        },
        {
          nama: "Kabupaten Bolaang Mongondow Selatan",
          kode: "71.11",
          kode_prov: "71",
        },
        {
          nama: "Kota Manado",
          kode: "71.71",
          kode_prov: "71",
        },
        {
          nama: "Kota Bitung",
          kode: "71.72",
          kode_prov: "71",
        },
        {
          nama: "Kota Tomohon",
          kode: "71.73",
          kode_prov: "71",
        },
        {
          nama: "Kota Kotamobagu",
          kode: "71.74",
          kode_prov: "71",
        },
        {
          nama: "Kabupaten Banggai",
          kode: "72.01",
          kode_prov: "72",
        },
        {
          nama: "Kabupaten Poso",
          kode: "72.02",
          kode_prov: "72",
        },
        {
          nama: "Kabupaten Donggala",
          kode: "72.03",
          kode_prov: "72",
        },
        {
          nama: "Kabupaten Toli-Toli",
          kode: "72.04",
          kode_prov: "72",
        },
        {
          nama: "Kabupaten Buol",
          kode: "72.05",
          kode_prov: "72",
        },
        {
          nama: "Kabupaten Morowali",
          kode: "72.06",
          kode_prov: "72",
        },
        {
          nama: "Kabupaten Banggai Kepulauan",
          kode: "72.07",
          kode_prov: "72",
        },
        {
          nama: "Kabupaten Parigi Moutong",
          kode: "72.08",
          kode_prov: "72",
        },
        {
          nama: "Kabupaten Tojo Una-Una",
          kode: "72.09",
          kode_prov: "72",
        },
        {
          nama: "Kabupaten Sigi",
          kode: "72.1",
          kode_prov: "72",
        },
        {
          nama: "Kabupaten Banggai Laut",
          kode: "72.11",
          kode_prov: "72",
        },
        {
          nama: "Kabupaten Morowali Utara",
          kode: "72.12",
          kode_prov: "72",
        },
        {
          nama: "Kota Palu",
          kode: "72.71",
          kode_prov: "72",
        },
        {
          nama: "Kabupaten Kepulauan Selayar",
          kode: "73.01",
          kode_prov: "73",
        },
        {
          nama: "Kabupaten Bulukumba",
          kode: "73.02",
          kode_prov: "73",
        },
        {
          nama: "Kabupaten Bantaeng",
          kode: "73.03",
          kode_prov: "73",
        },
        {
          nama: "Kabupaten Jeneponto",
          kode: "73.04",
          kode_prov: "73",
        },
        {
          nama: "Kabupaten Takalar",
          kode: "73.05",
          kode_prov: "73",
        },
        {
          nama: "Kabupaten Gowa",
          kode: "73.06",
          kode_prov: "73",
        },
        {
          nama: "Kabupaten Sinjai",
          kode: "73.07",
          kode_prov: "73",
        },
        {
          nama: "Kabupaten Bone",
          kode: "73.08",
          kode_prov: "73",
        },
        {
          nama: "Kabupaten Maros",
          kode: "73.09",
          kode_prov: "73",
        },
        {
          nama: "Kabupaten Pangkajene Kepulauan",
          kode: "73.1",
          kode_prov: "73",
        },
        {
          nama: "Kabupaten Barru",
          kode: "73.11",
          kode_prov: "73",
        },
        {
          nama: "Kabupaten Soppeng",
          kode: "73.12",
          kode_prov: "73",
        },
        {
          nama: "Kabupaten Wajo",
          kode: "73.13",
          kode_prov: "73",
        },
        {
          nama: "Kabupaten Sidenreng Rappang",
          kode: "73.14",
          kode_prov: "73",
        },
        {
          nama: "Kabupaten Pinrang",
          kode: "73.15",
          kode_prov: "73",
        },
        {
          nama: "Kabupaten Enrekang",
          kode: "73.16",
          kode_prov: "73",
        },
        {
          nama: "Kabupaten Luwu",
          kode: "73.17",
          kode_prov: "73",
        },
        {
          nama: "Kabupaten Tana Toraja",
          kode: "73.18",
          kode_prov: "73",
        },
        {
          nama: "Kabupaten Luwu Utara",
          kode: "73.22",
          kode_prov: "73",
        },
        {
          nama: "Kabupaten Luwu Timur",
          kode: "73.24",
          kode_prov: "73",
        },
        {
          nama: "Kabupaten Toraja Utara",
          kode: "73.26",
          kode_prov: "73",
        },
        {
          nama: "Kota Makassar",
          kode: "73.71",
          kode_prov: "73",
        },
        {
          nama: "Kota Parepare",
          kode: "73.72",
          kode_prov: "73",
        },
        {
          nama: "Kota Palopo",
          kode: "73.73",
          kode_prov: "73",
        },
        {
          nama: "Kabupaten Kolaka",
          kode: "74.01",
          kode_prov: "74",
        },
        {
          nama: "Kabupaten Konawe",
          kode: "74.02",
          kode_prov: "74",
        },
        {
          nama: "Kabupaten Muna",
          kode: "74.03",
          kode_prov: "74",
        },
        {
          nama: "Kabupaten Buton",
          kode: "74.04",
          kode_prov: "74",
        },
        {
          nama: "Kabupaten Konawe Selatan",
          kode: "74.05",
          kode_prov: "74",
        },
        {
          nama: "Kabupaten Bombana",
          kode: "74.06",
          kode_prov: "74",
        },
        {
          nama: "Kabupaten Wakatobi",
          kode: "74.07",
          kode_prov: "74",
        },
        {
          nama: "Kabupaten Kolaka Utara",
          kode: "74.08",
          kode_prov: "74",
        },
        {
          nama: "Kabupaten Konawe Utara",
          kode: "74.09",
          kode_prov: "74",
        },
        {
          nama: "Kabupaten Buton Utara",
          kode: "74.1",
          kode_prov: "74",
        },
        {
          nama: "Kabupaten Kolaka Timur",
          kode: "74.11",
          kode_prov: "74",
        },
        {
          nama: "Kabupaten Konawe Kepulauan",
          kode: "74.12",
          kode_prov: "74",
        },
        {
          nama: "Kabupaten Muna Barat",
          kode: "74.13",
          kode_prov: "74",
        },
        {
          nama: "Kabupaten Buton Tengah",
          kode: "74.14",
          kode_prov: "74",
        },
        {
          nama: "Kabupaten Buton Selatan",
          kode: "74.15",
          kode_prov: "74",
        },
        {
          nama: "Kota Kendari",
          kode: "74.71",
          kode_prov: "74",
        },
        {
          nama: "Kota Bau-Bau",
          kode: "74.72",
          kode_prov: "74",
        },
        {
          nama: "Kabupaten Gorontalo",
          kode: "75.01",
          kode_prov: "75",
        },
        {
          nama: "Kabupaten Boalemo",
          kode: "75.02",
          kode_prov: "75",
        },
        {
          nama: "Kabupaten Bone Bolango",
          kode: "75.03",
          kode_prov: "75",
        },
        {
          nama: "Kabupaten Pohuwato",
          kode: "75.04",
          kode_prov: "75",
        },
        {
          nama: "Kabupaten Gorontalo Utara",
          kode: "75.05",
          kode_prov: "75",
        },
        {
          nama: "Kota Gorontalo",
          kode: "75.71",
          kode_prov: "75",
        },
        {
          nama: "Kabupaten Pasangkayu (Mamuju Utara)",
          kode: "76.01",
          kode_prov: "76",
        },
        {
          nama: "Kabupaten Mamuju",
          kode: "76.02",
          kode_prov: "76",
        },
        {
          nama: "Kabupaten Mamasa",
          kode: "76.03",
          kode_prov: "76",
        },
        {
          nama: "Kabupaten Polewali Mandar",
          kode: "76.04",
          kode_prov: "76",
        },
        {
          nama: "Kabupaten Majene",
          kode: "76.05",
          kode_prov: "76",
        },
        {
          nama: "Kabupaten Mamuju Tengah",
          kode: "76.06",
          kode_prov: "76",
        },
        {
          nama: "Kabupaten Maluku Tengah",
          kode: "81.01",
          kode_prov: "81",
        },
        {
          nama: "Kabupaten Maluku Tenggara",
          kode: "81.02",
          kode_prov: "81",
        },
        {
          nama: "Kabupaten Kepulauan Tanimbar (Maluku Tenggara Barat)",
          kode: "81.03",
          kode_prov: "81",
        },
        {
          nama: "Kabupaten Buru",
          kode: "81.04",
          kode_prov: "81",
        },
        {
          nama: "Kabupaten Seram Bagian Timur",
          kode: "81.05",
          kode_prov: "81",
        },
        {
          nama: "Kabupaten Seram Bagian Barat",
          kode: "81.06",
          kode_prov: "81",
        },
        {
          nama: "Kabupaten Kepulauan Aru",
          kode: "81.07",
          kode_prov: "81",
        },
        {
          nama: "Kabupaten Maluku Barat Daya",
          kode: "81.08",
          kode_prov: "81",
        },
        {
          nama: "Kabupaten Buru Selatan",
          kode: "81.09",
          kode_prov: "81",
        },
        {
          nama: "Kota Ambon",
          kode: "81.71",
          kode_prov: "81",
        },
        {
          nama: "Kota Tual",
          kode: "81.72",
          kode_prov: "81",
        },
        {
          nama: "Kabupaten Halmahera Barat",
          kode: "82.01",
          kode_prov: "82",
        },
        {
          nama: "Kabupaten Halmahera Tengah",
          kode: "82.02",
          kode_prov: "82",
        },
        {
          nama: "Kabupaten Halmahera Utara",
          kode: "82.03",
          kode_prov: "82",
        },
        {
          nama: "Kabupaten Halmahera Selatan",
          kode: "82.04",
          kode_prov: "82",
        },
        {
          nama: "Kabupaten Kepulauan Sula",
          kode: "82.05",
          kode_prov: "82",
        },
        {
          nama: "Kabupaten Halmahera Timur",
          kode: "82.06",
          kode_prov: "82",
        },
        {
          nama: "Kabupaten Pulau Morotai",
          kode: "82.07",
          kode_prov: "82",
        },
        {
          nama: "Kabupaten Pulau Taliabu",
          kode: "82.08",
          kode_prov: "82",
        },
        {
          nama: "Kota Ternate",
          kode: "82.71",
          kode_prov: "82",
        },
        {
          nama: "Kota Tidore Kepulauan",
          kode: "82.72",
          kode_prov: "82",
        },
        {
          nama: "Kabupaten Merauke",
          kode: "91.01",
          kode_prov: "91",
        },
        {
          nama: "Kabupaten Jayawijaya",
          kode: "91.02",
          kode_prov: "91",
        },
        {
          nama: "Kabupaten Jayapura",
          kode: "91.03",
          kode_prov: "91",
        },
        {
          nama: "Kabupaten Nabire",
          kode: "91.04",
          kode_prov: "91",
        },
        {
          nama: "Kabupaten Kepulauan Yapen",
          kode: "91.05",
          kode_prov: "91",
        },
        {
          nama: "Kabupaten Biak Numfor",
          kode: "91.06",
          kode_prov: "91",
        },
        {
          nama: "Kabupaten Puncak Jaya",
          kode: "91.07",
          kode_prov: "91",
        },
        {
          nama: "Kabupaten Paniai",
          kode: "91.08",
          kode_prov: "91",
        },
        {
          nama: "Kabupaten Mimika",
          kode: "91.09",
          kode_prov: "91",
        },
        {
          nama: "Kabupaten Sarmi",
          kode: "91.1",
          kode_prov: "91",
        },
        {
          nama: "Kabupaten Keerom",
          kode: "91.11",
          kode_prov: "91",
        },
        {
          nama: "Kabupaten Pegunungan Bintang",
          kode: "91.12",
          kode_prov: "91",
        },
        {
          nama: "Kabupaten Yahukimo",
          kode: "91.13",
          kode_prov: "91",
        },
        {
          nama: "Kabupaten Tolikara",
          kode: "91.14",
          kode_prov: "91",
        },
        {
          nama: "Kabupaten Waropen",
          kode: "91.15",
          kode_prov: "91",
        },
        {
          nama: "Kabupaten Boven Digoel",
          kode: "91.16",
          kode_prov: "91",
        },
        {
          nama: "Kabupaten Mappi",
          kode: "91.17",
          kode_prov: "91",
        },
        {
          nama: "Kabupaten Asmat",
          kode: "91.18",
          kode_prov: "91",
        },
        {
          nama: "Kabupaten Supiori",
          kode: "91.19",
          kode_prov: "91",
        },
        {
          nama: "Kabupaten Mamberamo Raya",
          kode: "91.2",
          kode_prov: "91",
        },
        {
          nama: "Kabupaten Mamberamo Tengah",
          kode: "91.21",
          kode_prov: "91",
        },
        {
          nama: "Kabupaten Yalimo",
          kode: "91.22",
          kode_prov: "91",
        },
        {
          nama: "Kabupaten Lanny Jaya",
          kode: "91.23",
          kode_prov: "91",
        },
        {
          nama: "Kabupaten Nduga",
          kode: "91.24",
          kode_prov: "91",
        },
        {
          nama: "Kabupaten Puncak",
          kode: "91.25",
          kode_prov: "91",
        },
        {
          nama: "Kabupaten Dogiyai",
          kode: "91.26",
          kode_prov: "91",
        },
        {
          nama: "Kabupaten Intan Jaya",
          kode: "91.27",
          kode_prov: "91",
        },
        {
          nama: "Kabupaten Deiyai",
          kode: "91.28",
          kode_prov: "91",
        },
        {
          nama: "Kota Jayapura",
          kode: "91.71",
          kode_prov: "91",
        },
        {
          nama: "Kabupaten Sorong",
          kode: "92.01",
          kode_prov: "92",
        },
        {
          nama: "Kabupaten Manokwari",
          kode: "92.02",
          kode_prov: "92",
        },
        {
          nama: "Kabupaten Fakfak",
          kode: "92.03",
          kode_prov: "92",
        },
        {
          nama: "Kabupaten Sorong Selatan",
          kode: "92.04",
          kode_prov: "92",
        },
        {
          nama: "Kabupaten Raja Ampat",
          kode: "92.05",
          kode_prov: "92",
        },
        {
          nama: "Kabupaten Teluk Bintuni",
          kode: "92.06",
          kode_prov: "92",
        },
        {
          nama: "Kabupaten Teluk Wondama",
          kode: "92.07",
          kode_prov: "92",
        },
        {
          nama: "Kabupaten Kaimana",
          kode: "92.08",
          kode_prov: "92",
        },
        {
          nama: "Kabupaten Tambrauw",
          kode: "92.09",
          kode_prov: "92",
        },
        {
          nama: "Kabupaten Maybrat",
          kode: "92.1",
          kode_prov: "92",
        },
        {
          nama: "Kabupaten Manokwari Selatan",
          kode: "92.11",
          kode_prov: "92",
        },
        {
          nama: "Kabupaten Pegunungan Arfak",
          kode: "92.12",
          kode_prov: "92",
        },
        {
          nama: "Kota Sorong",
          kode: "92.71",
          kode_prov: "92",
        },
      ];
      const ress = await Kabupaten.bulkCreate(readExcell, {
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
