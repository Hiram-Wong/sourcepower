const { config } = require("../conf/config");

const CONFIG = config;

Date.prototype.TimeZone = new Map([
  ["Europe/London", 0],
  ["Asia/Shanghai", 8],
  ["America/New_York", 5],
]);
Date.prototype.zoneDate = function () {
  if (CONFIG.timezone.tz == undefined) {
    return new Date();
  } else {
    for (let item of this.TimeZone.entries()) {
      if (item[0] == CONFIG.timezone.tz) {
        let d = new Date();
        d.setHours(d.getHours() + item[1]);
        return d;
      }
    }
    return new Date();
  }
};

var date = new Date().zoneDate();
console.log(date);
console.log(new Date());

