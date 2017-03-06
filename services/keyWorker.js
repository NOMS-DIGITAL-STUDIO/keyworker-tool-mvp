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

const putKeyWorker = (x) => {
  var out = keyWorkers[x.staff_id] = {
    staff_id: x.staff_id,
    position: 'Key Worker',
    caseFiles: [],
  };

  if (x.gender) out.gender = x.gender;
  if (x.given_name) out.given_name = x.given_name;
  if (x.middle_names) out.middle_names = x.middle_names;
  if (x.surname) out.surname = x.surname;

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
    given_name: x.given_name,
    middle_names: x.middle_names,
    surname: x.surname,
  });

const generate = (max) => {
  for (var i = keyWorker_count; i <= max; ++i) {
    var gender = randomInt(20) === 20 ? "F" : "M";
    var given_names = (gender === "M" ? male_given_names : female_given_names);
    postKeyWorker({
      gender: gender,
      given_name: given_names[randomInt(given_names.length) - 1],
      middle_names: (randomInt(2) === 1) ? given_names[randomInt(given_names.length) - 1] : undefined,
      surname: surnames[randomInt(surnames.length) - 1],
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
