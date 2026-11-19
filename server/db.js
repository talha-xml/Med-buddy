const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'medical.db');
const db = new Database(dbPath);

// Enable WAL mode for high performance & safe concurrent reads
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// 1. Create Users Table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    fullName TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('patient', 'doctor')),
    specialty TEXT,
    yearsOfExperience INTEGER DEFAULT 0,
    experienceDomain TEXT,
    phone TEXT,
    clinicAddress TEXT,
    bio TEXT,
    age INTEGER,
    dateOfBirth TEXT,
    bloodGroup TEXT,
    allergies TEXT,
    emergencyContact TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Migration helper: add new columns if table already exists without them
const tableInfo = db.prepare('PRAGMA table_info(users)').all();
const columnNames = tableInfo.map((c) => c.name);

if (!columnNames.includes('yearsOfExperience')) {
  db.exec('ALTER TABLE users ADD COLUMN yearsOfExperience INTEGER DEFAULT 0');
}
if (!columnNames.includes('experienceDomain')) {
  db.exec('ALTER TABLE users ADD COLUMN experienceDomain TEXT');
}
if (!columnNames.includes('age')) {
  db.exec('ALTER TABLE users ADD COLUMN age INTEGER');
}
if (!columnNames.includes('city')) {
  db.exec('ALTER TABLE users ADD COLUMN city TEXT');
}
if (!columnNames.includes('country')) {
  db.exec('ALTER TABLE users ADD COLUMN country TEXT');
}
if (!columnNames.includes('isVerified')) {
  db.exec('ALTER TABLE users ADD COLUMN isVerified INTEGER DEFAULT 0');
}
if (!columnNames.includes('isEnabled')) {
  db.exec('ALTER TABLE users ADD COLUMN isEnabled INTEGER DEFAULT 1');
}
if (!columnNames.includes('availableFrom')) {
  db.exec("ALTER TABLE users ADD COLUMN availableFrom TEXT DEFAULT '09:00 AM'");
}
if (!columnNames.includes('availableTo')) {
  db.exec("ALTER TABLE users ADD COLUMN availableTo TEXT DEFAULT '05:00 PM'");
}

// 2. Create Appointments Table
db.exec(`
  CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    patientId TEXT NOT NULL,
    patientName TEXT NOT NULL,
    doctorId TEXT NOT NULL,
    doctorName TEXT NOT NULL,
    specialty TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'Confirmed', 'Completed', 'Cancelled')),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patientId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctorId) REFERENCES users(id) ON DELETE CASCADE
  )
`);

// 3. Create Notifications Table
db.exec(`
  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'appointment',
    appointmentId TEXT,
    isRead INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  )
`);

// 3. Seed Initial Demo Records if empty
const countUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;

if (countUsers === 0) {
  console.log('Seeding initial SQLite database with demo medical accounts...');

  const insertUser = db.prepare(`
    INSERT INTO users (id, fullName, email, password, role, specialty, yearsOfExperience, experienceDomain, phone, clinicAddress, bio, age, dateOfBirth, bloodGroup, allergies, emergencyContact)
    VALUES (@id, @fullName, @email, @password, @role, @specialty, @yearsOfExperience, @experienceDomain, @phone, @clinicAddress, @bio, @age, @dateOfBirth, @bloodGroup, @allergies, @emergencyContact)
  `);

  const initialUsers = [
    {
      id: 'pat-1',
      fullName: 'Emily Watson',
      email: 'emily.watson@example.com',
      password: 'password123',
      role: 'patient',
      specialty: null,
      yearsOfExperience: 0,
      experienceDomain: null,
      phone: '+1 (555) 987-6543',
      clinicAddress: null,
      bio: null,
      age: 34,
      dateOfBirth: '1992-06-15',
      bloodGroup: 'O+',
      allergies: 'Penicillin',
      emergencyContact: 'David Watson (+1 555-876-5432)'
    },
    {
      id: 'pat-2',
      fullName: 'Robert Langdon',
      email: 'robert.langdon@example.com',
      password: 'password123',
      role: 'patient',
      specialty: null,
      yearsOfExperience: 0,
      experienceDomain: null,
      phone: '+1 (555) 321-4321',
      clinicAddress: null,
      bio: null,
      age: 41,
      dateOfBirth: '1985-04-12',
      bloodGroup: 'A+',
      allergies: 'None',
      emergencyContact: 'Sophia Langdon (+1 555-321-9999)'
    }
  ];

  const seedTransaction = db.transaction((users) => {
    for (const u of users) insertUser.run(u);
  });
  seedTransaction(initialUsers);

  console.log('SQLite initial database seed complete.');
} else {
  // Ensure default cities & countries for existing records if NULL
  db.prepare(`UPDATE users SET city = 'Lahore', country = 'Pakistan' WHERE id = 'pat-1' AND city IS NULL`).run();
  db.prepare(`UPDATE users SET city = 'Karachi', country = 'Pakistan' WHERE id = 'pat-2' AND city IS NULL`).run();
}

module.exports = db;
