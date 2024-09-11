const { unzip } = require("qiao-zip");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const unzipFile = async (zipPath, extractPath, folderPath) => {
  try {
    await unzip(zipPath, extractPath);
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const readFile = (filePath) => {
  try {
    const fileExists = fs.existsSync(filePath);
    if (!fileExists) {
      throw new Error("File does not exist");
    }

    const content = fs.readFileSync(filePath, "utf8");

    return content;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const updateFile = (filePath, updateData) => {
  try {
    const fileExists = fs.existsSync(filePath);
    if (!fileExists) {
      throw new Error("File does not exist");
    }

    fs.writeFileSync(filePath, updateData, "utf8");
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const cySign = (key, imgUrl, nickname, profileUrl, isvUserId) => {
  const toSign = `img_url=${encodeURIComponent(
    imgUrl
  )}&nickname=${encodeURIComponent(nickname)}&profile_url=${encodeURIComponent(
    profileUrl
  )}&user_id=${encodeURIComponent(isvUserId)}`;
  const signature = crypto
    .createHmac("sha1", key)
    .update(toSign, "utf8")
    .digest("base64");
  return signature;
};

module.exports = {
  cySign,
  readFile,
  updateFile,
  unzipFile,
};
