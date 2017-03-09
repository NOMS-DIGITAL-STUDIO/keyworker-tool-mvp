
var casefile_count = 0;
const casefiles = {};

const inspect = (x) => {
  console.log(x);
  return x;
};

const objToList = (obj) => {
  var list = [];

  for (var id in obj) list.push(Object.assign({}, obj[id]));

  return list
};

const objToFilteredList = (match) => (obj) => {
  var list = [];

  for (var id in obj) {
    if (match(obj[id])) list.push(Object.assign({}, obj[id]));
  }

  return list
};

const firstItem = (arr) => arr[0];

const getNextCasefileId = () =>
  ('0000' + (casefile_count + 1)).substr(-4);

const unlinkKeyWorker = (keyworker_id, casefile_id) => {
  var cf = casefiles[casefile_id];
  if (cf.keyWorker === keyworker_id) cf.keyworker = undefined;
};

const linkKeyWorker = (keyworker_id, casefile_id) => {
  var cf = casefiles[casefile_id];
  if (!cf.keyWorker) cf.keyworker = keyworker_id;
};

const findKeyWorkerByName = (fullname) =>
  KeyWorkerServiceConnection.getKeyWorkerByName(fullname);

const assignKeyWorkerById = (staff_id) => (casefile) => {
  unlinkKeyWorker(staff_id, casefile.casefile_id);
  linkKeyWorker(staff_id, casefile.casefile_id);
  return casefile;
};

const assignKeyWorkerByName = (fullname) => (casefile) =>
  findKeyWorkerByName(fullname)
    .then((keyWorker) => keyWorker ? assignKeyWorkerById(keyWorker.staff_id)(casefile) : keyworker)
    .then(() => casefile);


const putCasefile = (x) => {
  var out = casefiles[x.casefile_id] = casefiles[x.casefile_id] || {
    casefile_id: x.casefile_id,
    offender: x.offender,
    registers: [],
    sentence: undefined,
    keyworker: undefined,
  };

  if (x.keyworker) out.keyworker = x.keyworker;
  if (x.registers) out.registers = x.registers;
  if (x.sentence) out.sentence = x.sentence;

  casefile_count++;

  return new Promise((res, rej) => res(Object.assign({}, casefiles[x.casefile_id])));
}

const postCasefile = (x) =>
  putCasefile({
    casefile_id: 'cf' + getNextCasefileId(),
    offender: x.offender,
    registers: x.registers,
    sentence: x.sentence,
    keyworker: x.keyworker,
  });

const getCasefiles = () =>
  new Promise((res, rej) => res(casefiles));

// exports

module.exports.listCasefiles = () =>
  getCasefiles().then(objToList);

module.exports.listCasefilesByKeyWorker = (id) =>
  getCasefiles().then(objToFilteredList((x) => x.keyworker === id));

module.exports.getCasefileByOffender = (id) =>
  getCasefiles().then(objToFilteredList((x) => x.offender === id)).then(firstItem);

module.exports.getCasefile = (id) =>
  getCasefiles().then(objToFilteredList((x) => x.casefile_id === id)).then(firstItem);

module.exports.assignKeyWorkerById = (id, staff_id) =>
  getCasefiles().then(objToFilteredList((x) => x.casefile_id === id)).then(firstItem).then(assignKeyWorkerById(staff_id));

module.exports.assignKeyWorker = (fullname, id) =>
  getCasefiles().then(objToFilteredList((x) => x.casefile_id === id)).then(firstItem).then(assignKeyWorkerByName(fullname));

module.exports.registerCasefile = (x) =>
  postCasefile(x);
