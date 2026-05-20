const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'training_sessions',
  fields: ['session_id','topic','instructor','attendees_count','date','status','notes'],
});
