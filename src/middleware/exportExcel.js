const excelJS = require("exceljs");
const response = require("../lib/response");

const exportUser = async (
  req,
  res,
  formatExcell = [],
  filename = "users",
  sheet = "",
  callback = null
) => {
  const workbook = new excelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheet);

  worksheet.columns = formatExcell;

  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
  });
  if (callback) {
    callback(worksheet, workbook);
  } else {
    try {
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${filename}.xlsx`
      );

      return workbook.xlsx.write(res).then(() => {
        res.status(200);
      });
    } catch (err) {
      response(res, false, err.message, err, 400);
    }
  }
};

module.exports = exportUser;
