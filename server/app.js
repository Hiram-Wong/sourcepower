const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
const Fingerprint = require("express-fingerprint");
const expressip = require("express-ip");
const FileStreamRotator = require("file-stream-rotator");
const fs = require("fs");
const createError = require("http-errors");
const moment = require("moment");
const logger = require("morgan");
const path = require("path");
const cron = require("node-cron");

const indexRouter = require("./routes/index");
const { NODE_ENV } = require("./utils/common");

const app = express();

const corsOptions = {
  origin: "*", // 允许所有域名访问
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // 允许的 HTTP 方法
  preflightContinue: false, // 布尔值，表示是否在 OPTIONS 请求之前发送响应
  optionsSuccessStatus: 204, // 预检请求的默认成功状态码
};

// view engine setup
app.set("trust proxy", true);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

logger.token("localDate", function getDate(req) {
  return moment().format("YYYY-MM-DD HH:mm:ss");
});

logger.format(
  "combined",
  ':remote-addr - :remote-user [:localDate]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'
);

if (NODE_ENV !== "production") {
  app.use(logger("dev"));
} else {
  const logDirectory = path.join(__dirname, "logs");
  fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

  const accessLogStream = FileStreamRotator.getStream({
    date_format: "YYYY-MM-DD",
    filename: path.join(logDirectory, "access-%DATE%.log"),
    frequency: "daily",
    verbose: false,
  });

  app.use(
    logger("combined", {
      stream: accessLogStream,
    })
  );
}

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressip().getIpInfoMiddleware);
app.use(
  Fingerprint({
    parameters: [
      Fingerprint.useragent,
      Fingerprint.acceptHeaders,
      Fingerprint.geoip,
    ],
  })
);
app.use(express.static(path.join(__dirname, "public/frontend")));

app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
