
const filterByCaseFileId = (id) => (arr) => arr.filter((x) => x.casefile_id === id);
const filterByStaffId = (id) => (arr) => arr.filter((x) => x.staff_id === id);

const sortCaseFilesByTimestamp = (caseNotes) =>
  caseNotes.sort((a, b) => new Date(b.date) - new Date(a.date));

const caseNotes = [];

const getCaseNotes = () =>
  new Promise((res, rej) => res(caseNotes));

module.exports.getCaseNotesByCaseFile = (casefile_id) =>
  getCaseNotes().then(filterByCaseFileId(casefile_id)).then(sortCaseFilesByTimestamp);

module.exports.getCaseNotesByKeyWorker = (staff_id) =>
  getCaseNotes().then(filterByStaffId(staff_id)).then(sortCaseFilesByTimestamp);

module.exports.recordCaseNote = (casefile_id, staff_id, type, body, timestamp) =>
  getCaseNotes()
    .then((caseNotes) => caseNotes.push({
      casenote_id: ('0000' + caseNotes.length).substr(-4),
      casefile_id: casefile_id,
      staff_id: staff_id,
      body: body,
      type: type,
      timestamp: timestamp || (new Date()).toISOString(),
    }));

module.exports.types = {
  session: 0,
  case: 1,
  contact: 2,
};
