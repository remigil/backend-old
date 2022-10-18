const express = require("express");
const app = express();
const router = require("./src/config/router");
const middlewareGlobal = require("./src/config/global_middleware");
const dotenv = require("dotenv");
const moment = require("moment");
const path = require("path");
const http = require("http");
const https = require("https");
const socketInstace = require("./src/config/socketConnetion");
const bodyParser = require("body-parser");
const fs = require("fs");
let options = {};
if (process.env.ENV_SSL === "production") {
  options = {
    key: fs.readFileSync("/etc/ssl/k3ig20korlantas.id/private.key"),
    cert: fs.readFileSync("/etc/ssl/k3ig20korlantas.id/k3ig20korlantas_id.crt"),
    // ca: fs.readFileSync('./test_ca.crt'),
    // requestCert: false,
    // rejectUnauthorized: false,
  };
}
const server = http.createServer(app);
const serverHttps = https.createServer(options, app);

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
socketInstace(serverHttps);

middlewareGlobal.beforeRouter(app);
app.use(router);
middlewareGlobal.afterRouter(app);
server.listen(port, () => {
  console.log("[SERVER]", `Start at ${moment()} on Port ${port}`);
});
serverHttps.listen(3005, () => {
  console.log("[SERVER SOCKET IO]", `Start at ${moment()} on Port ${3005}`);
});
