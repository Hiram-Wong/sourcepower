const createKnex = require("knex");
const Redis = require("ioredis");
const multer = require("multer");
const pg = require("pg");
const nodemailer = require("nodemailer");
const path = require("path");
const moment = require('moment');

const { config } = require("../conf/config");

const CONFIG = config;
const JWT_SECRET = CONFIG.jwtSecret;
const NODE_ENV = CONFIG.NODE_ENV;

const knexConfig = Object.assign(
  {},
  {
    client: CONFIG.knex.client,
    connection: {
      host: CONFIG.knex.connection.host,
      user: CONFIG.knex.connection.user,
      password: CONFIG.knex.connection.password,
      database: CONFIG.knex.connection.database,
    },
  }
);
knexConfig.pool = {
  afterCreate(connection, callback) {
    connection.query(`SET TIME ZONE "${CONFIG.timezone.tz}"`, (err) => {
      callback(err, connection);
    });
  },
};

pg.types.setTypeParser(20, "text", parseInt);

const knex = createKnex(knexConfig);

const redis = new Redis({
  host: CONFIG.redis.host,
  port: CONFIG.redis.port,
  password: CONFIG.redis.password,
  db: CONFIG.redis.db,
});

const transporter = nodemailer.createTransport({
  host: CONFIG.email.host,
  port: CONFIG.email.port,
  secure: CONFIG.email.ssl,
  auth: {
    user: CONFIG.email.user,
    pass: CONFIG.email.password,
  },
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/upload/"));
  },
  filename: function (req, file, cb) {
    const originalname = Buffer.from(file.originalname, 'latin1').toString('utf-8'); // 重要乱码
    cb(null, moment().valueOf() + '-' + originalname);
  },
});

const upload = multer({ storage: storage });

const userFileUpload = multer({
  dest: "public/upload/",
  limits: {
    fileSize: CONFIG.upload.fileSizeLimit,
  },
});

module.exports = {
  CONFIG,
  JWT_SECRET,
  NODE_ENV,
  knex,
  redis,
  transporter,
  userFileUpload,
  upload,
};
