const moment = require('moment');

var keyworker_count = 0;
const keyworkers = {};

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

const getNextKeyworkerId = () =>
  ('0000' + (keyworker_count + 1)).substr(-4);

const putKeyworker = (x) => {
  var out = keyworkers[x.staff_id] = keyworkers[x.staff_id] || {
    staff_id: x.staff_id,
    position: 'Key Worker',
    casefiles: [],
  };

  if (x.gender) out.gender = x.gender;
  if (x.date_of_birth) {
    out.date_of_birth = x.date_of_birth;
    out.age = moment(x.date_of_birth).toNow(true);
  }
  if (x.employment_status) out.employment_status = x.employment_status;
  if (x.given_name) out.given_name = x.given_name;
  if (x.middle_names) out.middle_names = x.middle_names;
  if (x.surname) out.surname = x.surname;

  if (x.contact_number) out.contact_number = x.contact_number;
  if (x.contact_email) out.contact_email = x.contact_email;
  if (x.working_hours) out.working_hours = x.working_hours;
  if (x.caseload_capacity) out.caseload_capacity = x.caseload_capacity;

  out.full_name = (((x.given_name) ? x.given_name + ' ' : '') +
                   ((x.middle_names) ? x.middle_names + ' ' : '') +
                   ((x.surname) ? x.surname + ' ' : '')
                  ).trim();

  keyworker_count++;

  return new Promise((res, rej) => res(Object.assign({}, keyworkers[x.staff_id])));
}

const postKeyworker = (x) =>
  putKeyworker({
    staff_id: 'sid' + getNextKeyworkerId(),
    gender: x.gender,
    date_of_birth: x.date_of_birth,
    employment_status: x.employment_status,
    given_name: x.given_name,
    middle_names: x.middle_names,
    surname: x.surname,
    contact_number: x.contact_number,
    contact_email: x.contact_email,
    working_hours: x.working_hours,
    caseload_capacity: x.caseload_capacity,
  });

const getKeyworkers = () =>
  new Promise((res, rej) => res(keyworkers));

// exports

module.exports.listKeyworkers = () =>
  getKeyworkers().then(objToList);

module.exports.getKeyworkerByName = (fullname) =>
  getKeyworkers().then(objToFilteredList((x) => x.full_name === fullname)).then(firstItem);

module.exports.getKeyworkers = (ids) =>
  getKeyworkers().then(objToFilteredList((x) => ~ids.indexOf(x.staff_id)));

module.exports.getKeyworker = (id) =>
  getKeyworkers().then(objToFilteredList((x) => x.staff_id === id)).then(firstItem);

module.exports.registerKeyworker = (x) =>
  postKeyworker(x);

module.exports.modifyKeyworker = (x) =>
  putKeyworker(x);
