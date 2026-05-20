const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'equipment',
  fields: ['eq_id','type','sn','precinct_id','status','last_calibration','notes'],
});
