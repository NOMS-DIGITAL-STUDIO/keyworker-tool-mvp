const male_given_names = [ 'Matt', 'Thomas', 'William', 'Howard', 'Ross', 'Stephen', 'Nick', 'David', 'Robert', 'James', 'Gary', 'Phillip' ];
const female_given_names = [ 'Jane', 'Mary', 'Elizabeth', 'Louise', 'Stacy', 'Anne', 'Claire', 'Helen' ];
const surnames = [ 'Smith', 'Holloway', 'Jones', 'Harrison', 'Lennon', 'Hill', 'Black', 'Newton', 'Homer' ];

const randomInt = (max) => Math.floor((Math.random() * max) + 1);

const keyWorkers = {};
var keyWorkerCount = 0;

const generateKeyWorkers = (keyWorkers, max) => {
  for (var i = 1; i <= max; i++) {
    var id = ('0000' + i).substr(-4);
    var sid = 'sid' + id;
    var given_names = (gender === "M" ? male_given_names : female_given_names);
    var gender = randomInt(20) === 20 ? "F" : "M";
    keyWorkers[sid] = {
      staff_id: sid,
      gender: gender,
      given_name: given_names[randomInt(given_names.length) - 1],
      surname: surnames[randomInt(surnames.length) - 1],
      position: 'Key Worker',
    };

    if (randomInt(1) === 1) {
      keyWorkers[sid].middle_names = given_names[randomInt(given_names.length) - 1];
    }

    keyWorkerCount++;
  }
};

function SingleKeyWorkerIdServiceConnection(o) {
  this.options = o || {};

  if (keyWorkerCount === 0) {
    generateKeyWorkers(keyWorkers, this.options.max || 10);
  }
}

SingleKeyWorkerIdServiceConnection.prototype.getKeyWorker = function(id) {
  return new Promise((resolve, reject) => resolve(keyWorkers[id]));
};

SingleKeyWorkerIdServiceConnection.prototype.listKeyWorkers = function() {
  return new Promise((resolve, reject) => {
    var list = [];

    for (o in keyWorkers) list.push(keyWorkers[o]);

    resolve(list);
  });
};

module.exports = function factory(o) {
  return new SingleKeyWorkerIdServiceConnection(o);
};
