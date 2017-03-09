
var caseallocationrecord_count = 0;
const caseallocationrecords = {};

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

const sortByTimestamp = (l) =>
  l.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

const picMostRecentCaseFileRecords = (l) =>
  objToList(l.reduce((a, car) => {
    if (!a[car.casefile_id] || a[car.casefile_id].timestamp < car.timestamp) a[car.casefile_id] = car;
    return a;
  }, {}));

const getNextCaseAllocationRecordId = () =>
  ('0000' + (caseallocationrecord_count + 1)).substr(-4);

const putCaseAllocationRecord = (x) => {
  var out = caseallocationrecords[x.caseallocationrecord_id] = {
    caseallocationrecord_id: x.caseallocationrecord_id,
    casefile_id: x.casefile_id,
    staff_id: x.staff_id,
    type: x.type,
    reason: undefined,
    timestamp: (x.timestamp ? new Date(x.timestamp) : new Date()).toISOString(),
  };

  if (x.reason) out.reason = x.reason;

  caseallocationrecord_count++;

  return new Promise((res, rej) => res(Object.assign({}, caseallocationrecords[x.caseallocationrecord_id])));
}

const postCaseAllocationRecord = (x) =>
  putCaseAllocationRecord({
    caseallocationrecord_id: 'carid' + getNextCaseAllocationRecordId(),
    casefile_id: x.casefile_id,
    staff_id: x.staff_id,
    type: x.type,
    reason: x.reason,
    timestamp: x.timestamp,
  });

const getCaseAllocationRecord = () =>
  new Promise((res, rej) => res(caseallocationrecords));

// exports

module.exports.listCaseAllocationRecordsForCasefile = (id) =>
  getCaseAllocationRecord()
    .then(objToFilteredList((x) => x.casefile_id === id))
    .then(sortByTimestamp);

module.exports.getCaseAllocationForCasefile = (id) =>
  getCaseAllocationRecord()
    .then(objToFilteredList((x) => x.casefile_id === id))
    .then(sortByTimestamp)
    .then(firstItem);

module.exports.listCaseAllocationRecordsForKeyworker = (id) =>
  getCaseAllocationRecord()
    .then(objToFilteredList((x) => x.staff_id === id))
    .then(sortByTimestamp);

module.exports.getCaseAllocationForKeyworker = (id) =>
  getCaseAllocationRecord()
    .then(objToFilteredList((x) => x.staff_id === id))
    .then(sortByTimestamp)
    .then(picMostRecentCaseFileRecords);

module.exports.recordCaseAllocation = (x) => {
  var r = Object.assign({}, x);
  r.type = module.exports.types.Allocation;

  return postCaseAllocationRecord(r);
}

module.exports.recordCaseDeallocation = (x) => {
  var r = Object.assign({}, x);
  r.type = module.exports.types.Deallocation;

  return postCaseAllocationRecord(r);
}

module.exports.types = {
  Allocation: 0,
  Deallocation: 1,
};
