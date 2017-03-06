
const given_names = [ 'Matt', 'Thomas', 'William', 'Howard', 'Ross', 'Stephen', 'Nick', 'David', 'Robert', 'James', 'Gary', 'Phillip' ];
const surnames = [ 'Smith', 'Holloway', 'Jones', 'Harrison', 'Lennon', 'Hill', 'Black', 'Newton', 'Homer' ];

var offender_count = 0;
const offenders = {};

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

const getNextOffenderId = () =>
  ('0000' + offender_count).substr(-4);

const putOffender = (x) => {
  var out = offenders[x.offender_id] = {
    offender_id: x.offender_id,
  };

  if (x.nomis_offender_id) out.nomis_offender_id = x.nomis_offender_id;
  if (x.pnc_number) out.pnc_number = x.pnc_number;
  if (x.cro_number) out.cro_number = x.cro_number;
  if (x.gender) out.gender = x.gender;
  if (x.age) out.age = x.age;
  if (x.image) out.image = x.image;
  if (x.given_name) out.given_name = x.given_name;
  if (x.middle_names) out.middle_names = x.middle_names;
  if (x.surname) out.surname = x.surname;
  if (x.date_of_birth) out.date_of_birth = x.date_of_birth;

  offender_count++;

  return offenders[x.offender_id];
}

const postOffender = (x) =>
  putOffender({
    offender_id: 'oid' + getNextOffenderId(),
    nomis_offender_id: x.nomis_offender_id,
    pnc_number: x.pnc_number,
    cro_number: x.cro_number,
    gender: x.gender,
    age: x.age,
    image: x.image,
    given_name: x.given_name,
    middle_names: x.middle_names,
    surname: x.surname,
    date_of_birth: x.date_of_birth,
  });

const generate = (max) => {
  var out = offenders;

  for (var i = offender_count; i <= max; ++i) {
    var id = getNextOffenderId();
    putOffender({
      offender_id: 'oid' + id,
      nomis_offender_id: 'noid' + id,
      pnc_number: 'pnc' + id,
      cro_number: 'cro' + id,
      gender: 'M',
      age: randomInt(55) + 18,
      image: 'http://placehold.it/150x150',
      given_name: given_names[randomInt(given_names.length) - 1],
      middle_names: (randomInt(2) === 1) ? given_names[randomInt(given_names.length) - 1] : undefined,
      surname: surnames[randomInt(surnames.length) - 1],
      date_of_birth: (2017 - randomInt(55)) + '-' + (13 - randomInt(12)) + '-' + (29 - randomInt(28)),
    });
  }

  return out;
};

const getOffenders = () =>
  new Promise((res, rej) => res(offenders));

// initalize
generate(50);

module.exports.listOffenders = () =>
  getOffenders().then(objToList);

module.exports.getOffender = (id) =>
  getOffenders().then(filterById(id));

module.exports.registerOffender = (x) =>
  postOffender(x);
