var express = require('express');
var router = express.Router();

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
const renderCasefileList = (res) => format(res, 'casefile/list');
const renderUnassignedCasefileList = (res) => format(res, 'casefile/unassignedlist');
const renderCasefileDetails = (res) => format(res, 'casefile/details');
const renderCasefileAssignmentTool = (res) => format(res, 'casefile/assign');

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

const getCasefileList = () =>
  Promise.all([
    router.casefile.listCasefiles(),
    router.keyworker.listKeyworkers(),
    router.offender.listOffenders(),
  ])
  .then((data) =>
    Promise.all(data[0].map((cf) =>
      router.caseallocationrecord.getCaseAllocationForCasefile(cf.casefile_id)
        .then((car) => {
          if (car) cf.keyworker = data[1].filter((kw) => kw.staff_id === car.staff_id)[0];
          cf.offender = data[2].filter((o) => o.offender_id === cf.offender)[0];
          return cf;
        }))
    )
  );

const getCasefileDetails = (id) =>
  router.casefile.getCasefile(id)
  .then((cf) =>
    router.caseallocationrecord.getCaseAllocationForCasefile(cf.casefile_id)
      .then((car) =>
        Promise.all([
          (car) ? router.keyworker.getKeyworker(car.staff_id) : undefined,
          router.offender.getOffender(cf.offender),
        ])
        .then((data) => {
          cf.keyworker = data[0];
          cf.offender = data[1];
          return cf;
        })
      )
  );

const getCasefileDetailsWithNotes = (id) =>
  Promise.all([
    router.casefile.getCasefile(id),
    router.casenote.listCaseNotesByCasefile(id),
  ])
  .then((data) => {
    data[0].lastRecordedCaseNote = (data[1][0] || {}).timestamp;
    return {
      casefile: data[0],
      caseNotes: data[1],
    };
  })
  .then((x) =>
    router.caseallocationrecord.getCaseAllocationForCasefile(x.casefile.casefile_id)
      .then((car) =>
        Promise.all([
          (car) ? router.keyworker.getKeyworker(car.staff_id) : undefined,
          router.offender.getOffender(x.casefile.offender),
        ])
        .then((data) => {
          x.casefile.keyworker = data[0];
          x.casefile.offender = data[1];
          return x;
        })
      )
  );

const createCasefileListViewModel = (req) => (casefiles) =>
  req.app.locals.GovukAdminTemplate.create({
    page_title: 'Your case files',
    casefiles: casefiles.filter((casefile) => !!casefile.keyworker),
    unassignedCasefiles: casefiles.filter((casefile) => !casefile.keyworker),
    total_casefiles: casefiles.length,
  });

const createUnassignedCasefileListViewModel = (req) => (casefiles) =>
  req.app.locals.GovukAdminTemplate.create({
    page_title: 'Unassigned case files',
    unassignedCasefiles: casefiles.filter((casefile) => !casefile.keyworker),
    total_casefiles: casefiles.length,
  });

const createCasefileDetailsViewModel = (req) => (data) =>
  req.app.locals.GovukAdminTemplate.create({
    page_title: 'Case file for ' + data.casefile.offender.given_name + ' ' + data.casefile.offender.surname,
    casefile: data.casefile,
    caseNotes: data.caseNotes,
  });

const createCasefileAssignmentToolViewModel = (req) => (casefile) =>
  req.app.locals.GovukAdminTemplate.create({
    page_title: 'Assign Staff to Case file for ' + casefile.offender.given_name + ' ' + casefile.offender.surname,
    casefile: casefile,
  });

const assignKeyWorker = (keyworker_fullname, casefile) =>
  // TODO: record case assignment
  router.casefile.assignKeyWorker(keyworker_fullname, casefile.casefile_id);

const recordCaseNote = (x) =>
  router.casenote.recordCaseNote(x);

const listUnassignedCasefiles = (req, res, next) =>
  getCasefileList()
    .then(createUnassignedCasefileListViewModel(req))
    .then(renderUnassignedCasefileList(res))
    .catch(failWithError(res, next));

const listCasefiles = (req, res, next) =>
  getCasefileList()
    .then(createCasefileListViewModel(req))
    .then(renderCasefileList(res))
    .catch(failWithError(res, next));

const displayCasefileDetails = (req, res, next) =>
  getCasefileDetailsWithNotes(req.params.cnid)
    .then(createCasefileDetailsViewModel(req))
    .then(renderCasefileDetails(res))
    .catch(failWithError(res, next));

const displayCasefileAssignmentTool = (req, res, next) =>
  getCasefileDetails(req.params.cnid)
    .then(createCasefileAssignmentToolViewModel(req))
    .then(renderCasefileAssignmentTool(res))
    .catch(failWithError(res, next));

const recordNewCasefileAssignment = (req, res, next) =>
  assignKeyWorker(req.body.keyworker, req.params.cnid)
    .then(redirect(res, req.baseUrl + '/' + req.params.cnid))
    .catch(failWithError(res, next));

const recordNewCaseNote = (req, res, next) =>
  recordCaseNote({
    casefile_id: req.params.cnid,
    // TODO: this has to be the actual ID of the key worker!!
    staff_id: 'sid0005',
    type: router.casenote.types.session,
    body: req.body.note,
  })
  .then(redirect(res, req.baseUrl + '/' + req.params.cnid))
  .catch(failWithError(res, next));

// public

router.get('/', listUnassignedCasefiles);
router.get('/all', listCasefiles);
router.get('/:cnid', displayCasefileDetails);
router.get('/:cnid/assign', displayCasefileAssignmentTool);
router.post('/:cnid/assign', recordNewCasefileAssignment);
router.post('/:cnid/record', recordNewCaseNote);

// exports

module.exports = (o) => {
  router.casefile = o.services.casefile;
  router.casenote = o.services.casenote;
  router.keyworker = o.services.keyworker;
  router.offender = o.services.offender;
  router.caseallocationrecord = o.services.caseallocationrecord;

  return router;
};
