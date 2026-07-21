'use strict';

const pool = require('../config/database');
const { hashPassword } = require('../services/passwords');

async function main() {
  const acknowledged = process.env.BOOTSTRAP_ACKNOWLEDGEMENT === 'create-initial-admin'
    || process.env.ALLOW_BOOTSTRAP_ADMIN === '1';
  if (!acknowledged) throw new Error('Explicit bootstrap acknowledgement is required');

  const jurisdiction = process.env.GOVERNANCE_TENANT_ID || process.env.TENANT_ID;
  const email = String(process.env.BOOTSTRAP_ADMIN_EMAIL || process.env.PROVISION_ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD || process.env.PROVISION_ADMIN_PASSWORD;
  const name = process.env.BOOTSTRAP_ADMIN_NAME || process.env.PROVISION_ADMIN_NAME || 'Bootstrap Admin';
  if (!jurisdiction || !email || !password || password.length < 12) {
    throw new Error('Jurisdiction, administrator email, and password of at least 12 characters are required');
  }

  const passwordHash = await hashPassword(password);
  await pool.query(
    `INSERT INTO users(email,password,password_hash,name,role,jurisdiction_id)
     VALUES($1,'migrated-to-password-hash',$2,$3,'admin',$4)
     ON CONFLICT(email) DO UPDATE SET password='migrated-to-password-hash',password_hash=EXCLUDED.password_hash,
       name=EXCLUDED.name,role='admin',jurisdiction_id=EXCLUDED.jurisdiction_id`,
    [email, passwordHash, name, jurisdiction]
  );
  await pool.end();
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
