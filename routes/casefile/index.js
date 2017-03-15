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
const renderCasefileAssignmentHistory = (res) => format(res, 'casefile/assignmenthistory');

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

const getCasefileAssignmentToolDetails = (id) =>
  Promise.all([
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
      ),
    router.keyworker.listKeyworkers(),
  ])
  .then((data) => ({
    casefile: data[0],
    keyworkers: data[1],
  }));

const getCasefileAssignmentHistory = (id) =>
  Promise.all([
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
      ),
    router.caseallocationrecord.listCaseAllocationRecordsForCasefile(id),
  ])
  .then((data) => {
    var out = {
      casefile: data[0],
      history: [],
    };

    var ids = data[1].reduce((a, b) => {
      if (!~a.indexOf(b.staff_id)) a.push(b.staff_id);
      return a;
    }, []);

    return data[1].length > 0 ? router.keyworker.getKeyworkers(ids)
      .then((kws) => {
        out.history = data[1].map((x) => {
          x.keyworker = kws.filter((kw) => kw.staff_id === x.staff_id)[0];
          return x;
        });
        return out;
      }) : out;
  });


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

const createCasefileAssignmentHistory = (req) => (data) =>
  req.app.locals.GovukAdminTemplate.create({
    page_title: 'Assignment history of Staff to Case file for ' + data.casefile.offender.given_name + ' ' + data.casefile.offender.surname,
    casefile: data.casefile,
    history: data.history,
  });

const createCasefileAssignmentToolViewModel = (req) => (data) =>
  req.app.locals.GovukAdminTemplate.create({
    page_title: 'Assign Staff to Case file for ' + data.casefile.offender.given_name + ' ' + data.casefile.offender.surname,
    casefile: data.casefile,
    keyworkers: data.keyworkers,
  });

const assignKeyWorker = (staff_id, casefile_id) =>
  router.caseallocationrecord.getCaseAllocationForCasefile(casefile_id)
    .then((car) => car ? router.caseallocationrecord.recordCaseDeallocation({ casefile_id: casefile_id, staff_id: car.keyworker }) : undefined)
    .then(() => router.caseallocationrecord.recordCaseAllocation({ casefile_id: casefile_id, staff_id: staff_id }));

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
  getCasefileDetailsWithNotes(req.params.cfid)
    .then(createCasefileDetailsViewModel(req))
    .then(renderCasefileDetails(res))
    .catch(failWithError(res, next));

const displayCasefileAssignmentHistory = (req, res, next) =>
  getCasefileAssignmentHistory(req.params.cfid)
    .then(createCasefileAssignmentHistory(req))
    .then(renderCasefileAssignmentHistory(res))
    .catch(failWithError(res, next));

const displayCasefileAssignmentTool = (req, res, next) =>
  getCasefileAssignmentToolDetails(req.params.cfid)
    .then(createCasefileAssignmentToolViewModel(req))
    .then(renderCasefileAssignmentTool(res))
    .catch(failWithError(res, next));

const recordNewCasefileAssignment = (req, res, next) =>
  assignKeyWorker(req.body.keyworker, req.params.cfid)
    .then(redirect(res, req.baseUrl + '/' + req.params.cfid))
    .catch(failWithError(res, next));

const recordNewCaseNote = (req, res, next) =>
  recordCaseNote({
    casefile_id: req.params.cfid,
    // TODO: this has to be the actual ID of the key worker!!
    staff_id: 'sid0005',
    type: router.casenote.types.session,
    body: req.body.note,
  })
  .then(redirect(res, req.baseUrl + '/' + req.params.cfid))
  .catch(failWithError(res, next));

// public

router.get('/', listUnassignedCasefiles);
router.get('/all', listCasefiles);
router.get('/:cfid', displayCasefileDetails);
router.get('/:cfid/assign', displayCasefileAssignmentTool);
router.get('/:cfid/assign/history', displayCasefileAssignmentHistory);
router.post('/:cfid/assign', recordNewCasefileAssignment);
router.post('/:cfid/record', recordNewCaseNote);

// exports

module.exports = (o) => {
  router.casefile = o.services.casefile;
  router.casenote = o.services.casenote;
  router.keyworker = o.services.keyworker;
  router.offender = o.services.offender;
  router.caseallocationrecord = o.services.caseallocationrecord;

  return router;
};
