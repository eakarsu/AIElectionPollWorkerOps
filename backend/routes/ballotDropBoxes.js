const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'ballot_drop_boxes',
  fields: ['box_id','location','capacity','last_emptied','status','observer','notes'],
});
