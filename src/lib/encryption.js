const Cryptojs = require("crypto-js");
const jsonwebtoken = require("jsonwebtoken");
const fs = require("fs");
exports.AESEncrypt = (msg, options = { isSafeUrl: false }) => {
  try {
    let encryptedMsg = Cryptojs.AES.encrypt(
      msg,
      process.env.ENCRYPT_PASSPHARSE,
      {
        iv: process.env.ENCRYPT_IV,
        mode: Cryptojs.mode.CBC,
      }
    ).toString(Cryptojs.format.OpenSSL);

    return options.isSafeUrl
      ? Buffer.from(encryptedMsg).toString("base64url")
      : encryptedMsg;
  } catch (e) {
    return e.message;
  }
};
exports.AESDecrypt = (
  msg,
  options = { parseMode: "raw", isSafeUrl: false }
) => {
  if (options.isSafeUrl) {
    msg = Buffer.from(msg, "base64url").toString("utf8");
  }
  try {
    let decryptedMsg = Cryptojs.AES.decrypt(
      msg,
      process.env.ENCRYPT_PASSPHARSE,
      {
        iv: process.env.ENCRYPT_IV,
        mode: Cryptojs.mode.CBC,
      }
    ).toString(Cryptojs.enc.Utf8);
    switch (options.parseMode) {
      case "json": {
        decryptedMsg = JSON.parse(decryptedMsg);
        break;
      }
    }
    return decryptedMsg;
  } catch (e) {
    return e.message;
  }
};

exports.JWTEncrypt = (data) => {
  const privateKey = fs.readFileSync("./credentials/private.key");
  return jsonwebtoken.sign(data, privateKey, {
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE,
    subject: process.env.JWT_SUBJECT,
    expiresIn: process.env.JWT_EXPIRE,
    algorithm: process.env.JWT_ALGORITHM,
  });
};

exports.JWTDecrypt = (data) => {
  const publicKey = fs.readFileSync("./credentials/public.key");
  return jsonwebtoken.decode(data, publicKey);
};

exports.JWTVerify = (jwt) => {
  const publicKey = fs.readFileSync("./credentials/public.key");
  jwt = jwt.slice(7, jwt.length);
  try {
    if (
      jsonwebtoken.verify(jwt, publicKey, {
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE,
        subject: process.env.JWT_SUBJECT,
        algorithms: [process.env.JWT_ALGORITHM],
      })
    ) {
      return {
        success: true,
        msg: "succeed",
        data: this.JWTDecrypt(jwt),
      };
    }
    return {
      success: false,
      msg: "Invalid Token",
    };
  } catch (e) {
    return {
      success: false,
      msg: e.message,
    };
  }
};
