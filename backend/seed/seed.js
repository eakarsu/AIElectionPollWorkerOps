const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'election_pollworker',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function run() {
  const client = await pool.connect();
  try {
    console.log('[seed] resetting tables...');
    await client.query(`
      DROP TABLE IF EXISTS precincts             CASCADE;
      DROP TABLE IF EXISTS poll_workers          CASCADE;
      DROP TABLE IF EXISTS equipment             CASCADE;
      DROP TABLE IF EXISTS ballots               CASCADE;
      DROP TABLE IF EXISTS chain_of_custody      CASCADE;
      DROP TABLE IF EXISTS training_sessions     CASCADE;
      DROP TABLE IF EXISTS voter_lines           CASCADE;
      DROP TABLE IF EXISTS incident_reports      CASCADE;
      DROP TABLE IF EXISTS election_judges       CASCADE;
      DROP TABLE IF EXISTS recounts              CASCADE;
      DROP TABLE IF EXISTS observers             CASCADE;
      DROP TABLE IF EXISTS supplies              CASCADE;
      DROP TABLE IF EXISTS vehicles              CASCADE;
      DROP TABLE IF EXISTS ballot_drop_boxes     CASCADE;
      DROP TABLE IF EXISTS accessibility_audits  CASCADE;
      DROP TABLE IF EXISTS language_support      CASCADE;
      DROP TABLE IF EXISTS audit_log             CASCADE;
      DROP TABLE IF EXISTS transmissions         CASCADE;
      DROP TABLE IF EXISTS ai_results            CASCADE;

      DROP TABLE IF EXISTS users                 CASCADE;
      DROP TABLE IF EXISTS notifications         CASCADE;
      DROP TABLE IF EXISTS attachments           CASCADE;
      DROP TABLE IF EXISTS webhooks              CASCADE;
      DROP TABLE IF EXISTS webhook_deliveries    CASCADE;
      DROP TABLE IF EXISTS ai_approvals          CASCADE;
    `);

    console.log('[seed] applying migrations...');
    const schema1 = fs.readFileSync(path.join(__dirname, '..', 'migrations', '001_schema.sql'), 'utf8');
    await client.query(schema1);
    const schema2 = fs.readFileSync(path.join(__dirname, '..', 'migrations', '002_schema.sql'), 'utf8');
    await client.query(schema2);
    const schema3 = fs.readFileSync(path.join(__dirname, '..', 'migrations', '003_schema.sql'), 'utf8');
    await client.query(schema3);

    // ─────────────────────────────────────────────
    // 18 domain entities (15 rows each)
    // ─────────────────────────────────────────────

    console.log('[seed] inserting precincts...');
    const precincts = [
      ['PCT-001', 'Lincoln Elementary School',     'Ward 1', '120 Lincoln Ave, Springfield',   2148, 'open'],
      ['PCT-002', 'Madison Community Center',      'Ward 1', '45 Madison Blvd, Springfield',   1872, 'open'],
      ['PCT-003', 'Jefferson Public Library',      'Ward 2', '88 Jefferson Way, Springfield',  2540, 'open'],
      ['PCT-004', 'Roosevelt Middle School',       'Ward 2', '210 Roosevelt Dr, Springfield',  3104, 'open'],
      ['PCT-005', 'Adams Senior Center',           'Ward 3', '14 Adams St, Springfield',       1488, 'open'],
      ['PCT-006', 'Kennedy Recreation Center',     'Ward 3', '305 Kennedy Pkwy, Springfield',  2210, 'open'],
      ['PCT-007', 'Eisenhower Fire Station 4',     'Ward 4', '77 Eisenhower Rd, Springfield',   980, 'open'],
      ['PCT-008', 'Truman Civic Hall',             'Ward 4', '12 Truman Plaza, Springfield',   2680, 'open'],
      ['PCT-009', 'Hayes High School',             'Ward 5', '440 Hayes St, Springfield',      3320, 'open'],
      ['PCT-010', 'McKinley Church Annex',         'Ward 5', '63 McKinley Ln, Springfield',    1150, 'open'],
      ['PCT-011', 'Garfield VFW Post 12',          'Ward 6', '8 Garfield Ave, Springfield',    1395, 'staffing_short'],
      ['PCT-012', 'Cleveland Senior Lodge',        'Ward 6', '199 Cleveland Cir, Springfield',  840, 'open'],
      ['PCT-013', 'Harrison Sports Complex',       'Ward 7', '512 Harrison Way, Springfield',  4108, 'open'],
      ['PCT-014', 'Arthur Community Church',       'Ward 7', '37 Arthur Rd, Springfield',      1620, 'equipment_issue'],
      ['PCT-015', 'Polk Township Office',          'Ward 8', '5 Polk Sq, Springfield',         2055, 'open'],
    ];
    for (const p of precincts) {
      await client.query(
        `INSERT INTO precincts (precinct_id,name,ward,address,registered_voters,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        p
      );
    }

    console.log('[seed] inserting poll_workers...');
    const pollWorkers = [
      ['PW-1001', 'Maria Hernandez',  'chief_judge',    'PCT-001', 'es', 'active'],
      ['PW-1002', 'James Chen',       'clerk',          'PCT-001', 'zh', 'active'],
      ['PW-1003', 'Aisha Patel',      'greeter',        'PCT-002', 'hi', 'active'],
      ['PW-1004', 'David Kim',        'tech_support',   'PCT-003', 'ko', 'active'],
      ['PW-1005', 'Linda Brooks',     'ballot_judge',   'PCT-003', 'en', 'active'],
      ['PW-1006', 'Carlos Reyes',     'interpreter',    'PCT-004', 'es', 'active'],
      ['PW-1007', 'Sarah Johansson',  'clerk',          'PCT-005', 'en', 'no_show'],
      ['PW-1008', 'Marcus Thompson',  'chief_judge',    'PCT-006', 'en', 'active'],
      ['PW-1009', 'Yuki Tanaka',      'tech_support',   'PCT-007', 'ja', 'active'],
      ['PW-1010', 'Olivia Bennett',   'greeter',        'PCT-008', 'en', 'active'],
      ['PW-1011', 'Ahmed Hassan',     'interpreter',    'PCT-009', 'ar', 'active'],
      ['PW-1012', 'Priya Singh',      'clerk',          'PCT-010', 'hi', 'active'],
      ['PW-1013', 'Robert Whitaker',  'chief_judge',    'PCT-011', 'en', 'active'],
      ['PW-1014', 'Mei Lin',          'ballot_judge',   'PCT-013', 'zh', 'active'],
      ['PW-1015', 'Diego Morales',    'tech_support',   'PCT-015', 'es', 'training'],
    ];
    for (const p of pollWorkers) {
      await client.query(
        `INSERT INTO poll_workers (worker_id,name,role,precinct_id,language,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        p
      );
    }

    console.log('[seed] inserting equipment...');
    const equipment = [
      ['EQ-2001', 'ballot_scanner',     'BSN-A-0291', 'PCT-001', 'ready',        '2026-04-21'],
      ['EQ-2002', 'ballot_marking',     'BMD-B-1183', 'PCT-001', 'ready',        '2026-04-22'],
      ['EQ-2003', 'epollbook_tablet',   'EPB-C-4408', 'PCT-002', 'ready',        '2026-04-19'],
      ['EQ-2004', 'ballot_scanner',     'BSN-A-0292', 'PCT-003', 'ready',        '2026-04-20'],
      ['EQ-2005', 'ada_audio_unit',     'ADA-D-0033', 'PCT-003', 'ready',        '2026-04-15'],
      ['EQ-2006', 'epollbook_tablet',   'EPB-C-4409', 'PCT-004', 'needs_service', '2026-03-30'],
      ['EQ-2007', 'ballot_scanner',     'BSN-A-0293', 'PCT-005', 'ready',        '2026-04-23'],
      ['EQ-2008', 'ballot_marking',     'BMD-B-1184', 'PCT-006', 'ready',        '2026-04-12'],
      ['EQ-2009', 'epollbook_tablet',   'EPB-C-4410', 'PCT-007', 'ready',        '2026-04-25'],
      ['EQ-2010', 'ballot_scanner',     'BSN-A-0294', 'PCT-008', 'offline',      '2026-02-18'],
      ['EQ-2011', 'ada_audio_unit',     'ADA-D-0034', 'PCT-009', 'ready',        '2026-04-26'],
      ['EQ-2012', 'epollbook_tablet',   'EPB-C-4411', 'PCT-010', 'ready',        '2026-04-24'],
      ['EQ-2013', 'ballot_marking',     'BMD-B-1185', 'PCT-011', 'ready',        '2026-04-11'],
      ['EQ-2014', 'ballot_scanner',     'BSN-A-0295', 'PCT-013', 'needs_service', '2026-03-22'],
      ['EQ-2015', 'epollbook_tablet',   'EPB-C-4412', 'PCT-015', 'ready',        '2026-04-27'],
    ];
    for (const e of equipment) {
      await client.query(
        `INSERT INTO equipment (eq_id,type,sn,precinct_id,status,last_calibration) VALUES ($1,$2,$3,$4,$5,$6)`,
        e
      );
    }

    console.log('[seed] inserting ballots...');
    const ballots = [
      ['BAL-3001', 'PCT-001', 'in_person',  2200, 'election_day', 'allocated'],
      ['BAL-3002', 'PCT-001', 'absentee',    320, 'pre_election', 'received'],
      ['BAL-3003', 'PCT-002', 'in_person',  1900, 'election_day', 'allocated'],
      ['BAL-3004', 'PCT-003', 'in_person',  2600, 'election_day', 'allocated'],
      ['BAL-3005', 'PCT-003', 'provisional', 50,  'election_day', 'reserved'],
      ['BAL-3006', 'PCT-004', 'in_person',  3200, 'election_day', 'allocated'],
      ['BAL-3007', 'PCT-005', 'in_person',  1500, 'election_day', 'allocated'],
      ['BAL-3008', 'PCT-006', 'absentee',    410, 'pre_election', 'received'],
      ['BAL-3009', 'PCT-007', 'in_person',  1000, 'election_day', 'allocated'],
      ['BAL-3010', 'PCT-008', 'in_person',  2750, 'election_day', 'allocated'],
      ['BAL-3011', 'PCT-009', 'in_person',  3400, 'election_day', 'allocated'],
      ['BAL-3012', 'PCT-010', 'provisional', 30,  'election_day', 'reserved'],
      ['BAL-3013', 'PCT-011', 'in_person',  1450, 'election_day', 'allocated'],
      ['BAL-3014', 'PCT-013', 'in_person',  4200, 'election_day', 'allocated'],
      ['BAL-3015', 'PCT-015', 'absentee',    270, 'pre_election', 'received'],
    ];
    for (const b of ballots) {
      await client.query(
        `INSERT INTO ballots (ballot_id,precinct_id,type,count,period,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        b
      );
    }

    console.log('[seed] inserting chain_of_custody...');
    const custody = [
      ['COC-4001', 'Sealed ballot bag #A1','Warehouse Clerk','Chief Judge PCT-001','2026-05-16 06:30+00','Central Warehouse Bay 3'],
      ['COC-4002', 'Sealed ballot bag #A2','Warehouse Clerk','Chief Judge PCT-002','2026-05-16 06:35+00','Central Warehouse Bay 3'],
      ['COC-4003', 'Memory card lot #M-101','IT Custodian','Chief Judge PCT-003','2026-05-16 07:10+00','PCT-003 Tech Closet'],
      ['COC-4004', 'Sealed ballot bag #A4','Warehouse Clerk','Chief Judge PCT-004','2026-05-16 06:45+00','Central Warehouse Bay 4'],
      ['COC-4005', 'Provisional envelope kit','Election Office','Chief Judge PCT-003','2026-05-16 07:20+00','PCT-003 Reception'],
      ['COC-4006', 'Sealed ballot bag #A6','Warehouse Clerk','Chief Judge PCT-006','2026-05-16 06:50+00','Central Warehouse Bay 5'],
      ['COC-4007', 'EPollbook tablet EPB-C-4409','IT Custodian','Tech Support PCT-004','2026-05-16 07:00+00','PCT-004 Tech Closet'],
      ['COC-4008', 'Sealed ballot bag #A8','Warehouse Clerk','Chief Judge PCT-008','2026-05-16 06:55+00','Central Warehouse Bay 6'],
      ['COC-4009', 'Memory card lot #M-102','IT Custodian','Chief Judge PCT-009','2026-05-16 07:30+00','PCT-009 Tech Closet'],
      ['COC-4010', 'Sealed ballot bag #A10','Warehouse Clerk','Chief Judge PCT-010','2026-05-16 07:05+00','Central Warehouse Bay 7'],
      ['COC-4011', 'ADA audio unit ADA-D-0033','IT Custodian','Tech Support PCT-003','2026-05-16 07:15+00','PCT-003 Accessibility Booth'],
      ['COC-4012', 'Sealed ballot bag #A12','Warehouse Clerk','Chief Judge PCT-012','2026-05-16 07:25+00','Central Warehouse Bay 8'],
      ['COC-4013', 'Sealed ballot bag #A13','Warehouse Clerk','Chief Judge PCT-013','2026-05-16 06:25+00','Central Warehouse Bay 9'],
      ['COC-4014', 'Recount transport bag #R1','Chief Judge PCT-003','County Election Board','2026-05-17 09:10+00','County Board HQ'],
      ['COC-4015', 'Sealed ballot bag #A15','Warehouse Clerk','Chief Judge PCT-015','2026-05-16 07:40+00','Central Warehouse Bay 9'],
    ];
    for (const c of custody) {
      await client.query(
        `INSERT INTO chain_of_custody (custody_id,item,from_actor,to_actor,ts,location) VALUES ($1,$2,$3,$4,$5,$6)`,
        c
      );
    }

    console.log('[seed] inserting training_sessions...');
    const sessions = [
      ['TRN-5001', 'Chief judge orientation',          'County Trainer A. Reyes',  42, '2026-04-12', 'completed'],
      ['TRN-5002', 'ePollbook operation',              'IT Lead M. Owens',         58, '2026-04-15', 'completed'],
      ['TRN-5003', 'Ballot scanner troubleshooting',   'Vendor Rep K. Park',       36, '2026-04-18', 'completed'],
      ['TRN-5004', 'Accessibility (ADA) compliance',   'Accessibility Officer J.K.', 28, '2026-04-20', 'completed'],
      ['TRN-5005', 'De-escalation and voter rights',   'Civil Rights Trainer T.W.', 47, '2026-04-22', 'completed'],
      ['TRN-5006', 'Provisional ballot handling',      'Election Counsel P. Diaz', 33, '2026-04-25', 'completed'],
      ['TRN-5007', 'Chain of custody procedures',      'Security Lead R. Cho',     40, '2026-04-27', 'completed'],
      ['TRN-5008', 'Spanish language voter assistance','Interpreter Coord. M.H.',  22, '2026-04-29', 'completed'],
      ['TRN-5009', 'Mandarin language voter assistance','Interpreter Coord. M.H.',  15, '2026-05-01', 'completed'],
      ['TRN-5010', 'Drop box pickup procedures',       'Logistics Lead S. Mendez', 12, '2026-05-03', 'completed'],
      ['TRN-5011', 'Election night closeout',          'Chief Judge Cohort A',     55, '2026-05-06', 'scheduled'],
      ['TRN-5012', 'Cybersecurity awareness',          'IT Security Lead E. Park', 38, '2026-05-08', 'scheduled'],
      ['TRN-5013', 'Recount procedures',               'Election Counsel P. Diaz',  9, '2026-05-10', 'scheduled'],
      ['TRN-5014', 'Observer relations',               'Election Director K. Webb', 20, '2026-05-12', 'scheduled'],
      ['TRN-5015', 'Final dry run / mock election',    'County Trainer A. Reyes',  60, '2026-05-14', 'scheduled'],
    ];
    for (const s of sessions) {
      await client.query(
        `INSERT INTO training_sessions (session_id,topic,instructor,attendees_count,date,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        s
      );
    }

    console.log('[seed] inserting voter_lines...');
    const lines = [
      ['VL-6001', 'PCT-001', '2026-05-17 07:30+00',  8,  22, 'normal'],
      ['VL-6002', 'PCT-001', '2026-05-17 12:00+00', 24,  68, 'busy'],
      ['VL-6003', 'PCT-002', '2026-05-17 08:00+00',  5,  14, 'normal'],
      ['VL-6004', 'PCT-003', '2026-05-17 09:00+00', 18,  52, 'busy'],
      ['VL-6005', 'PCT-003', '2026-05-17 17:30+00', 42, 110, 'long_wait'],
      ['VL-6006', 'PCT-004', '2026-05-17 10:00+00', 14,  44, 'normal'],
      ['VL-6007', 'PCT-005', '2026-05-17 11:15+00',  6,  18, 'normal'],
      ['VL-6008', 'PCT-006', '2026-05-17 13:30+00', 21,  60, 'busy'],
      ['VL-6009', 'PCT-007', '2026-05-17 14:00+00',  3,   9, 'normal'],
      ['VL-6010', 'PCT-008', '2026-05-17 16:00+00', 33,  88, 'long_wait'],
      ['VL-6011', 'PCT-009', '2026-05-17 18:00+00', 47, 122, 'long_wait'],
      ['VL-6012', 'PCT-010', '2026-05-17 09:45+00',  4,  11, 'normal'],
      ['VL-6013', 'PCT-011', '2026-05-17 15:00+00', 12,  35, 'normal'],
      ['VL-6014', 'PCT-013', '2026-05-17 19:00+00', 55, 140, 'long_wait'],
      ['VL-6015', 'PCT-015', '2026-05-17 08:30+00',  7,  20, 'normal'],
    ];
    for (const v of lines) {
      await client.query(
        `INSERT INTO voter_lines (line_id,precinct_id,ts,wait_minutes,queue_length,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        v
      );
    }

    console.log('[seed] inserting incident_reports...');
    const incidents = [
      ['INC-7001', 'PCT-001', 'equipment_malfunction', 'medium',  '2026-05-17 09:12+00', 'resolved'],
      ['INC-7002', 'PCT-003', 'voter_intimidation',    'high',    '2026-05-17 10:42+00', 'investigating'],
      ['INC-7003', 'PCT-004', 'epollbook_offline',     'high',    '2026-05-17 08:05+00', 'resolved'],
      ['INC-7004', 'PCT-006', 'long_wait_complaint',   'low',     '2026-05-17 13:35+00', 'open'],
      ['INC-7005', 'PCT-008', 'scanner_jam',           'medium',  '2026-05-17 11:18+00', 'resolved'],
      ['INC-7006', 'PCT-009', 'language_assistance_needed','low', '2026-05-17 12:05+00', 'resolved'],
      ['INC-7007', 'PCT-010', 'ballot_provisional_dispute','medium','2026-05-17 14:20+00','open'],
      ['INC-7008', 'PCT-011', 'staffing_shortage',     'high',    '2026-05-17 07:05+00', 'mitigated'],
      ['INC-7009', 'PCT-013', 'parking_overflow',      'low',     '2026-05-17 16:10+00', 'open'],
      ['INC-7010', 'PCT-014', 'power_outage',          'critical','2026-05-17 09:55+00', 'mitigated'],
      ['INC-7011', 'PCT-002', 'signage_missing',       'low',     '2026-05-17 07:45+00', 'resolved'],
      ['INC-7012', 'PCT-005', 'accessibility_barrier', 'high',    '2026-05-17 10:20+00', 'investigating'],
      ['INC-7013', 'PCT-007', 'observer_dispute',      'medium',  '2026-05-17 11:55+00', 'open'],
      ['INC-7014', 'PCT-015', 'media_inquiry',         'low',     '2026-05-17 12:30+00', 'resolved'],
      ['INC-7015', 'PCT-012', 'voter_registration_dispute','medium','2026-05-17 13:00+00','investigating'],
    ];
    for (const i of incidents) {
      await client.query(
        `INSERT INTO incident_reports (incident_id,precinct_id,type,severity,opened_at,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        i
      );
    }

    console.log('[seed] inserting election_judges...');
    const judges = [
      ['JDG-8001', 'Maria Hernandez',  'PCT-001', 'D', 'EJ-CERT, ADA, BiL-ES', 'active'],
      ['JDG-8002', 'Robert Whitaker',  'PCT-011', 'R', 'EJ-CERT, ADA',         'active'],
      ['JDG-8003', 'Marcus Thompson',  'PCT-006', 'D', 'EJ-CERT',               'active'],
      ['JDG-8004', 'Linda Brooks',     'PCT-003', 'R', 'EJ-CERT, ADA',          'active'],
      ['JDG-8005', 'Olivia Bennett',   'PCT-008', 'I', 'EJ-CERT',               'active'],
      ['JDG-8006', 'Diego Morales',    'PCT-015', 'D', 'EJ-CERT, BiL-ES',       'training'],
      ['JDG-8007', 'Mei Lin',          'PCT-013', 'R', 'EJ-CERT, BiL-ZH',       'active'],
      ['JDG-8008', 'Ahmed Hassan',     'PCT-009', 'D', 'EJ-CERT, BiL-AR',       'active'],
      ['JDG-8009', 'Priya Singh',      'PCT-010', 'I', 'EJ-CERT, BiL-HI',       'active'],
      ['JDG-8010', 'Carlos Reyes',     'PCT-004', 'D', 'EJ-CERT, BiL-ES',       'active'],
      ['JDG-8011', 'James Chen',       'PCT-001', 'R', 'EJ-CERT, BiL-ZH',       'active'],
      ['JDG-8012', 'Aisha Patel',      'PCT-002', 'D', 'EJ-CERT, BiL-HI',       'active'],
      ['JDG-8013', 'David Kim',        'PCT-003', 'R', 'EJ-CERT, BiL-KO',       'active'],
      ['JDG-8014', 'Yuki Tanaka',      'PCT-007', 'I', 'EJ-CERT, BiL-JA',       'active'],
      ['JDG-8015', 'Sarah Johansson',  'PCT-005', 'D', 'EJ-CERT, ADA',          'inactive'],
    ];
    for (const j of judges) {
      await client.query(
        `INSERT INTO election_judges (judge_id,name,precinct_id,party_affiliation,certifications,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        j
      );
    }

    console.log('[seed] inserting recounts...');
    const recounts = [
      ['RC-9001', 'Mayor — City of Springfield',           'PCT-003', 'in_progress', '2026-05-18 08:00+00', null],
      ['RC-9002', 'Council District 2',                    'PCT-004', 'requested',   null,                  null],
      ['RC-9003', 'School Board At-Large',                 'PCT-001', 'in_progress', '2026-05-18 09:00+00', null],
      ['RC-9004', 'County Sheriff',                        'PCT-006', 'completed',   '2026-05-18 08:30+00', '2026-05-18 16:00+00'],
      ['RC-9005', 'Ballot Measure 1 (Library Funding)',    'PCT-009', 'requested',   null,                  null],
      ['RC-9006', 'Council District 4',                    'PCT-008', 'completed',   '2026-05-18 09:30+00', '2026-05-18 15:30+00'],
      ['RC-9007', 'Mayor — City of Springfield',           'PCT-002', 'in_progress', '2026-05-18 10:00+00', null],
      ['RC-9008', 'Ballot Measure 2 (Transit Bond)',       'PCT-013', 'requested',   null,                  null],
      ['RC-9009', 'Park District Commissioner',            'PCT-005', 'completed',   '2026-05-18 10:30+00', '2026-05-18 14:00+00'],
      ['RC-9010', 'Council District 7',                    'PCT-013', 'in_progress', '2026-05-18 11:00+00', null],
      ['RC-9011', 'School Board District 3',               'PCT-010', 'requested',   null,                  null],
      ['RC-9012', 'Mayor — City of Springfield',           'PCT-015', 'in_progress', '2026-05-18 11:30+00', null],
      ['RC-9013', 'Council District 6',                    'PCT-011', 'completed',   '2026-05-18 12:00+00', '2026-05-18 15:00+00'],
      ['RC-9014', 'Ballot Measure 3 (Sales Tax)',          'PCT-007', 'requested',   null,                  null],
      ['RC-9015', 'County Auditor',                        'PCT-014', 'in_progress', '2026-05-18 12:30+00', null],
    ];
    for (const r of recounts) {
      await client.query(
        `INSERT INTO recounts (recount_id,race,precinct_id,status,started_at,ended_at) VALUES ($1,$2,$3,$4,$5,$6)`,
        r
      );
    }

    console.log('[seed] inserting observers...');
    const observers = [
      ['OBS-1101', 'Helen Park',     'League of Women Voters',      'PCT-001', '2026-05-10 09:00+00', 'accredited'],
      ['OBS-1102', 'Mark Rivera',    'Democratic Party',            'PCT-001', '2026-05-10 09:05+00', 'accredited'],
      ['OBS-1103', 'Lisa Chen',      'Republican Party',            'PCT-003', '2026-05-10 09:10+00', 'accredited'],
      ['OBS-1104', 'Joseph Adeyemi', 'NAACP',                       'PCT-003', '2026-05-10 09:15+00', 'accredited'],
      ['OBS-1105', 'Anna Petrova',   'Independent Voter Group',     'PCT-004', '2026-05-10 09:20+00', 'accredited'],
      ['OBS-1106', 'Ryan O’Connor', 'Press — Springfield Tribune', 'PCT-006','2026-05-10 09:25+00', 'press_pass'],
      ['OBS-1107', 'Fatima Khan',    'ACLU',                        'PCT-008', '2026-05-10 09:30+00', 'accredited'],
      ['OBS-1108', 'Bruce Walker',   'Libertarian Party',           'PCT-009', '2026-05-10 09:35+00', 'accredited'],
      ['OBS-1109', 'Grace Pham',     'Asian Americans Advancing Justice','PCT-010','2026-05-10 09:40+00','accredited'],
      ['OBS-1110', 'Manuel Soto',    'NALEO Educational Fund',      'PCT-013', '2026-05-10 09:45+00', 'accredited'],
      ['OBS-1111', 'Cynthia Hill',   'Independent',                 'PCT-011', '2026-05-10 09:50+00', 'pending'],
      ['OBS-1112', 'Kenji Watanabe', 'Press — Daily Sun',           'PCT-007', '2026-05-10 09:55+00', 'press_pass'],
      ['OBS-1113', 'Tara Holloway',  'Common Cause',                'PCT-015', '2026-05-10 10:00+00', 'accredited'],
      ['OBS-1114', 'Eric Becker',    'Election Integrity Network',  'PCT-014', '2026-05-10 10:05+00', 'accredited'],
      ['OBS-1115', 'Sofia Marquez',  'Mi Familia Vota',             'PCT-005', '2026-05-10 10:10+00', 'accredited'],
    ];
    for (const o of observers) {
      await client.query(
        `INSERT INTO observers (observer_id,name,org,precinct_id,accredited_at,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        o
      );
    }

    console.log('[seed] inserting supplies...');
    const supplies = [
      ['SUP-1201', 'Pens (blue/black)',          5400, 'Central Warehouse',   2000, 'ok'],
      ['SUP-1202', '"I Voted" stickers',        18000, 'Central Warehouse',   8000, 'ok'],
      ['SUP-1203', 'Privacy sleeves',            6200, 'Central Warehouse',   3000, 'ok'],
      ['SUP-1204', 'Provisional envelopes',      1200, 'Central Warehouse',    400, 'low'],
      ['SUP-1205', 'Signage kits (precinct)',      32, 'Central Warehouse',     12, 'ok'],
      ['SUP-1206', 'Tamper-evident seals',       2400, 'Central Warehouse',    800, 'ok'],
      ['SUP-1207', 'Extension cords (50ft)',       48, 'Central Warehouse',     20, 'ok'],
      ['SUP-1208', 'Power strips',                 60, 'Central Warehouse',     25, 'ok'],
      ['SUP-1209', 'ADA magnifying sheets',       180, 'Central Warehouse',     80, 'low'],
      ['SUP-1210', 'Spanish voter instruction cards',900,'Central Warehouse',  400, 'ok'],
      ['SUP-1211', 'Mandarin voter instruction cards',420,'Central Warehouse', 200, 'ok'],
      ['SUP-1212', 'Hand sanitizer bottles',      240, 'Central Warehouse',    100, 'ok'],
      ['SUP-1213', 'Trash bags (heavy)',         1200, 'Central Warehouse',    500, 'ok'],
      ['SUP-1214', 'Toner cartridges (HP M404)',   22, 'Central Warehouse',     10, 'low'],
      ['SUP-1215', 'Battery packs (UPS, 12V)',     38, 'Central Warehouse',     15, 'ok'],
    ];
    for (const s of supplies) {
      await client.query(
        `INSERT INTO supplies (supply_id,item,qty,location,reorder_point,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        s
      );
    }

    console.log('[seed] inserting vehicles...');
    const vehicles = [
      ['VEH-1301', 'cargo_van',  'EL-VAN-01', 'full',     'Central Warehouse',  'available'],
      ['VEH-1302', 'cargo_van',  'EL-VAN-02', 'full',     'Central Warehouse',  'available'],
      ['VEH-1303', 'cargo_van',  'EL-VAN-03', '3/4',      'In transit — PCT-003','en_route'],
      ['VEH-1304', 'panel_truck','EL-TRK-01', 'full',     'Central Warehouse',  'available'],
      ['VEH-1305', 'panel_truck','EL-TRK-02', '1/2',      'PCT-009',            'on_site'],
      ['VEH-1306', 'sedan',      'EL-SED-01', 'full',     'County Election HQ', 'available'],
      ['VEH-1307', 'sedan',      'EL-SED-02', '1/4',      'In transit — PCT-013','en_route'],
      ['VEH-1308', 'minivan',    'EL-MIN-01', 'full',     'County Election HQ', 'available'],
      ['VEH-1309', 'minivan',    'EL-MIN-02', 'full',     'County Election HQ', 'maintenance'],
      ['VEH-1310', 'cargo_van',  'EL-VAN-04', 'full',     'Central Warehouse',  'available'],
      ['VEH-1311', 'cargo_van',  'EL-VAN-05', '1/2',      'PCT-001',            'on_site'],
      ['VEH-1312', 'panel_truck','EL-TRK-03', 'full',     'Central Warehouse',  'available'],
      ['VEH-1313', 'sedan',      'EL-SED-03', 'full',     'County Election HQ', 'available'],
      ['VEH-1314', 'cargo_van',  'EL-VAN-06', '1/4',      'PCT-015',            'on_site'],
      ['VEH-1315', 'minivan',    'EL-MIN-03', 'full',     'County Election HQ', 'available'],
    ];
    for (const v of vehicles) {
      await client.query(
        `INSERT INTO vehicles (vehicle_id,type,plate,fuel_status,location,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        v
      );
    }

    console.log('[seed] inserting ballot_drop_boxes...');
    const boxes = [
      ['DBX-1401', 'City Hall Plaza',                3000, '2026-05-16 18:00+00', 'operational', 'Helen Park'],
      ['DBX-1402', 'Main Public Library',            2500, '2026-05-16 18:30+00', 'operational', 'Lisa Chen'],
      ['DBX-1403', 'Springfield University Campus',  2200, '2026-05-16 19:00+00', 'operational', 'Anna Petrova'],
      ['DBX-1404', 'Westside Recreation Center',     1800, '2026-05-16 19:30+00', 'operational', 'Joseph Adeyemi'],
      ['DBX-1405', 'North Mall Parking Lot',         1500, '2026-05-16 20:00+00', 'operational', 'Fatima Khan'],
      ['DBX-1406', 'South Hospital Entrance',        1500, '2026-05-16 20:30+00', 'operational', 'Bruce Walker'],
      ['DBX-1407', 'East Side Senior Center',        1200, '2026-05-16 21:00+00', 'operational', 'Grace Pham'],
      ['DBX-1408', 'West Side Senior Center',        1200, '2026-05-16 21:30+00', 'operational', 'Manuel Soto'],
      ['DBX-1409', 'Downtown Transit Hub',           2800, '2026-05-16 22:00+00', 'operational', 'Tara Holloway'],
      ['DBX-1410', 'Riverside Community Center',     2000, '2026-05-16 22:30+00', 'operational', 'Eric Becker'],
      ['DBX-1411', 'Highland Park Pavilion',         1400, '2026-05-16 23:00+00', 'operational', 'Sofia Marquez'],
      ['DBX-1412', 'Greenwood Branch Library',       1600, '2026-05-16 23:30+00', 'operational', 'Cynthia Hill'],
      ['DBX-1413', 'Industrial Park Gate 4',         1100, '2026-05-17 00:00+00', 'maintenance', 'Mark Rivera'],
      ['DBX-1414', 'Airport Long-Term Lot',          1800, '2026-05-17 00:30+00', 'operational', 'Kenji Watanabe'],
      ['DBX-1415', 'County Fairgrounds',             2400, '2026-05-17 01:00+00', 'operational', 'Helen Park'],
    ];
    for (const b of boxes) {
      await client.query(
        `INSERT INTO ballot_drop_boxes (box_id,location,capacity,last_emptied,status,observer) VALUES ($1,$2,$3,$4,$5,$6)`,
        b
      );
    }

    console.log('[seed] inserting accessibility_audits...');
    const audits = [
      ['ADA-1501', 'PCT-001', 'Joan Karlsson', 92, '2026-05-12 10:00+00', 'Ramp gradient compliant; one entry sign too high.'],
      ['ADA-1502', 'PCT-002', 'Joan Karlsson', 88, '2026-05-12 11:30+00', 'Voting booth aisle clear; lighting acceptable.'],
      ['ADA-1503', 'PCT-003', 'Marcus Diallo', 75, '2026-05-12 13:00+00', 'Curb cut missing on south entrance; ADA unit ready.'],
      ['ADA-1504', 'PCT-004', 'Marcus Diallo', 81, '2026-05-12 14:30+00', 'Wheelchair access ok; restroom door pressure too high.'],
      ['ADA-1505', 'PCT-005', 'Joan Karlsson', 60, '2026-05-13 09:00+00', 'Narrow entrance; ADA voting booth blocked by storage.'],
      ['ADA-1506', 'PCT-006', 'Marcus Diallo', 90, '2026-05-13 10:30+00', 'Excellent signage; large-print materials present.'],
      ['ADA-1507', 'PCT-007', 'Joan Karlsson', 78, '2026-05-13 12:00+00', 'Audio booth functional; missing tactile signage.'],
      ['ADA-1508', 'PCT-008', 'Marcus Diallo', 85, '2026-05-13 13:30+00', 'Path of travel ok; parking ADA spots insufficient.'],
      ['ADA-1509', 'PCT-009', 'Joan Karlsson', 70, '2026-05-13 15:00+00', 'Heavy entry door; needs auto-opener temporary install.'],
      ['ADA-1510', 'PCT-010', 'Marcus Diallo', 95, '2026-05-14 09:30+00', 'Fully compliant; bilingual signage and ADA booth.'],
      ['ADA-1511', 'PCT-011', 'Joan Karlsson', 66, '2026-05-14 10:30+00', 'Cracked walkway; observed trip hazard at entry.'],
      ['ADA-1512', 'PCT-012', 'Marcus Diallo', 84, '2026-05-14 11:30+00', 'Mostly compliant; one booth not accessible angle.'],
      ['ADA-1513', 'PCT-013', 'Joan Karlsson', 80, '2026-05-14 13:00+00', 'Large facility; ADA route signage needs improvement.'],
      ['ADA-1514', 'PCT-014', 'Marcus Diallo', 55, '2026-05-14 14:30+00', 'Multiple ADA gaps; mitigation plan required.'],
      ['ADA-1515', 'PCT-015', 'Joan Karlsson', 87, '2026-05-14 16:00+00', 'ADA booth ready; ramp railing slightly loose.'],
    ];
    for (const a of audits) {
      await client.query(
        `INSERT INTO accessibility_audits (audit_id,precinct_id,auditor,score,conducted_at,findings) VALUES ($1,$2,$3,$4,$5,$6)`,
        a
      );
    }

    console.log('[seed] inserting language_support...');
    const lang = [
      ['LNG-1601', 'PCT-001', 'es',  3, 250, 'staffed'],
      ['LNG-1602', 'PCT-001', 'zh',  2, 180, 'staffed'],
      ['LNG-1603', 'PCT-002', 'hi',  2, 120, 'staffed'],
      ['LNG-1604', 'PCT-003', 'ko',  1,  90, 'staffed'],
      ['LNG-1605', 'PCT-003', 'es',  2, 200, 'staffed'],
      ['LNG-1606', 'PCT-004', 'es',  2, 220, 'staffed'],
      ['LNG-1607', 'PCT-006', 'vi',  1, 100, 'planned'],
      ['LNG-1608', 'PCT-007', 'ja',  1,  60, 'staffed'],
      ['LNG-1609', 'PCT-008', 'tl',  1,  80, 'planned'],
      ['LNG-1610', 'PCT-009', 'ar',  2, 140, 'staffed'],
      ['LNG-1611', 'PCT-010', 'hi',  1, 110, 'staffed'],
      ['LNG-1612', 'PCT-011', 'pl',  1,  50, 'planned'],
      ['LNG-1613', 'PCT-013', 'zh',  3, 240, 'staffed'],
      ['LNG-1614', 'PCT-014', 'ru',  1,  70, 'planned'],
      ['LNG-1615', 'PCT-015', 'es',  2, 200, 'staffed'],
    ];
    for (const l of lang) {
      await client.query(
        `INSERT INTO language_support (support_id,precinct_id,language,interpreter_count,materials_count,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        l
      );
    }

    console.log('[seed] inserting audit_log...');
    const auditLog = [
      ['ALG-1701', 'admin@election.io',  'precinct PCT-001',  'OPEN_PRECINCT',     'success', '2026-05-17 06:00+00'],
      ['ALG-1702', 'admin@election.io',  'equipment EQ-2001', 'POWER_ON',          'success', '2026-05-17 06:05+00'],
      ['ALG-1703', 'judge@election.io',  'ballot BAL-3001',   'SEAL_VERIFY',       'success', '2026-05-17 06:10+00'],
      ['ALG-1704', 'judge@election.io',  'epollbook EPB-C-4409','SYNC',            'failure', '2026-05-17 07:55+00'],
      ['ALG-1705', 'admin@election.io',  'incident INC-7003', 'INCIDENT_OPEN',     'success', '2026-05-17 08:05+00'],
      ['ALG-1706', 'judge@election.io',  'epollbook EPB-C-4409','RESTART',         'success', '2026-05-17 08:10+00'],
      ['ALG-1707', 'admin@election.io',  'precinct PCT-011',  'STAFFING_ALERT',    'success', '2026-05-17 07:05+00'],
      ['ALG-1708', 'viewer@election.io', 'dashboard',         'VIEW',              'success', '2026-05-17 09:00+00'],
      ['ALG-1709', 'admin@election.io',  'ballot BAL-3005',   'PROVISIONAL_ISSUE', 'success', '2026-05-17 10:30+00'],
      ['ALG-1710', 'judge@election.io',  'observer OBS-1103', 'OBSERVER_CHECKIN',  'success', '2026-05-17 09:25+00'],
      ['ALG-1711', 'admin@election.io',  'recount RC-9001',   'RECOUNT_START',     'success', '2026-05-18 08:00+00'],
      ['ALG-1712', 'admin@election.io',  'transmission TX-1801','TX_SEND',         'success', '2026-05-17 20:30+00'],
      ['ALG-1713', 'admin@election.io',  'transmission TX-1804','TX_SEND',         'failure', '2026-05-17 20:45+00'],
      ['ALG-1714', 'admin@election.io',  'precinct PCT-001',  'CLOSE_PRECINCT',    'success', '2026-05-17 20:15+00'],
      ['ALG-1715', 'judge@election.io',  'ballot bag #A1',    'CUSTODY_TRANSFER',  'success', '2026-05-17 21:00+00'],
    ];
    for (const a of auditLog) {
      await client.query(
        `INSERT INTO audit_log (entry_id,actor,target,action,result,ts) VALUES ($1,$2,$3,$4,$5,$6)`,
        a
      );
    }

    console.log('[seed] inserting transmissions...');
    const tx = [
      ['TX-1801', 'PCT-001', 'unofficial_results', '2026-05-17 20:30+00', 'sent',  'County Election Board'],
      ['TX-1802', 'PCT-002', 'unofficial_results', '2026-05-17 20:32+00', 'sent',  'County Election Board'],
      ['TX-1803', 'PCT-003', 'unofficial_results', '2026-05-17 20:40+00', 'sent',  'County Election Board'],
      ['TX-1804', 'PCT-004', 'unofficial_results', '2026-05-17 20:45+00', 'failed','County Election Board'],
      ['TX-1805', 'PCT-005', 'unofficial_results', '2026-05-17 20:50+00', 'sent',  'County Election Board'],
      ['TX-1806', 'PCT-006', 'unofficial_results', '2026-05-17 20:55+00', 'sent',  'County Election Board'],
      ['TX-1807', 'PCT-007', 'unofficial_results', '2026-05-17 21:00+00', 'sent',  'County Election Board'],
      ['TX-1808', 'PCT-008', 'unofficial_results', '2026-05-17 21:05+00', 'sent',  'County Election Board'],
      ['TX-1809', 'PCT-009', 'unofficial_results', '2026-05-17 21:10+00', 'pending','County Election Board'],
      ['TX-1810', 'PCT-010', 'unofficial_results', '2026-05-17 21:15+00', 'sent',  'County Election Board'],
      ['TX-1811', 'PCT-011', 'audit_log_batch',    '2026-05-17 21:30+00', 'sent',  'State Board of Elections'],
      ['TX-1812', 'PCT-013', 'incident_summary',   '2026-05-17 21:35+00', 'sent',  'State Board of Elections'],
      ['TX-1813', 'PCT-014', 'incident_summary',   '2026-05-17 21:40+00', 'failed','State Board of Elections'],
      ['TX-1814', 'PCT-015', 'unofficial_results', '2026-05-17 21:45+00', 'sent',  'County Election Board'],
      ['TX-1815', 'PCT-001', 'turnout_snapshot',   '2026-05-17 12:00+00', 'sent',  'Public Dashboard'],
    ];
    for (const t of tx) {
      await client.query(
        `INSERT INTO transmissions (tx_id,precinct_id,type,sent_at,status,recipient) VALUES ($1,$2,$3,$4,$5,$6)`,
        t
      );
    }

    // ─────────────────────────────────────────────
    // RBAC users (3)
    // ─────────────────────────────────────────────
    console.log('[seed] inserting users...');
    const users = [
      ['admin@election.io',  'admin123',  'Election Admin', 'admin'],
      ['judge@election.io',  'judge123',  'Chief Judge',    'judge'],
      ['viewer@election.io', 'viewer123', 'Viewer',         'viewer'],
    ];
    for (const u of users) {
      await client.query(
        `INSERT INTO users (email,password,name,role) VALUES ($1,$2,$3,$4)`,
        u
      );
    }

    console.log('[seed] inserting notifications...');
    const notifications = [
      [1, 'Critical incident at PCT-014',  'Power outage at Arthur Community Church — generator dispatched', 'critical', 'incident_reports'],
      [1, 'Staffing shortage PCT-011',     'Garfield VFW Post 12 needs 2 additional poll workers',           'high',     'incident_reports'],
      [1, 'Recount started for Mayor race','Recount RC-9001 in progress at PCT-003',                          'high',     'recounts'],
      [2, 'Long wait detected PCT-009',    'Voter line at PCT-009 exceeded 45 min',                           'medium',   'voter_lines'],
      [2, 'Transmission failure PCT-004',  'Unofficial results transmission to county board failed',          'high',     'transmissions'],
    ];
    for (const n of notifications) {
      await client.query(
        `INSERT INTO notifications (user_id,title,body,severity,source) VALUES ($1,$2,$3,$4,$5)`,
        n
      );
    }

    console.log('[seed] inserting webhooks...');
    const webhooks = [
      ['County Board Notifier', 'https://httpbin.org/post', 'sec_county_2026', 'incident.created,recount.started,transmission.failed', true],
      ['State Election Bridge', 'https://httpbin.org/post', 'sec_state_2026',  'incident.created,recount.completed',                   true],
    ];
    for (const w of webhooks) {
      await client.query(
        `INSERT INTO webhooks (name,url,secret,events,active) VALUES ($1,$2,$3,$4,$5)`,
        w
      );
    }

    console.log('[seed] complete.');
  } catch (e) {
    console.error('[seed] error:', e);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run();
