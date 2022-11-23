const codeTS = (d) => {
  var pad = Number(d).toString();
  pad = "0000".substr(0, 4 - pad.length) + pad;
  return pad;
}

module.exports= {codeTS};