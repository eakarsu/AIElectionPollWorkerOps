const test=require('node:test');const assert=require('node:assert/strict');
const {hashPassword,verifyPassword}=require('../services/passwords');
test('passwords use salted scrypt and reject a wrong password',async()=>{const hash=await hashPassword('long-enough-password');assert.match(hash,/^scrypt:/);assert.equal(await verifyPassword('long-enough-password',hash),true);assert.equal(await verifyPassword('wrong',hash),false);});
