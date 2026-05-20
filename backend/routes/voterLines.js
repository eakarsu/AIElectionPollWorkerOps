const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'voter_lines',
  fields: ['line_id','precinct_id','ts','wait_minutes','queue_length','status','notes'],
});
