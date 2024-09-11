const express = require('express');
const apiV1 = require("./v1");

const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.use('/api/v1', apiV1);

module.exports = router;
