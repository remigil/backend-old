const winston = require("winston");
const expressWinston = require("express-winston");
const moment = require("moment");
const response = require("../lib/response");
const compression = require("compression");
module.exports = {
  beforeRouter: (app) => {
    app.use(require("../middleware/fomidable"));
    app.use(require("helmet")());
    app.use(require("response-time")());
    if (process.env.APP_ENABLE_CORS === "true") {
      app.use(
        require("cors")({
          credentials: true,
          origin: process.env.CORS_ORIGIN,
        })
      );
    }
    if (process.env.APP_ENABLE_COMPRESSION === "true") {
      app.use(
        compression({
          filter: (req, res) => {
            if (req.headers["x-no-compression"]) {
              return false;
            }
            return compression.filter(req, res);
          },
          level: 8,
        })
      );
    }
    if (process.env.APP_ENABLE_RATE_LIMIT === "true") {
      app.use(
        require("express-rate-limit")({
          windowMs: parseInt(process.env.RATE_LIMIT_RESET) * 60 * 1000, // 1 minutes
          max: parseInt(process.env.RATE_LIMIT_VISIT_PER_RLR), // Limit each IP requests 100/min
          standardHeaders: true,
          legacyHeaders: false,
          message: (req, res) => {
            response(res, false, "Too Many Request", null, 429);
          },
        })
      );
    }

    if (process.env.APP_ENABLE_DEBUG_LOG === "true") {
      app.use(
        expressWinston.logger({
          transports: [
            new winston.transports.File({
              filename: `./logs/debug/${moment().format("YYYY_MM_DD")}.log`,
            }),
          ],
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.prettyPrint()
          ),
          meta: true,
          msg: "HTTP {{req.method}} {{req.url}}",
          expressFormat: true,
          colorize: false,
          ignoreRoute: function (req, res) {
            return false;
          },
        })
      );
    }
  },
  afterRouter: (app) => {
    if (process.env.APP_ENABLE_DEBUG_LOG === "true") {
      app.use(
        expressWinston.errorLogger({
          transports: [
            new winston.transports.File({
              filename: `./logs/error/${moment().format("YYYY_MM_DD")}.log`,
            }),
          ],
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.prettyPrint()
          ),
        })
      );
    }
    app.use((err, req, res, next) => {
      return response(
        res,
        false,
        "Internal Server Error",
        process.env.APP_NODE_ENV === "production" ? err.message : err.stack,
        500
      );
    });
    app.get("*", function (req, res) {
      return response(
        res,
        false,
        "Opppssss your request is not found!",
        null,
        404
      );
    });
  },
};
