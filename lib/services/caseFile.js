var SingleOffenderIdServiceConnection = require('./offender');
var KeyWorkerServiceConnection = require('./keyWorker');


const randomInt = (max) => Math.floor((Math.random() * max) + 1);

const inspect = (x) => {
  console.log(x);
  return x;
};

const objToList = (obj) => {
  var list = [];

  for (var id in obj) list.push(obj[id]);

  return list
}

const filterById = (id) => (arr) => arr[id];

const generateRegisters = () => {
  var out = [];

  out.push((randomInt(3) === 1) ? { register_id: 1, label: 'CRC', abbr: 'CRC' } : { register_id: 0, label: 'NPS', abbr: 'NPS' } );

  if (randomInt(60) === 30) out.push({ register_id: 2, label: 'Vunerable Person', abbr: 'VP' });
  if (randomInt(100) === 10) out.push({ register_id: 3, label: 'Arson', abbr: 'A' });
  if (randomInt(80) === 50) out.push({ register_id: 4, label: 'On ACCT', abbr: 'ACCT' });
  if (randomInt(150) === 80) out.push({ register_id: 5, label: 'Segregated', abbr: 'S' });

  return out;
}

const unlinkKeyWorker = (caseFile) => {
  var casefile_id = caseFile.casefile_id;
  caseFile.keyworker.caseFiles = caseFile.keyworker.caseFiles.filter((x) => x.casefile_id !== casefile_id);
  caseFile.keyworker = undefined;
}

const linkKeyWorker = (keyWorker, caseFile) => {
  var casefile_id = caseFile.casefile_id;
  var keyworker_id = keyWorker.staff_id;

  caseFile.keyworker = keyWorker;
  keyWorker.caseFiles.push(caseFile);
};

const findKeyWorkerByName = (fullname) =>
  KeyWorkerServiceConnection.listKeyWorkers()
    .then((keyWorkers) => keyWorkers.filter((keyWorker) => keyWorker.full_name === fullname)[0]);

const assignKeyWorkerByName = (fullname) => (caseFile) =>
  findKeyWorkerByName(fullname)
    .then((keyWorker) => {
      if (keyWorker) {
        unlinkKeyWorker(caseFile);
        linkKeyWorker(keyWorker, caseFile);
      }
    })
    .then(() => caseFile);

const assignRandomKeyWorker = (keyWorkers, caseFile) => {
  if (randomInt(3) !== 3) {
    linkKeyWorker(keyWorkers[randomInt(keyWorkers.length) - 1], caseFile);
  }

  return caseFile;
};

const assignRandomKeyWorkers = (caseFiles) => (keyWorkers) => {
  for (var casefile_id in caseFiles) {
    assignRandomKeyWorker(keyWorkers, caseFiles[casefile_id]);
  }

  return caseFiles;
};

const generateKeyWorkerAssignment = (caseFiles) =>
  KeyWorkerServiceConnection.listKeyWorkers().then(assignRandomKeyWorkers(caseFiles));

var caseFiles;
const generateCaseFiles = (offenders) => {
  caseFiles = {};

  // one case file for each offender
  offenders.forEach((offender) => {
    var oid = offender.offender_id;
    var id = oid.replace('oid', 'cf');

    // ger registers for an offender
    var registers = generateRegisters();

    caseFiles[id] = {
      casefile_id: id,
      offender: offender,
      registers: registers,
      keyworker: undefined,
    }
  });

  return caseFiles;
};

const getCaseFiles = () =>
  caseFiles
    ? new Promise((res, rej) => res(caseFiles))
    : SingleOffenderIdServiceConnection.listOffenders()
        .then(generateCaseFiles)
        .then(generateKeyWorkerAssignment);

const listCaseFiles = module.exports.listCaseFiles = () =>
  getCaseFiles().then(objToList);

const getCaseFile = module.exports.getCaseFile = (id) =>
  getCaseFiles().then(filterById(id));

const assignKeyWorker = module.exports.assignKeyWorker = (keyworker_fullname, id) =>
  getCaseFile(id).then(assignKeyWorkerByName(keyworker_fullname));
