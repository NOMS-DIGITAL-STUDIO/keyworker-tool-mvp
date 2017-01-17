const given_names = [ 'Matt', 'Thomas', 'William', 'Howard', 'Ross', 'Stephen', 'Nick', 'David', 'Robert', 'James', 'Gary', 'Phillip' ];
const surnames = [ 'Smith', 'Holloway', 'Jones', 'Harrison', 'Lennon', 'Hill', 'Black', 'Newton', 'Homer' ];

const randomInt = (max) => Math.floor((Math.random() * max) + 1);

const offenders = {};
var offenderCount = 0;

const generateOffenders = (offenders, max) => {
  for (var i = 1; i <= max; i++) {
    var id = ('0000' + i).substr(-4);
    var oid = 'oid' + id;
    offenders[oid] = {
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

    if (randomInt(1) === 1) {
      offenders[oid].middle_names = given_names[randomInt(given_names.length) - 1];
    }

    offenderCount++;
  }
};

function SingleOffenderIdServiceConnection(o) {
  this.options = o || {};

  if (offenderCount === 0) {
    generateOffenders(offenders, this.options.max || 50);
  }
}

SingleOffenderIdServiceConnection.prototype.getOffender = function(id) {
  return new Promise((resolve, reject) => resolve(offenders[id]));
};

SingleOffenderIdServiceConnection.prototype.listOffenders = function() {
  return new Promise((resolve, reject) => {
    var list = [];

    for (o in offenders) list.push(offenders[o]);

    resolve(list);
  });
};

module.exports = function factory(o) {
  return new SingleOffenderIdServiceConnection(o);
};
