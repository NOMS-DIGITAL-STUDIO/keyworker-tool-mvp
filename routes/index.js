const config = {
  services: {
    offender: require('../services/offender'),
    keyworker: require('../services/keyworker'),
    casefile: require('../services/casefile'),
    casenote: require('../services/casenote'),
  },
}

var express = require('express');
var router = express.Router();

require('../services/fakeDataGenerator')(config);

// middleware
//router.use(require('../middleware/...'));

// core routes
router.use('/',              require('./home')(config));
router.use('/casefile',      require('./casefile')(config));
router.use('/keyworker',     require('./keyworker')(config));

// support routes
//router.use('/autocomplete/addresses',  require('./autocomplete/addresses'));

module.exports = router;
