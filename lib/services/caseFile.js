var offender = require('./offender')();

const inspect = (x) => console.log(x) && x;

const caseFilesToList = (caseFiles) => {
  var list = [];

  for (var id in caseFiles) list.push(caseFiles[id]);

  return list
}

const filterById = (id) => (caseFiles) => caseFiles[id];

const generateCaseFiles = (offenders) => {
  var out = {};

  offenders.forEach((offender) => {
    var oid = offender.offender_id;
    var id = oid.replace('oid', 'cf');
    out[id] = {
      casefile_id: id,
      offender: offender,
    }
  });

  return out;
};

const getCaseFiles = () =>
  offender.listOffenders()
    .then(generateCaseFiles)

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
