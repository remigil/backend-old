const timeConvert = (a) => {
  var d = Math.floor(a / (3600 * 24));
  var h = Math.floor((a % (3600 * 24)) / 3600);
  var m = Math.floor((a % 3600) / 60);
  var s = Math.floor(a % 60);

  var dDisplay = d > 0 ? d + (d == 1 ? " day " : " days") : "";
  var hDisplay = h > 0 ? h + (h == 1 ? " hour " : " hours") : "";
  var mDisplay = m > 0 ? m + (m == 1 ? " minute " : " minutes") : "";
  var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";

  var Display = `${dDisplay} ${hDisplay} ${mDisplay} ${sDisplay}`;
  return Display;
};
module.exports = { timeConvert };
