
const given_names = [ 'Matt', 'Thomas', 'William', 'Howard', 'Ross', 'Stephen', 'Nick', 'David', 'Robert', 'James', 'Gary', 'Phillip' ];
const surnames = [ 'Smith', 'Holloway', 'Jones', 'Harrison', 'Lennon', 'Hill', 'Black', 'Newton', 'Homer' ];

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

const generate = (max) => {
  var out = {};

  for (var i = 1; i <= max; i++) {
    var id = ('0000' + i).substr(-4);
    var oid = 'oid' + id;
    out[oid] = {
      offender_id: oid,
      nomis_offender_id: 'noid' + id,
      pnc_number: 'pnc' + id,
      cro_number: 'cro' + id,
      gender: 'M',
      image: 'http://placehold.it/150x150',
      given_name: given_names[randomInt(given_names.length) - 1],
      surname: surnames[randomInt(surnames.length) - 1],
      date_of_birth: (2017 - randomInt(55)) + '-' + (13 - randomInt(12)) + '-' + (29 - randomInt(28)),
    };

    if (randomInt(2) === 1) {
      out[oid].middle_names = given_names[randomInt(given_names.length) - 1];
    }
  }

  return out;
};

const offenders = generate(50);

const getOffenders = () =>
  new Promise((res, rej) => res(offenders));

module.exports.listOffenders = () =>
  getOffenders().then(objToList);

module.exports.getOffender = (id) =>
  getOffenders().then(filterById(id));
