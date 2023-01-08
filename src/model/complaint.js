const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Complaint extends Model {}
Complaint.init(
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
    name_complaint: {
      type: Sequelize.STRING(255),
    },
    email_complaint: {
      type: Sequelize.STRING(255),
    },
    subjek_complaint: {
      type: Sequelize.TEXT,
    },
    deskripsi_complaint: {
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
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "complaint",
    modelName: "complaint",
    sequelize: db,
  }
);
(async () => {
  Complaint.sync({ alter: true });
})();
module.exports = Complaint;
