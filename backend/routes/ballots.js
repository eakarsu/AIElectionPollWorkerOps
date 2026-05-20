const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'ballots',
  fields: ['ballot_id','precinct_id','type','count','period','status','notes'],
});
