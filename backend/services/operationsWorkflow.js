class OperationsError extends Error { constructor(message, code='INVALID_OPERATIONS_WORKFLOW'){super(message);this.code=code;} }
const clean=(v,n,max=1000)=>{const s=String(v||'').trim();if(!s)throw new OperationsError(`${n} is required`);if(s.length>max)throw new OperationsError(`${n} is too long`);return s;};
function validateWorker(input){
  if(input.eligibility_confirmed!==true)throw new OperationsError('eligibility must be confirmed by an authorized official');
  return {worker_reference:clean(input.worker_reference,'worker_reference',100),eligibility_basis:clean(input.eligibility_basis,'eligibility_basis',300),
    training_modules:Array.isArray(input.training_modules)?[...new Set(input.training_modules.map(String))]:[],languages:Array.isArray(input.languages)?input.languages.slice(0,20):[],
    accessibility_needs:Array.isArray(input.accessibility_needs)?input.accessibility_needs.slice(0,20):[],conflicts:Array.isArray(input.conflicts)?input.conflicts.slice(0,20):[]};
}
function validateAssignment(input){
  const start=new Date(input.starts_at),end=new Date(input.ends_at);if(!Number.isFinite(start.getTime())||!Number.isFinite(end.getTime())||start>=end)throw new OperationsError('assignment times are invalid');
  return {worker_id:Number(input.worker_id),site_id:clean(input.site_id,'site_id',100),role:clean(input.role,'role',100),starts_at:start.toISOString(),ends_at:end.toISOString(),required_language:input.required_language?clean(input.required_language,'required_language',60):null};
}
function overlaps(a,b){return new Date(a.starts_at)<new Date(b.ends_at)&&new Date(b.starts_at)<new Date(a.ends_at);}
function validateOfflineCheckin(input){
  const seq=Number(input.local_sequence);if(!Number.isInteger(seq)||seq<0)throw new OperationsError('local_sequence must be a non-negative integer');
  return {device_id:clean(input.device_id,'device_id',120),local_sequence:seq,worker_id:Number(input.worker_id),site_id:clean(input.site_id,'site_id',100),event_type:clean(input.event_type,'event_type',30),recorded_at:clean(input.recorded_at,'recorded_at',40)};
}
function requiresManualDispatch(severity){return ['high','critical'].includes(String(severity).toLowerCase());}
module.exports={OperationsError,validateWorker,validateAssignment,validateOfflineCheckin,overlaps,requiresManualDispatch};
