const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Input_laka_langar extends Model {}
Input_laka_langar.init(
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
    polda_id: {
      type: Sequelize.INTEGER,
    },
    polres_id: {
      type: Sequelize.INTEGER,
    },
    date: {
      type: Sequelize.DATEONLY,
    },
    capture_camera: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    statis: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    mobile: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    online: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    posko: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    preemtif: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    preventif: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    odol_227: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    odol_307: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
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
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "input_laka_langgar",
    modelName: "input_laka_langgar",
    sequelize: db,
  }
);
(async () => {
  Input_laka_langar.sync({ alter: true });
})();
module.exports = Input_laka_langar;
