const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Account = require("./account");
const Vip = require("./vip");
const Officer = require("./officer");
// const Trx_account_officer = require("./trx_account_officer");

const Model = Sequelize.Model;

class Renpam extends Model {}
Renpam.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    operation_id: {
      type: Sequelize.INTEGER,
    },
    schedule_id: {
      type: Sequelize.INTEGER,
    },
    name_renpam: {
      type: Sequelize.STRING(200),
    },
    type_renpam: {
      // type [1: patroli, 2: pengawalan, 3: penjagaan, 4:]
      type: Sequelize.INTEGER,
    },
    category_renpam: {
      // type [1: operasi, 2: harian]
      type: Sequelize.INTEGER,
    },
    total_vehicle: {
      type: Sequelize.INTEGER,
    },
    order_renpam: {
      type: Sequelize.INTEGER,
    },
    title_start: {
      type: Sequelize.TEXT,
    },
    title_end: {
      type: Sequelize.TEXT,
    },
    route: {
      type: Sequelize.JSON,
    },
    route_alternatif_1: {
      type: Sequelize.JSON,
    },
    route_alternatif_2: {
      type: Sequelize.JSON,
    },
    route_masyarakat: {
      type: Sequelize.JSON,
    },
    route_umum: {
      type: Sequelize.JSON,
    },
    direction_route: {
      type: Sequelize.JSON,
    },

    direction_route_alter1: {
      type: Sequelize.JSON,
    },

    direction_route_alter2: {
      type: Sequelize.JSON,
    },

    direction_route_masyarakat: {
      type: Sequelize.JSON,
    },

    direction_route_umum: {
      type: Sequelize.JSON,
    },

    estimasi: {
      type: Sequelize.STRING(20),
    },
    estimasi_alter1: {
      type: Sequelize.STRING(20),
    },
    estimasi_alter2: {
      type: Sequelize.STRING(20),
    },
    estimasi_masyarakat: {
      type: Sequelize.STRING(20),
    },
    estimasi_umum: {
      type: Sequelize.STRING(20),
    },
    estimasi_time: {
      type: Sequelize.STRING(20),
    },
    estimasi_time_alter1: {
      type: Sequelize.STRING(20),
    },
    estimasi_time_alter2: {
      type: Sequelize.STRING(20),
    },
    estimasi_time_masyarakat: {
      type: Sequelize.STRING(20),
    },
    estimasi_time_umum: {
      type: Sequelize.STRING(20),
    },
    coordinate_guarding: {
      type: Sequelize.JSON,
    },
    end_coordinate_renpam: {
      type: Sequelize.JSON,
    },
    polda_id: {
      type: Sequelize.INTEGER,
    },
    polres_id: {
      type: Sequelize.INTEGER,
    },

    choose_rute: {
      type: Sequelize.INTEGER, // 1 = utama, 2=alternatif 1, 3= alternatif 2
    },
    date: {
      type: Sequelize.DATEONLY,
    },
    start_time: {
      type: Sequelize.TIME,
    },
    start_datetime_renpam: {
      type: Sequelize.DATE,
    },
    end_datetime_renpam: {
      type: Sequelize.DATE,
    },
    end_time: {
      type: Sequelize.TIME,
    },
    status_renpam: {
      type: Sequelize.INTEGER,
    },
    note_kakor: {
      type: Sequelize.TEXT,
    },
    warnaRoute_renpam: {
      type: Sequelize.STRING(20),
    },
    alamat: {
      type: Sequelize.TEXT,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    indexes: [{ fields: ["schedule_id"] }],
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "renpam",
    modelName: "renpams",
    sequelize: db,
  }
);

Renpam.belongsToMany(Account, {
  as: "accounts",
  through: "renpam_account",
  foreignKey: "renpam_id",
  otherKey: "account_id",
});

Renpam.belongsToMany(Vip, {
  as: "vips",
  through: "renpam_vip",
  foreignKey: "renpam_id",
  otherKey: "vip_id",
});

(async () => {
  Renpam.sync({ alter: true }).catch((err) => {
    console.log({ err });
  });
})();
module.exports = Renpam;
