const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'poll_workers',
  fields: ['worker_id','name','role','precinct_id','language','status','notes'],
});
