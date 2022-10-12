const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class ContactGeneral extends Model {}
ContactGeneral.init(
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
    name_contact: {
      type: Sequelize.STRING(255),
    },
    number_contact: {
      type: Sequelize.STRING(255),
    },
    jabatan: {
      type: Sequelize.STRING(255),
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
    tableName: "contact_general",
    modelName: "ContactGeneral",
    sequelize: db,
  }
);
(async () => {
  ContactGeneral.sync({ alter: true }).catch((err) => {
    console.log({ err });
  });
})();
module.exports = ContactGeneral;
