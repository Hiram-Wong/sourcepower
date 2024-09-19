import { Buffer } from "buffer";
import crypto from "crypto-js";

const base64 = {
  decode: (val) => Buffer.from(val, "base64").toString("utf-8"),
  encode: (val) => Buffer.from(val, "utf-8").toString("base64"),
};

const hash = {
  "md5-16": (val) => crypto.MD5(val).toString().substr(8, 16),
  "md5-32": (val) => crypto.MD5(val).toString(),
  sha1: (val) => crypto.SHA1(val).toString(),
  sha224: (val) => crypto.SHA224(val).toString(),
  sha256: (val) => crypto.SHA256(val).toString(),
  sha3: (val) => crypto.SHA3(val).toString(),
  sha384: (val) => crypto.SHA384(val).toString(),
  sha512: (val) => crypto.SHA512(val).toString(),
};

export { base64, hash };
