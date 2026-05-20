const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'recounts',
  fields: ['recount_id','race','precinct_id','status','started_at','ended_at','notes'],
});
