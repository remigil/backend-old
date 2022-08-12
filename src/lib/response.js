const { AESEncrypt } = require("./encryption");

module.exports = (
  res,
  isSuccess = true,
  responseMessage = "Success",
  data = null,
  statusCode = 200
) => {
  if (process.env.APP_ENABLE_ENCRYPT_DATA_OUTPUT === "true") {
    data = AESEncrypt(JSON.stringify(data), { isSafeUrl: false });
  }
  return res.status(statusCode).json({
    isSuccess,
    statusCode,
    responseMessage,
    data,
  });
};
