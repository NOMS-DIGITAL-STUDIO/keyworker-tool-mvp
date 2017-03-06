const moment = require('moment');

const male_given_names = [ 'Matt', 'Thomas', 'William', 'Howard', 'Ross', 'Stephen', 'Nick', 'David', 'Robert', 'James', 'Gary', 'Phillip' ];
const female_given_names = [ 'Jane', 'Mary', 'Elizabeth', 'Louise', 'Stacy', 'Anne', 'Claire', 'Helen' ];
const surnames = [ 'Smith', 'Holloway', 'Jones', 'Harrison', 'Lennon', 'Hill', 'Black', 'Newton', 'Homer' ];

var keyWorker_count = 0;
const keyWorkers = {};

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

const getNextKeyWorkerId = () =>
  ('0000' + keyWorker_count).substr(-4);

const getRandomTelephoneNumber = () =>
  '01' + ('00' + randomInt(99)).substr(-2) + ('000' + randomInt(999)).substr(-3) + ('0000' + randomInt(9999)).substr(-4);

const putKeyWorker = (x) => {
  var out = keyWorkers[x.staff_id] = {
    staff_id: x.staff_id,
    position: 'Key Worker',
    caseFiles: [],
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

  out.full_name = (((x.given_name) ? x.given_name + ' ' : '') +
                   ((x.middle_names) ? x.middle_names + ' ' : '') +
                   ((x.surname) ? x.surname + ' ' : '')
                  ).trim();

  keyWorker_count++;

  return keyWorkers[x.staff_id];
}

const postKeyWorker = (x) =>
  putKeyWorker({
    staff_id: 'sid' + getNextKeyWorkerId(),
    gender: x.gender,
    date_of_birth: x.date_of_birth,
    employment_status: x.employment_status,
    given_name: x.given_name,
    middle_names: x.middle_names,
    surname: x.surname,
    contact_number: x.contact_number,
    contact_email: x.contact_email,
    working_hours: x.working_hours,
  });

const generate = (max) => {
  for (var i = keyWorker_count; i <= max; ++i) {
    var gender = randomInt(20) === 20 ? "F" : "M";
    var employment_status = randomInt(10) === 10 ? "Part time" : "Full time";
    var given_names = (gender === "M" ? male_given_names : female_given_names);
    postKeyWorker({
      gender: gender,
      date_of_birth: moment().subtract(randomInt(365), 'days').subtract(17 + randomInt(55), 'years'),
      employment_status: employment_status,
      given_name: given_names[randomInt(given_names.length) - 1],
      middle_names: (randomInt(2) === 1) ? given_names[randomInt(given_names.length) - 1] : undefined,
      surname: surnames[randomInt(surnames.length) - 1],
      contact_number: getRandomTelephoneNumber(),
      contact_email: 'test@example.com',
      working_hours: 'Monday to Friday, 9 til 5',
    });
  }
};

const getKeyWorkers = () =>
  new Promise((res, rej) => res(keyWorkers));

// initialize
generate(10);

module.exports.listKeyWorkers = () =>
  getKeyWorkers().then(objToList);

module.exports.getKeyWorker = (id) =>
  getKeyWorkers().then(filterById(id));

module.exports.registerKeyWorker = (x) =>
  postKeyWorker(x);
