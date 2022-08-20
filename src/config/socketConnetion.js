const { AESDecrypt, JWTVerify } = require("../lib/encryption");
const { scope } = require("../model/token_track_notif");
const TokenTrackNotif = require("../model/token_track_notif");
const { TrackG20 } = require("../model/tracking/g20");
const moment = require("moment");
const socketInstace = (server) => {
  const io = require("socket.io")(server, {
    cors: {},
  }).use(async function (socket, next) {
    // authenticate jwt for socket connection

    try {
      if (
        socket.handshake.query &&
        socket.handshake.query.token &&
        socket.handshake.query.user_nrp
      ) {
        const jwtCheck = JWTVerify(socket.handshake.query.token);

        await TokenTrackNotif.update(
          {
            token_track: socket.id,
          },
          {
            where: {
              team_id: AESDecrypt(jwtCheck.data.uid, {
                isSafeUrl: true,
                parseMode: "string",
              }),
              nrp_user: socket.handshake.query.user_nrp,
            },
          }
        );
        if (jwtCheck.success) {
          next();
        } else {
          return next(new Error("Authentication error"));
        }
      } else {
        next(new Error("Authentication error"));
      }
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });
  io.on("connection", function (socket) {
    // io.emit(
    //   "connected",
    //   `Welcome to web socket tracking and notification, your id socket is ${socket.id}`
    // );
    io.sockets.emit("from server", "HELLO!" + " " + socket.id);
    socket.on("message", function (message) {
      io.emit("message", message);
    });
    socket.on("trackingUser", async function (coordinate) {
      const { uid } = JWTVerify(socket.handshake.query.token).data;
      await TrackG20.create({
        id_user: AESDecrypt(uid, {
          isSafeUrl: true,
          parseMode: "string",
        }),
        latitude: coordinate.lat,
        longitude: coordinate.lon,
        date: moment(),
      });
      //   io.to(socket.id).emit("message", check);
    });
  });
};

module.exports = socketInstace;
