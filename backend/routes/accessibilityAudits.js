const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'accessibility_audits',
  fields: ['audit_id','precinct_id','auditor','score','conducted_at','findings','notes'],
});
