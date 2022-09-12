const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Panic_button extends Model {}
Panic_button.init(
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
    code: {
      type: Sequelize.STRING(255),
    },
    type: {
      type: Sequelize.STRING(5),
    },
    foto: {
      type: Sequelize.STRING(255),
    },
    // {
    //   title: 'Tindak Kriminal',
    //   value: 1,
    //   valueToDatabase: 1,
    // },
    // {
    //   title: 'Kecelakaan',
    //   value: 2,
    //   valueToDatabase: 2,
    // },
    // {
    //   title: 'Bencana Alam',
    //   value: 3,
    //   valueToDatabase: 3,
    // },
    // 1= Kriminal, 2=Kecelakaan, 3=bencana alam, 4=kemacetan
    categori: {
      type: Sequelize.INTEGER,
    },
    status: {
      type: Sequelize.INTEGER,
    },
    officer_id: {
      type: Sequelize.INTEGER,
    },
    coordinate: {
      type: Sequelize.JSON,
    },
    description: {
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
    // indexes: [{ fields: ["role_id"] }],
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "report",
    modelName: "report",
    sequelize: db,
  }
);
(async () => {
  Panic_button.sync({ alter: true });
})();
module.exports = Panic_button;
