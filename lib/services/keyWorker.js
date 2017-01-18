const male_given_names = [ 'Matt', 'Thomas', 'William', 'Howard', 'Ross', 'Stephen', 'Nick', 'David', 'Robert', 'James', 'Gary', 'Phillip' ];
const female_given_names = [ 'Jane', 'Mary', 'Elizabeth', 'Louise', 'Stacy', 'Anne', 'Claire', 'Helen' ];
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
    var sid = 'sid' + id;
    var gender = randomInt(20) === 20 ? "F" : "M";
    var given_names = (gender === "M" ? male_given_names : female_given_names);
    out[sid] = {
      staff_id: sid,
      gender: gender,
      given_name: given_names[randomInt(given_names.length) - 1],
      surname: surnames[randomInt(surnames.length) - 1],
      position: 'Key Worker',
      caseFiles: [],
    };

    if (randomInt(2) === 1) {
      out[sid].middle_names = given_names[randomInt(given_names.length) - 1];
    }
  }

  return out;
};

const keyWorkers = generate(10);

const getKeyWorkers = () =>
  new Promise((res, rej) => res(keyWorkers));

module.exports.listKeyWorkers = () =>
  getKeyWorkers().then(objToList);

module.exports.getKeyWorker = (id) =>
  getKeyWorkers().then(filterById(id));
