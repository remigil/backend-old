module.exports = (n) => {
  var string = "" + n;
  var pad = "0000";
  n = pad.substring(0, pad.length - string.length) + string;
  return n;
};
