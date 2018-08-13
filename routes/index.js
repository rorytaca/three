var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { 
    title: '', 
    scripts: ['lib/Detector.js','lib/stats.min.js','controllers/index.js']
  });
});

module.exports = router;
