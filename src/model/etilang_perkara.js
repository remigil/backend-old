const dbEtilang = require("../config/etilang");
const Sequelize = require("sequelize");
const Model = Sequelize.Model;

class Etilang_perkara extends Model {}
Etilang_perkara.init(
  {},
  {
    defaultScope: {
      // where: Sequelize.literal("eliminasi.deleteEliminasi is null"),
    },

    tableName: "perkara",
    sequelize: dbEtilang,
    modelName: "perkara",
    // options
  }
);

module.exports = Etilang_perkara;
