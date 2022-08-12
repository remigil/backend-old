const express = require("express");
const app = express();
const router = require("./src/config/router");
const middlewareGlobal = require("./src/config/global_middleware");
const dotenv = require("dotenv");
const moment = require("moment");
const path = require("path");

dotenv.config();
const port = process.env.APP_PORT;
process.env.TZ = "Etc/Greenwich"; //locked to GMT

const staticFolder = JSON.parse(process.env.STATIC_FOLDER_PATHS ?? "[]");
if (typeof staticFolder !== "undefined" && staticFolder?.length > 0) {
  staticFolder.forEach((f) => {
    app.use(f.url, express.static(path.join(__dirname, f.path)));
  });
}

middlewareGlobal.beforeRouter(app);
app.use(router);
middlewareGlobal.afterRouter(app);
app.listen(port, () => {
  console.log("[SERVER]", `Start at ${moment()} on Port ${port}`);
});
