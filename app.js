const express = require("express");
const app = express();
const router = require("./src/config/router");
const middlewareGlobal = require("./src/config/global_middleware");
const dotenv = require("dotenv");
const moment = require("moment");
const path = require("path");
const http = require("http");
const socketInstace = require("./src/config/socketConnetion");
const bodyParser = require("body-parser");
const fs = require("fs");

//console.log(options)
const server = http.createServer(app);
//const server = https.createServer(options,app);
dotenv.config();
const port = process.env.APP_PORT;
process.env.TZ = "Etc/Greenwich"; //locked to GMT

const staticFolder = JSON.parse(process.env.STATIC_FOLDER_PATHS ?? "[]");
if (typeof staticFolder !== "undefined" && staticFolder?.length > 0) {
  staticFolder.forEach((f) => {
    app.use(f.url, express.static(path.join(__dirname, f.path)));
  });
}
app.use(express.static(path.join(__dirname, "./public")));

socketInstace(server);
// socketInstace(server);

//ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/src/view"));

middlewareGlobal.beforeRouter(app);
app.use(router);
middlewareGlobal.afterRouter(app);
server.listen(port, () => {
  console.log("[SERVER]", `Start at ${moment()} on Port ${port}`);
});
//serverHttps.listen(3005, () => {
//  console.log("[SERVER]", `Start at ${moment()} on Port ${port}`);
//});
