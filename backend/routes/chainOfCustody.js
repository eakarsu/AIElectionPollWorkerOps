const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'chain_of_custody',
  fields: ['custody_id','item','from_actor','to_actor','ts','location','notes'],
});
