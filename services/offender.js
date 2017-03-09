const moment = require('moment');

var offender_count = 0;
const offenders = {};

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

const getNextOffenderId = () =>
  ('0000' + (offender_count + 1)).substr(-4);

const putOffender = (x) => {
  var out = offenders[x.offender_id] = {
    offender_id: x.offender_id,
  };

  if (x.nomis_offender_id) out.nomis_offender_id = x.nomis_offender_id;
  if (x.pnc_number) out.pnc_number = x.pnc_number;
  if (x.cro_number) out.cro_number = x.cro_number;
  if (x.gender) out.gender = x.gender;
  if (x.date_of_birth) {
    out.date_of_birth = x.date_of_birth;
    out.age = moment(x.date_of_birth).toNow(true);
  }
  if (x.age) out.age = x.age;
  if (x.image) out.image = x.image;
  if (x.given_name) out.given_name = x.given_name;
  if (x.middle_names) out.middle_names = x.middle_names;
  if (x.surname) out.surname = x.surname;

  out.full_name = (((x.given_name) ? x.given_name + ' ' : '') +
                   ((x.middle_names) ? x.middle_names + ' ' : '') +
                   ((x.surname) ? x.surname + ' ' : '')
                  ).trim();

  offender_count++;

  return new Promise((res, rej) => res(Object.assign({}, offenders[x.offender_id])));
}

const postOffender = (x) =>
  putOffender({
    offender_id: 'oid' + getNextOffenderId(),
    nomis_offender_id: x.nomis_offender_id,
    pnc_number: x.pnc_number,
    cro_number: x.cro_number,
    gender: x.gender,
    date_of_birth: x.date_of_birth,
    image: x.image,
    given_name: x.given_name,
    middle_names: x.middle_names,
    surname: x.surname,
  });

const getOffenders = () =>
  new Promise((res, rej) => res(offenders));

// exports

module.exports.listOffenders = () =>
  getOffenders().then(objToList);

module.exports.getOffender = (id) =>
  getOffenders().then(objToFilteredList((x) => x.offender_id === id)).then(firstItem);

module.exports.registerOffender = (x) =>
  postOffender(x);
