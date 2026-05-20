const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'election_judges',
  fields: ['judge_id','name','precinct_id','party_affiliation','certifications','status','notes'],
});
