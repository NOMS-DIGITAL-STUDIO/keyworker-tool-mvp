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

const createCaseFileListViewModel = (caseFiles) =>
  ({
    app_title: 'Key Worker Tools',
    page_title: 'New Case Files',
    navbar_items: [
      { label: 'My Cases', url: '/casefile' },
      { label: 'My Staff', url: '/keyworker' },
    ],
    has_navbar_content: true, // should be calculated by wrapping the model in the GovukAdminTemplate
    caseFiles: caseFiles,
    total_caseFiles: caseFiles.length,
  });

const createCaseFileDetailsViewModel = (caseFile) =>
  ({
    app_title: 'Key Worker Tools',
    page_title: 'Case file for ' + caseFile.offender.given_name + ' ' + caseFile.offender.surname,
    navbar_items: [
      { label: 'My Cases', url: '/casefile' },
      { label: 'My Staff', url: '/keyworker' },
    ],
    has_navbar_content: true, // should be calculated by wrapping the model in the GovukAdminTemplate
    caseFile: caseFile,
  })

const listCaseFiles = (req, res, next) =>
  getCaseFileList()
    .then(createCaseFileListViewModel)
    .then(renderCaseFileList(res))
    .catch(failWithError(res, next));

const displayCaseFileDetails = (req, res, next) =>
  getCaseFileDetails(req.params.oid)
    .then(createCaseFileDetailsViewModel)
    .then(renderCaseFileDetails(res))
    .catch(failWithError(res, next));

// middleware

const setup = (req, res, next) =>
  (router.caseFile = router.caseFile || new CaseFileServiceConnection()) && next();

router.use(setup);

// public

router.get('/', listCaseFiles);
router.get('/:oid', displayCaseFileDetails);

//router.get('/:oid/assign', (req, res) => res.redirect('../../'));

// exports

module.exports = router;
