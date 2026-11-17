const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ==================== AUTH ROUTES ====================

// Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password, and role are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(cleanEmail);

    if (!user) {
      return res.status(404).json({ error: 'No account found with this email address.' });
    }

    // Role check requested by user:
    if (user.role !== role) {
      if (user.role === 'patient' && role === 'doctor') {
        return res.status(403).json({ error: 'This email is registered for Patient' });
      } else if (user.role === 'doctor' && role === 'patient') {
        return res.status(403).json({ error: 'This email is registered for Doctor' });
      } else {
        return res.status(403).json({ error: `This email is registered as a ${user.role}.` });
      }
    }

    if (user.password !== password) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }

    // Doctor Verification & Disabled check in backend
    if (user.role === 'doctor') {
      if (user.isEnabled === 0) {
        return res.status(403).json({
          error:
            'Your account is disabled by the Admin for not verifying. Please contact the admin at admin@medbuddy.healthcare to enable ur account.',
          reason: 'disabled'
        });
      }
      if (user.isVerified === 0) {
        return res.status(403).json({
          error:
            'Your doctor credentials are not verified yet. Healthcare practitioners must be verified before accessing the portal.',
          reason: 'unverified',
          user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role }
        });
      }
    }

    // Omit password from response
    const { password: _, ...userSafe } = user;
    res.json({ user: userSafe });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// Register
