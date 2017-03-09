const RandomTextGenerator = require('thoughts');
const moment = require('moment');

// personal data
const male_given_names = [ 'Matt', 'Thomas', 'William', 'Howard', 'Ross', 'Stephen', 'Nick', 'David', 'Robert', 'James', 'Gary', 'Phillip' ];
const female_given_names = [ 'Jane', 'Mary', 'Elizabeth', 'Louise', 'Stacy', 'Anne', 'Claire', 'Helen' ];
const surnames = [ 'Smith', 'Holloway', 'Jones', 'Harrison', 'Lennon', 'Hill', 'Black', 'Newton', 'Homer' ];

// establishment data
const courtNames = [ 'Newark Magistrates Court', 'Royal Courts of Justice', 'Sheffield Crown Court', 'Sheffield Crown Court' ];
const prisonNames = [ 'HMP Liverpool', 'HMP Chelmsford', 'HMP Berwin' ];

const inspect = (x) => {
  console.log(x);
  return x;
};

const runMultipleTimes = (fn, max) => {
  var out = [];
  var i = 0;

  while (i < max) {
    out.push(fn(i))
    i++;
  }

  return out;
};

// genral data
const randomInt = (max) => Math.floor((Math.random() * max) + 1);

const randomTimestamp = (start, end) => {
  var date = new Date(+start + Math.random() * (end - start));
  var hour = Math.random() * 24;
  date.setHours(hour);
  return date;
};

var identifier_count = 0;
const getNextIdentifier = () => {
  identifier_count++;
  return ('0000' + identifier_count).substr(-4);
};

const getRandomTelephoneNumber = () =>
  '01' + ('00' + randomInt(99)).substr(-2) + ('000' + randomInt(999)).substr(-3) + ('0000' + randomInt(9999)).substr(-4);

const generateRegisters = () => {
  var out = [];

  out.push((randomInt(3) === 1) ? { register_id: 1, label: 'CRC', abbr: 'CRC' } : { register_id: 0, label: 'NPS', abbr: 'NPS' } );

  if (randomInt(60) === 30) out.push({ register_id: 2, label: 'Vunerable Person', abbr: 'VP' });
  if (randomInt(100) === 10) out.push({ register_id: 3, label: 'Arson', abbr: 'A' });
  if (randomInt(80) === 50) out.push({ register_id: 4, label: 'On ACCT', abbr: 'ACCT' });
  if (randomInt(150) === 80) out.push({ register_id: 5, label: 'Segregated', abbr: 'S' });

  return out;
};

const services = {};
const recordCasefile = (x) => services.casefile.recordCasefile(x);
const recordCaseNote = (x) => services.casenote.recordCaseNote(x);
const registerKeyWorker = (x) => services.keyworker.registerKeyworker(x);
const registerOffender = (x) => services.offender.registerOffender(x);

const generateRandomHistoricalCaseNote = (cf, start) => (i) => {
  var window = randomInt(start) / randomInt(20);

  var s = new Date();
  s.setDate(s.getDate() - (window * i));
  var e = new Date(s);
  e.setDate(s.getDate() - (window));

  var entry = randomTimestamp(s, e);
  if (entry > new Date()) entry = new Date();

  return recordCaseNote({
    casefile_id: cf.casefile_id,
    staff_id: cf.keyworker,
    type: services.casenote.types.session,
    body: RandomTextGenerator.random().thought,
    timestamp: entry
  });
};

const generateRandomHistoricalCaseNotes = (cf) =>
  Promise.all(runMultipleTimes(generateRandomHistoricalCaseNote(cf, moment().diff(moment(cf.sentence.date), 'days')), randomInt(moment().diff(moment(cf.sentence.date), 'days') / 7)));

const generateHistoricalCaseNotes = (l) =>
  Promise.all(l.filter((x) => !!x.keyworker).map((cf) => generateRandomHistoricalCaseNotes(cf)))
    .then((cn) => l);

const generateSentence = (kw) => {
  var d = new Date();

  return {
    courtName: courtNames[randomInt(courtNames.length) - 1],
    date: d.setDate(d.getDate() - (kw ? randomInt(365 * 2) + 365 : randomInt(4))),
  };
};


// generators

const generateKeyWorker = () => {
  var gender = randomInt(20) === 20 ? 'F' : 'M';
  var employment_status = randomInt(10) === 10 ? 'Part time' : 'Full time';
  var given_names = (gender === 'M' ? male_given_names : female_given_names);

  return registerKeyWorker({
    gender: gender,
    date_of_birth: moment().subtract(randomInt(365), 'days').subtract(17 + randomInt(55), 'years'),
    employment_status: employment_status,
    given_name: given_names[randomInt(given_names.length) - 1],
    middle_names: (randomInt(2) === 1) ? given_names[randomInt(given_names.length) - 1] : undefined,
    surname: surnames[randomInt(surnames.length) - 1],
    contact_number: getRandomTelephoneNumber(),
    contact_email: 'test@example.com',
    working_hours: 'Monday to Friday, 9 til 5',
    caseload_capacity: (employment_status === 'Full time' ? 4 : 1) + randomInt(3),
  });
};

const generateKeyWorkers = (max) =>
  Promise.all(runMultipleTimes(generateKeyWorker, max));

const generateOffender = () => {
  var gender = 'M'; // randomInt(20) === 20 ? 'F' : 'M';
  var given_names = (gender === 'M' ? male_given_names : female_given_names);

  return registerOffender({
    nomis_offender_id: 'noid' + getNextIdentifier(),
    pnc_number: 'pnc' + getNextIdentifier(),
    cro_number: 'cro' + getNextIdentifier(),
    gender: gender,
    date_of_birth: moment().subtract(randomInt(365), 'days').subtract(17 + randomInt(55), 'years'),
    image: 'http://placehold.it/150x150',
    given_name: given_names[randomInt(given_names.length) - 1],
    middle_names: (randomInt(2) === 1) ? given_names[randomInt(given_names.length) - 1] : undefined,
    surname: surnames[randomInt(surnames.length) - 1],
  });
};

const generateOffenders = (max) =>
  Promise.all(runMultipleTimes(generateOffender, max));

const generateCasefile = (keyworkers) => (offender) => {
  var kw = keyworkers[randomInt(keyworkers.length) - 1].staff_id;

  return services.casefile.registerCasefile({
    offender: offender.offender_id,
    registers: generateRegisters(),
    sentence: generateSentence(kw),
  })
  .then((cf) =>
    (randomInt(3) !== 3) ?
      Promise.all([
        services.casefile.assignKeyWorkerById(cf.casefile_id, kw),
        services.caseallocationrecord.recordCaseAllocation({
          casefile_id: cf.casefile_id,
          staff_id: kw,
        }),
      ])
      .then(() => services.casefile.getCasefile(cf.casefile_id)) : cf);
};

const generateCasefiles = (data) =>
  Promise.all(data.offenders.map(generateCasefile(data.keyworkers)));

// public

const initialize = (o) => {
  services.offender = o.services.offender;
  services.keyworker = o.services.keyworker;
  services.casefile = o.services.casefile;
  services.casenote = o.services.casenote;
  services.caseallocationrecord = o.services.caseallocationrecord;

  return Promise.all([
      generateOffenders(50),
      generateKeyWorkers(10),
    ])
    .then((data) => ({
      offenders: data[0],
      keyworkers: data[1],
    }))
    .then(generateCasefiles)
    .then(generateHistoricalCaseNotes);
};

// exports

module.exports = initialize;
