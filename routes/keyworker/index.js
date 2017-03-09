var express = require('express');
var moment = require('moment');
var router = express.Router();

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
const renderKeyWorkerEditor = (res) => format(res, 'keyworker/edit');
const renderKeyWorkerCaseload = (res) => format(res, 'keyworker/caseload');


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

const getKeyWorkerDetails = (id) =>
  router.keyworker.getKeyworker(id);

const getKeyWorkerCaseload = (id) =>
  Promise.all([
    router.keyworker.getKeyworker(id),
    router.caseallocationrecord.getCaseAllocationForKeyworker(id),
  ])
  .then((data) => {
    var kw = data[0];
    var cars = data[1];

    return Promise.all(cars.map((car) =>
      router.casefile.getCasefile(car.casefile_id)
        .then((cf) => {
          if (car.staff_id === kw.staff_id) cf.keyworker = kw;
          return cf;
        })
        .then((cf) =>
          router.offender.getOffender(cf.offender)
            .then((offender) => {
              cf.offender = offender;
              return cf;
            })
        )
      ))
      .then((casefiles) =>
        Promise.all(casefiles.map((cf) =>
            router.casenote.listCaseNotesByCasefile(cf.casefile_id)
                .then((cns) => {
                  if (cns && cns[0]) {
                    cf.lastRecordedCaseNote = cns[0].timestamp;
                    cf.caseNoteOverdue = moment().diff(moment(cf.lastRecordedCaseNote), 'days') > 7;
                  }
                }))
        )
        .then((l) => {
          kw.casefiles = casefiles;
          return kw;
        }));
  });

const getKeyWorkerList = () =>
  router.keyworker.listKeyworkers()
  .then((l) => Promise.all(l.map((x) => getKeyWorkerCaseload(x.staff_id))));

const modifyKeyWorkerDetails = (x) =>
  router.keyworker.modifyKeyworker(x);

const includePersonalCaseloadCapacityCheck = (x) => {
  x.caseload_capacity_over = (x.casefiles && x.casefiles.length > x.caseload_capacity);
  return x;
};

const includeCaseloadCapacityCheck = (l) =>
  l.map(includePersonalCaseloadCapacityCheck);

const createKeyWorkerListViewModel = (req) => (keyWorkers) =>
  req.app.locals.GovukAdminTemplate.create({
    page_title: 'Your Staff',
    keyWorkers: includeCaseloadCapacityCheck(keyWorkers),
    total_keyWorkers: keyWorkers.length,
  });

const createKeyWorkerDetailsViewModel = (req) => (keyWorker) =>
  req.app.locals.GovukAdminTemplate.create({
    page_title: 'My Details',
    keyWorker: keyWorker,
  });

const createKeyWorkerEditorViewModel = (req) => (keyWorker) =>
  req.app.locals.GovukAdminTemplate.create({
    page_title: 'Edit my Details',
    keyWorker: keyWorker,
  });

const createKeyWorkerUpdate = (req) => (keyWorker) => {
  var x = req.body;
  var update = {
    staff_id: keyWorker.staff_id,
  };
  if (x.gender !== keyWorker.gender) update.gender = x.gender;
  if (x.date_of_birth !== keyWorker.date_of_birth) update.date_of_birth = x.date_of_birth;
  if (x.employment_status !== keyWorker.employment_status) update.employment_status = x.employment_status;
  if (x.given_name !== keyWorker.given_name) update.given_name = x.given_name;
  if (x.middle_names !== keyWorker.middle_names) update.middle_names = x.middle_names;
  if (x.surname !== keyWorker.surname) update.surname = x.surname;
  if (x.contact_number !== keyWorker.contact_number) update.contact_number = x.contact_number;
  if (x.contact_email !== keyWorker.contact_email) update.contact_email = x.contact_email;
  if (x.working_hours !== keyWorker.working_hours) update.working_hours = x.working_hours;
  if (x.caseload_capacity !== keyWorker.caseload_capacity) update.caseload_capacity = x.caseload_capacity;

  return update;
};

const createKeyWorkerCaseloadViewModel = (req) => (keyWorker) =>
  req.app.locals.GovukAdminTemplate.create({
    page_title: 'My Caseload',
    keyWorker: includePersonalCaseloadCapacityCheck(keyWorker),
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

const displayKeyWorkerEditor = (req, res, next) =>
  getKeyWorkerDetails(req.params.sid)
    .then(createKeyWorkerEditorViewModel(req))
    .then(renderKeyWorkerEditor(res))
    .catch(failWithError(res, next));

const updateKeyWorkerDetails = (req, res, next) =>
  getKeyWorkerDetails(req.params.sid)
    .then(createKeyWorkerUpdate(req))
    .then(modifyKeyWorkerDetails)
    .then(redirect(res, './'))
    .catch(failWithError(res, next));

const displayKeyWorkerCaseload = (req, res, next) =>
  getKeyWorkerCaseload(req.params.sid)
    .then(createKeyWorkerCaseloadViewModel(req))
    .then(renderKeyWorkerCaseload(res))
    .catch(failWithError(res, next));

// public

router.get('/', listKeyWorkers);
router.get('/:sid', displayKeyWorkerDetails);
router.get('/:sid/edit', displayKeyWorkerEditor);
router.post('/:sid', updateKeyWorkerDetails);
router.get('/:sid/caseload', displayKeyWorkerCaseload);

// exports

module.exports = (o) => {
  router.casefile = o.services.casefile;
  router.casenote = o.services.casenote;
  router.keyworker = o.services.keyworker;
  router.offender = o.services.offender;
  router.caseallocationrecord = o.services.caseallocationrecord;

  return router;
};
