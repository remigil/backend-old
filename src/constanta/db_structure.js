const Sequelize = require("sequelize");
exports.StructureTimestamp = {
  created_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    allowNull: false,
  },
  updated_at: {
    type: "TIMESTAMP",
    defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    allowNull: true,
  },
  deleted_at: {
    type: Sequelize.DATE,
    allowNull: true,
  },
};
