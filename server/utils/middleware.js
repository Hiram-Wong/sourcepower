const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");

const { JWT_SECRET } = require("./common");

// JWT验证中间件
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null)
    return res.json({ code: -1, msg: "headers no parms token", data: null });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err)
      if (err?.name === "TokenExpiredError") {
        return res.json({
          code: -2,
          msg: "Token has expired",
          data: err,
        });
      } else {
        return res.json({
          code: -1,
          msg: "token verification failed",
          data: err,
        });
      }
    req.user = decoded;
    next();
  });
};

const generateToken = (user, secret = JWT_SECRET) => {
  return jwt.sign(
    {
      userId: user.id,
      userName: user.username,
      userEmail: user.email,
      userRole: user.role.split(","), // 假设角色是以逗号分隔的字符串
    },
    secret,
    { expiresIn: "1d" }
  );
};

const authenticateVerify = (token) => {
  const decoded = jwt.verify(token, JWT_SECRET);
  return decoded;
};

// 角色检查中间件
const authorizeRole = (role) => {
  return (req, res, next) => {
    if (!req.user.userRole.includes(role)) {
      return res
        .status(403)
        .json({ code: -1, msg: "No permission", data: null });
    }
    next();
  };
};

// QPS限制中间件
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutes
  max: 100, // 限制数量
  message: {
    code: -1,
    msg: "Too many requests in same ip, please try again 15 minutes later.",
    data: null,
  },
  statusCode: 429,
  validate: { trustProxy: false },
});

module.exports = {
  authenticateJWT,
  authorizeRole,
  authenticateVerify,
  generateToken,
  limiter,
};
