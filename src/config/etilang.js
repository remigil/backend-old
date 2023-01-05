// const { Sequelize } = require("sequelize");
// require("dotenv").config();
// const moment = require("moment");
// const fs = require("fs");
// const zxc = new Sequelize(
//   process.env.DB_NAME_ETILANG,
//   process.env.DB_USER_ETILANG,
//   process.env.DB_PASS_ETILANG,
//   {
//     host: process.env.DB_HOST_ETILANG,
//     dialect: process.env.DB_DIALECT_ETILANG,
//     port: process.env.DB_PORT_ETILANG,
//     dialectOptions: {
//       timezone: "+00:00",
//     },
//     // logging: (sql, time) => {
//     //   if (process.env.APP_ENABLE_DB_LOG === "true") {
//     //     fs.writeFileSync(
//     //       `./logs/db/${moment().format("YYYY_MM_DD")}.log`,
//     //       `[${moment().format("YYYY-MM-DD HH:MM:SS Z")}] : ${sql}\n`,
//     //       { flag: "a" }
//     //     );
//     //   }
//     // },
//   }
// );

// zxc
//   .authenticate()
//   .then(() => {
//     console.log(`Connection to zxc has been established successfully.`);
//   })
//   .catch((err) => {
//     console.error("Unable to connect to the maridb database:", err.message);
//   });
// module.exports = zxc;
