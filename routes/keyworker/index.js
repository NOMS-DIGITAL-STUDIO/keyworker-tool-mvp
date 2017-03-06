var express = require('express');
var router = express.Router();
var KeyWorkerServiceConnection = require('../../services/keyWorker');

const inspect = (x) => {
  console.log(x);
  return x;
}

const raw = (res, model) => () => res.send(model);
const rendered = (res, view, model) => () => res.render(view, model);
const format = (res, view) => (model) => res.format({
  html: rendered(res, view, model),
  json: raw(res, model),
});
const renderKeyWorkerList = (res) => format(res, 'keyworker/list');
const renderKeyWorkerDetails = (res) => format(res, 'keyworker/details');

const redirect = (res, route) => () => res.redirect(route);

const failWithError = (res, next) => (err) => {
  var ex = new Error(typeof err === 'string' ? err : err.message);
  if (err.stack) {
    ex.stack = err.stack;
  }

  return res.status(400) && next(ex);
};

const rpcError = (url, opts, err) => {
  err.url = url;
  err.options = opts;

  console.error('RPC Error Occured:');
  console.error(err);

  return err;
};

const errorCheck = (resolve, reject) => (err, data) =>
  err ? reject(err) : resolve(data);

const rpcErrorCheck = (url, opts, resolve, reject) => (err, data) =>
  err ? reject(rpcError(url, opts, err)) : resolve(data);

const getKeyWorkerList = () =>
  router.keyWorker.listKeyWorkers();

const getKeyWorkerDetails = (id) =>
  router.keyWorker.getKeyWorker(id);

const createKeyWorkerListViewModel = (req) => (keyWorkers) =>
  req.app.locals.GovukAdminTemplate.create({
    page_title: 'Your Staff',
    keyWorkers: keyWorkers,
    total_keyWorkers: keyWorkers.length,
  });

const createKeyWorkerDetailsViewModel = (req) => (keyWorker) =>
  req.app.locals.GovukAdminTemplate.create({
    page_title: 'My Caseload',
    keyWorker: keyWorker,
  });

const listKeyWorkers = (req, res, next) =>
  getKeyWorkerList()
    .then(createKeyWorkerListViewModel(req))
    .then(renderKeyWorkerList(res))
    .catch(failWithError(res, next));

const displayKeyWorkerDetails = (req, res, next) =>
  getKeyWorkerDetails(req.params.sid)
    .then(createKeyWorkerDetailsViewModel(req))
    .then(renderKeyWorkerDetails(res))
    .catch(failWithError(res, next));

// middleware

const setup = (req, res, next) =>
  (router.keyWorker = router.keyWorker || KeyWorkerServiceConnection) && next();

router.use(setup);

// public

router.get('/', listKeyWorkers);
router.get('/:sid', displayKeyWorkerDetails);
router.get('/:sid/assign', (req, res) => res.redirect(req.baseUrl));
router.post('/:sid/assign', (req, res) => res.redirect('../'));

// exports

module.exports = router;
