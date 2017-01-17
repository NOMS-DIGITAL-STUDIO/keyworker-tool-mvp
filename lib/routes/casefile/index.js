var express = require('express');
var router = express.Router();
var CaseFileServiceConnection = require('../../services/caseFile');

const inspect = (x) => {
  console.log(x);
  return x;
}

const render = (res, view) => (model) => res.render(view, model);
const send = (res) => (model) => res.send(model);
const format = (res, view) => (model) => res.format({
  json: () => send(res)(model),
  html: () => render(res, view)(model),
});
const renderCaseFileList = (res) => format(res, 'casefile/list');
const renderCaseFileDetails = (res) => format(res, 'casefile/details');
const renderCaseFileAssignmentTool = (res) => format(res, 'casefile/assign');

const redirect = (res, route) => () => res.redirect(route) && res;

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

const getCaseFileList = () =>
  router.caseFile.listCaseFiles();

const getCaseFileDetails = (id) =>
  router.caseFile.getCaseFile(id);

const createCaseFileListViewModel = (req) => (caseFiles) =>
  req.app.locals.GovukAdminTemplate.create({
    page_title: 'New Case Files',
    caseFiles: caseFiles,
    total_caseFiles: caseFiles.length,
  });

const createCaseFileDetailsViewModel = (req) => (caseFile) =>
  req.app.locals.GovukAdminTemplate.create({
    page_title: 'Case file for ' + caseFile.offender.given_name + ' ' + caseFile.offender.surname,
    caseFile: caseFile,
  });

const createCaseFileAssignmentToolViewModel = (req) => (caseFile) =>
  req.app.locals.GovukAdminTemplate.create({
    page_title: 'Assign Staff to Case file for ' + caseFile.offender.given_name + ' ' + caseFile.offender.surname,
    caseFile: caseFile,
  });

const listCaseFiles = (req, res, next) =>
  getCaseFileList()
    .then(createCaseFileListViewModel(req))
    .then(renderCaseFileList(res))
    .catch(failWithError(res, next));

const displayCaseFileDetails = (req, res, next) =>
  getCaseFileDetails(req.params.oid)
    .then(createCaseFileDetailsViewModel(req))
    .then(renderCaseFileDetails(res))
    .catch(failWithError(res, next));

const displayCaseFileAssignmentTool = (req, res, next) =>
  getCaseFileDetails(req.params.oid)
    .then(createCaseFileAssignmentToolViewModel(req))
    .then(renderCaseFileAssignmentTool(res))
    .catch(failWithError(res, next));

// middleware

const setup = (req, res, next) =>
  (router.caseFile = router.caseFile || new CaseFileServiceConnection()) && next();

router.use(setup);

// public

router.get('/', listCaseFiles);
router.get('/:oid', displayCaseFileDetails);
router.get('/:oid/assign', displayCaseFileAssignmentTool);
router.post('/:oid/assign', (req, res) => res.redirect('../'));

// exports

module.exports = router;
