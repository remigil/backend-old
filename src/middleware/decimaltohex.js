const decimalToHex = (d) => {
  var hex = Number(d).toString(16);
  hex = "00000000".substr(0, 8 - hex.length) + hex;
  return hex;
}

module.exports= {decimalToHex};