const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'observers',
  fields: ['observer_id','name','org','precinct_id','accredited_at','status','notes'],
});