app.post('/api/auth/register', (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      role,
      specialty,
      yearsOfExperience,
      experienceDomain,
      bio,
      phone,
      dateOfBirth,
      city,
      country
    } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing required registration fields.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(cleanEmail);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const id = `${role === 'doctor' ? 'doc' : 'pat'}-${Date.now()}`;
    const insertStmt = db.prepare(`
      INSERT INTO users (
        id, fullName, email, password, role, specialty,
        yearsOfExperience, experienceDomain, bio, phone, dateOfBirth, city, country
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run(
      id,
      fullName,
      cleanEmail,
      password,
      role,
      specialty || null,
      yearsOfExperience ? Number(yearsOfExperience) : 0,
      experienceDomain || null,
      bio || null,
      phone || null,
      dateOfBirth || null,
      city || null,
      country || null
    );

    const newUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    const { password: _, ...userSafe } = newUser;
    res.status(201).json({ user: userSafe });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// Get User Profile by ID (Public read-only profile for patients & doctors)
app.get('/api/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) {
      return res.status(404).json({ error: 'Profile not found.' });
    }
    const { password: _, ...userSafe } = user;
    res.json({ user: userSafe });
  } catch (err) {
    console.error('Fetch profile error:', err);
    res.status(500).json({ error: 'Server error retrieving profile.' });
  }
});

// Update Profile
app.put('/api/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const {
      fullName,
      phone,
      specialty,
      yearsOfExperience,
      experienceDomain,
      clinicAddress,
      bio,
      age,
      dateOfBirth,
      bloodGroup,
      allergies,
      emergencyContact,
      city,
      country,
      isVerified,
      isEnabled
    } = req.body;

    const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const updateStmt = db.prepare(`
      UPDATE users
      SET fullName = COALESCE(?, fullName),
          phone = COALESCE(?, phone),
          specialty = COALESCE(?, specialty),
          yearsOfExperience = COALESCE(?, yearsOfExperience),
          experienceDomain = COALESCE(?, experienceDomain),
          clinicAddress = COALESCE(?, clinicAddress),
          bio = COALESCE(?, bio),
          age = COALESCE(?, age),
          dateOfBirth = COALESCE(?, dateOfBirth),
          bloodGroup = COALESCE(?, bloodGroup),
          allergies = COALESCE(?, allergies),
          emergencyContact = COALESCE(?, emergencyContact),
          city = COALESCE(?, city),
          country = COALESCE(?, country),
          isVerified = CASE WHEN ? IS NOT NULL THEN ? ELSE isVerified END,
          isEnabled = CASE WHEN ? IS NOT NULL THEN ? ELSE isEnabled END
      WHERE id = ?
    `);

    updateStmt.run(
      fullName !== undefined ? fullName : null,
      phone !== undefined ? phone : null,
      specialty !== undefined ? specialty : null,
      yearsOfExperience !== undefined ? Number(yearsOfExperience) : null,
      experienceDomain !== undefined ? experienceDomain : null,
      clinicAddress !== undefined ? clinicAddress : null,
      bio !== undefined ? bio : null,
      age !== undefined ? Number(age) : null,
      dateOfBirth !== undefined ? dateOfBirth : null,
      bloodGroup !== undefined ? bloodGroup : null,
      allergies !== undefined ? allergies : null,
      emergencyContact !== undefined ? emergencyContact : null,
      city !== undefined ? city : null,
      country !== undefined ? country : null,
      isVerified !== undefined ? (isVerified ? 1 : 0) : null,
      isVerified !== undefined ? (isVerified ? 1 : 0) : null,
      isEnabled !== undefined ? (isEnabled ? 1 : 0) : null,
      isEnabled !== undefined ? (isEnabled ? 1 : 0) : null,
      id
    );

    const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    const { password: _, ...userSafe } = updated;
    res.json({ user: userSafe });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Server error updating profile.' });
  }
});

// Delete Account with Password Verification (Cascades & deletes user + appointments)
app.delete('/api/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required to confirm account deletion.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: 'Incorrect password. Account deletion aborted.' });
    }

    // Execute atomic deletion of appointments and user record
    const deleteTransaction = db.transaction(() => {
      db.prepare('DELETE FROM appointments WHERE patientId = ? OR doctorId = ?').run(id, id);
      db.prepare('DELETE FROM users WHERE id = ?').run(id);
    });

    deleteTransaction();

    res.json({ message: 'Account and all associated records deleted permanently from database.' });
  } catch (err) {
    console.error('Account deletion error:', err);
    res.status(500).json({ error: 'Server error while deleting account.' });
  }
});

// List Doctors (with optional search, city, and specialty filters)
app.get('/api/doctors', (req, res) => {
  try {
    const { city, specialty, search } = req.query;
    let query = `
      SELECT id, fullName, email, role, specialty, yearsOfExperience, experienceDomain, phone, clinicAddress, bio, city, country, isVerified, isEnabled
      FROM users
      WHERE role = 'doctor'
    `;
    const params = [];

    if (city && city.trim() !== '' && city.trim().toUpperCase() !== 'ALL') {
      query += ` AND LOWER(city) = LOWER(?)`;
      params.push(city.trim());
    }

    if (specialty && specialty.trim() !== '' && specialty.trim().toUpperCase() !== 'ALL') {
      query += ` AND LOWER(specialty) LIKE LOWER(?)`;
      params.push(`%${specialty.trim()}%`);
    }

    if (search && search.trim() !== '') {
      const s = `%${search.trim()}%`;
      query += ` AND (LOWER(fullName) LIKE LOWER(?) OR LOWER(city) LIKE LOWER(?) OR LOWER(specialty) LIKE LOWER(?) OR LOWER(experienceDomain) LIKE LOWER(?))`;
      params.push(s, s, s, s);
    }

    const doctors = db.prepare(query).all(...params);
    res.json({ doctors });
  } catch (err) {
    console.error('Fetch doctors error:', err);
    res.status(500).json({ error: 'Server error retrieving doctors.' });
  }
});

// ==================== APPOINTMENT ROUTES ====================

// Get Appointments (can filter by patientId or doctorId)
app.get('/api/appointments', (req, res) => {
  try {
    const { patientId, doctorId } = req.query;
    let query = 'SELECT * FROM appointments';
    const params = [];

    if (patientId) {
      query += ' WHERE patientId = ?';
      params.push(patientId);
    } else if (doctorId) {
      query += ' WHERE doctorId = ?';
      params.push(doctorId);
    }

    query += ' ORDER BY date ASC, time ASC';

    const appointments = db.prepare(query).all(...params);
    res.json({ appointments });
  } catch (err) {
    console.error('Fetch appointments error:', err);
    res.status(500).json({ error: 'Server error retrieving appointments.' });
  }
});

// Book Appointment (Defaults to Pending)
app.post('/api/appointments', (req, res) => {
  try {
    const { patientId, patientName, doctorId, doctorName, specialty, date, time, reason } = req.body;

    if (!patientId || !doctorId || !date || !time || !reason) {
      return res.status(400).json({ error: 'Missing required appointment details.' });
    }

    const id = `apt-${Date.now()}`;
    const status = 'Pending'; // Default status is Pending

    const insertStmt = db.prepare(`
      INSERT INTO appointments (id, patientId, patientName, doctorId, doctorName, specialty, date, time, reason, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run(id, patientId, patientName, doctorId, doctorName, specialty, date, time, reason, status);

    const newApt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);
    res.status(201).json({ appointment: newApt });
  } catch (err) {
    console.error('Book appointment error:', err);
    res.status(500).json({ error: 'Server error booking appointment.' });
  }
});

// Update Appointment Status (e.g. Confirmed, Completed, Cancelled)
app.patch('/api/appointments/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid appointment status.' });
    }

    const updateStmt = db.prepare('UPDATE appointments SET status = ? WHERE id = ?');
    const result = updateStmt.run(status, id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    const updated = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);
    res.json({ appointment: updated });
  } catch (err) {
    console.error('Update appointment status error:', err);
    res.status(500).json({ error: 'Server error updating status.' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`MedBuddy SQLite API server running on port ${PORT}`);
});
