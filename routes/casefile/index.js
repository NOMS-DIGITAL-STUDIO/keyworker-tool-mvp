var express = require('express');
var router = express.Router();
var CaseFileServiceConnection = require('../../services/caseFile');
var CaseNoteServiceConnection = require('../../services/caseNote');

const inspect = (x) => {
  console.log(x);
  return x;
}

const render = (res, view) => (model) => res.render(view, model);
const send = (res) => (model) => res.send(model);
const format = (res, view) => (model) => res.format({
  html: () => render(res, view)(model),
  json: () => send(res)(model),
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

const getCaseFileDetailsWithNotes = (id) =>
  Promise.all([
    router.caseFile.getCaseFile(id),
    router.caseNote.getCaseNotesByCaseFile(id),
  ])
  .then((data) => ({
    caseFile: data[0],
    caseNotes: data[1],
    lastRecordedCaseNote: (data[1][0] || {}).timestamp,
  }));

const createCaseFileListViewModel = (req) => (caseFiles) =>
  req.app.locals.GovukAdminTemplate.create({
    page_title: 'Your case files',
    caseFiles: caseFiles.filter((caseFile) => !!caseFile.keyworker),
    unassignedCaseFiles: caseFiles.filter((caseFile) => !caseFile.keyworker),
    total_caseFiles: caseFiles.length,
  });

const createCaseFileDetailsViewModel = (req) => (data) =>
  req.app.locals.GovukAdminTemplate.create({
    page_title: 'Case file for ' + data.caseFile.offender.given_name + ' ' + data.caseFile.offender.surname,
    caseFile: data.caseFile,
    caseNotes: data.caseNotes,
  });

const createCaseFileAssignmentToolViewModel = (req) => (caseFile) =>
  req.app.locals.GovukAdminTemplate.create({
    page_title: 'Assign Staff to Case file for ' + caseFile.offender.given_name + ' ' + caseFile.offender.surname,
    caseFile: caseFile,
  });

const assignKeyWorker = (keyworker_fullname) => (caseFile) =>
  router.caseFile.assignKeyWorker(keyworker_fullname, caseFile.casefile_id);

const listCaseFiles = (req, res, next) =>
  getCaseFileList()
    .then(createCaseFileListViewModel(req))
    .then(renderCaseFileList(res))
    .catch(failWithError(res, next));

const displayCaseFileDetails = (req, res, next) =>
  getCaseFileDetailsWithNotes(req.params.cnid)
    .then(createCaseFileDetailsViewModel(req))
    .then(renderCaseFileDetails(res))
    .catch(failWithError(res, next));

const displayCaseFileAssignmentTool = (req, res, next) =>
  getCaseFileDetails(req.params.cnid)
    .then(createCaseFileAssignmentToolViewModel(req))
    .then(renderCaseFileAssignmentTool(res))
    .catch(failWithError(res, next));

const recordNewCaseFileAssignment = (req, res, next) =>
  getCaseFileDetails(req.params.cnid)
    .then(assignKeyWorker(req.body.keyworker))
    .then(redirect(res, req.baseUrl + '/' + req.params.cnid));

const recordNewCaseNote = (req, res, next) =>
  router.caseNote.recordCaseNote(req.params.cnid, 'sid0005', router.caseNote.types.session, req.body.note)
  .then(redirect(res, req.baseUrl + '/' + req.params.cnid));

// middleware

const setup = (req, res, next) =>
  (router.caseFile = router.caseFile || CaseFileServiceConnection) &&
  (router.caseNote = router.caseNote || CaseNoteServiceConnection) && next();

router.use(setup);

// public

router.get('/', listCaseFiles);
router.get('/:cnid', displayCaseFileDetails);
router.get('/:cnid/assign', displayCaseFileAssignmentTool);
router.post('/:cnid/assign', recordNewCaseFileAssignment);
router.post('/:cnid/record', recordNewCaseNote);

// exports

module.exports = router;
