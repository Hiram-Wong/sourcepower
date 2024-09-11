const crypto = require("crypto");

const generateShortUrl = (url) => {
  const key = "HiramUrl";
  const chars =
    "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const hash = crypto
    .createHash("md5")
    .update(key + url)
    .digest("hex");
  const shortUrls = [];

  for (let i = 0; i < 4; i++) {
    const sTempSubString = hash.substr(i * 8, 8);
    let lHexLong = parseInt(sTempSubString, 16) & 0x3fffffff;
    let outChars = "";

    for (let j = 0; j < 6; j++) {
      const index = lHexLong & 0x0000003d;
      outChars += chars[index];
      lHexLong >>= 5;
    }

    shortUrls.push(outChars);
  }

  return shortUrls;
}

module.exports = generateShortUrl;
