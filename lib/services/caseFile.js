var offender = require('./offender')();

const randomInt = (max) => Math.floor((Math.random() * max) + 1);

const inspect = (x) => console.log(x) && x;

const caseFilesToList = (caseFiles) => {
  var list = [];

  for (var id in caseFiles) list.push(caseFiles[id]);

  return list
}

const filterById = (id) => (caseFiles) => caseFiles[id];

const generateRegisters = () => {
  var out = [];

  out.push((randomInt(3) === 1) ? { register_id: 1, label: 'CRC', abbr: 'CRC' } : { register_id: 0, label: 'NPS', abbr: 'NPS' } );

  if (randomInt(60) === 30) out.push({ register_id: 2, label: 'Vunerable Person', abbr: 'VP' });
  if (randomInt(100) === 10) out.push({ register_id: 3, label: 'Arson', abbr: 'A' });
  if (randomInt(80) === 50) out.push({ register_id: 4, label: 'On ACCT', abbr: 'ACCT' });
  if (randomInt(150) === 80) out.push({ register_id: 5, label: 'Segregated', abbr: 'S' });

  return out;
}

var caseFiles;
const generateCaseFiles = (offenders) => {
  caseFiles = {};

  // one case file for each offender

  offenders.forEach((offender) => {
    var oid = offender.offender_id;
    var id = oid.replace('oid', 'cf');

    // ger registers for an offender
    var registers = generateRegisters();

    // get key worker assignment for a case
    var keyworker;

    caseFiles[id] = {
      casefile_id: id,
      offender: offender,
      registers: registers,
      keyworker: keyworker,
    }
  });

  return caseFiles;
};

const getCaseFiles = () =>
  caseFiles
    ? new Promise((res, rej) => res(caseFiles))
    : offender.listOffenders().then(generateCaseFiles);

function CaseFileServiceConnection(o) {
  this.options = o;
}

CaseFileServiceConnection.prototype.listCaseFiles = function() {
  return getCaseFiles()
    .then(caseFilesToList);
};

CaseFileServiceConnection.prototype.getCaseFile = function(id) {
  return getCaseFiles()
    .then(filterById(id));
};

module.exports = function factory(o) {
  return new CaseFileServiceConnection(o || {});
};
