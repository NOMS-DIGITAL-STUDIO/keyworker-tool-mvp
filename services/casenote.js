
var casenote_count = 0;
const casenotes = {};

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

const getNextCaseNoteId = () =>
  ('0000' + (casenote_count + 1)).substr(-4);

const putCaseNote = (x) => {
  var out = casenotes[x.casenote_id] = {
    casenote_id: x.casenote_id,
    casefile_id: x.casefile_id,
    staff_id: x.staff_id,
    type: x.type,
    body: x.body,
    timestamp: (x.timestamp ? new Date(x.timestamp) : new Date()).toISOString(),
  };

  casenote_count++;

  return new Promise((res, rej) => res(Object.assign({}, casenotes[x.casenote_id])));
}

const postCaseNote = (x) =>
  putCaseNote({
    casenote_id: 'oid' + getNextCaseNoteId(),
    casefile_id: x.casefile_id,
    staff_id: x.staff_id,
    type: x.type,
    body: x.body,
    timestamp: x.timestamp,
  });

const getCaseNotes = () =>
  new Promise((res, rej) => res(casenotes));

// exports

module.exports.listCaseNotesByCasefile = (id) =>
  getCaseNotes().then(objToFilteredList((x) => x.casefile_id === id)).then(sortByTimestamp);

module.exports.listCaseNotesByKeyWorker = (id) =>
  getCaseNotes().then(objToFilteredList((x) => x.staff_id === id)).then(sortByTimestamp);

module.exports.getCaseNote = (id) =>
  getCaseNotes().then(objToFilteredList((x) => x.casenote_id === id)).then(firstItem);

module.exports.recordCaseNote = (x) =>
  postCaseNote(x);

module.exports.types = {
  session: 0,
  case: 1,
  contact: 2,
};
