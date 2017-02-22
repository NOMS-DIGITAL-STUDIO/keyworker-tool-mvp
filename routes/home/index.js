var express = require('express');
var router = express.Router();

// public
router.get('/', (req, res) => res.redirect('/casefile/'));

// private methods

// exports

module.exports = router;
