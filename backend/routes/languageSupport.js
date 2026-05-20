const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'language_support',
  fields: ['support_id','precinct_id','language','interpreter_count','materials_count','status','notes'],
});
