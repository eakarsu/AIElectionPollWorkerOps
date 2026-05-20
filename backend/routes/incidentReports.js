const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'incident_reports',
  fields: ['incident_id','precinct_id','type','severity','opened_at','status','notes'],
});
