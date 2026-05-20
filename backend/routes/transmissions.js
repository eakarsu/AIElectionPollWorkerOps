const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'transmissions',
  fields: ['tx_id','precinct_id','type','sent_at','status','recipient','notes'],
});
