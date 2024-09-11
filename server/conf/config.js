require("dotenv").config();

const config = {
  db: {
    connectionString: process.env.DB_CONNECTION_STRING,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    db: process.env.REDIS_DB,
  },
  jwtSecret: process.env.JWT_SECRET,
  NODE_ENV: process.env.NODE_ENV,
  email: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    ssl: process.env.EMAIL_SSL,
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
  },
  upload: {
    fileSizeLimit: 100 * 1024 * 1024, // 100MB,
    avatarSizeLimit: 10 * 1024 * 1024, // 10MB,
  },
  timezone: {
    tz: process.env.TZ || "Asia/Taipei",
    tzoffset: 8 * 60 * 60 * 1000,
  },
  knex: {
    client: "pg",
    connection: {
      host: process.env.PG_HOST,
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE,
    },
  },
};

module.exports = {
  config,
};
