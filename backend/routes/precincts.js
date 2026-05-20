const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'precincts',
  fields: ['precinct_id','name','ward','address','registered_voters','status','notes'],
});
