const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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
      country,
      availableFrom,
      availableTo
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
        yearsOfExperience, experienceDomain, bio, phone, dateOfBirth, city, country,
        availableFrom, availableTo
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      country || null,
      availableFrom || (role === 'doctor' ? '09:00 AM' : null),
      availableTo || (role === 'doctor' ? '05:00 PM' : null)
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
      isEnabled,
      availableFrom,
      availableTo
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
          isEnabled = CASE WHEN ? IS NOT NULL THEN ? ELSE isEnabled END,
          availableFrom = COALESCE(?, availableFrom),
          availableTo = COALESCE(?, availableTo)
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
      availableFrom !== undefined ? availableFrom : null,
      availableTo !== undefined ? availableTo : null,
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
// Excludes disabled doctors so they are never visible to the general public or patients
app.get('/api/doctors', (req, res) => {
  try {
    const { city, specialty, search } = req.query;
    let query = `
      SELECT id, fullName, email, role, specialty, yearsOfExperience, experienceDomain, phone, clinicAddress, bio, city, country, isVerified, isEnabled
      FROM users
      WHERE role = 'doctor' AND (isEnabled IS NULL OR isEnabled != 0)
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

// APPOINTMENT ROUTES

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
    const { patientId, patientName, doctorId, doctorName, specialty, date, time, reason } =
      req.body;

    if (!patientId || !doctorId || !date || !time || !reason) {
      return res.status(400).json({ error: 'Missing required appointment details.' });
    }

    // Check if slot is already taken for this doctor on this date (active appointments: Pending or Confirmed)
    const existingConflict = db
      .prepare(
        `
      SELECT id, patientName, time FROM appointments
      WHERE doctorId = ? AND date = ? AND time = ? AND status IN ('Pending', 'Confirmed')
    `
      )
      .get(doctorId, date, time);

    if (existingConflict) {
      return res.status(409).json({
        error: 'This time slot is already filled. Please select a different time slot or date.'
      });
    }

    const id = `apt-${Date.now()}`;
    const status = 'Pending'; // Default status is Pending

    const insertStmt = db.prepare(`
      INSERT INTO appointments (id, patientId, patientName, doctorId, doctorName, specialty, date, time, reason, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run(
      id,
      patientId,
      patientName,
      doctorId,
      doctorName,
      specialty,
      date,
      time,
      reason,
      status
    );

    // Create Notification for the Doctor
    const notifId = `notif-${Date.now()}`;
    const notifMsg = `You have a new appointment request by ${patientName} at ${time}. Please confirm the request`;
    const notifStmt = db.prepare(`
      INSERT INTO notifications (id, userId, title, message, type, appointmentId, isRead)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `);
    notifStmt.run(
      notifId,
      doctorId,
      'New Appointment Request',
      notifMsg,
      'appointment_request',
      id
    );

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

    // Send notification to the respective patient
    let notifTitle = 'Appointment Update';
    let notifMsg = `Your appointment with Dr. ${updated.doctorName} for ${updated.date} (${updated.time}) has been marked as ${status}.`;

    if (status === 'Confirmed') {
      notifTitle = 'Appointment Approved';
      notifMsg = `Your appointment consultation with Dr. ${updated.doctorName} at ${updated.time} on ${updated.date} has been confirmed.`;
    } else if (status === 'Cancelled') {
      notifTitle = 'Appointment Declined / Cancelled';
      notifMsg = `Your appointment consultation with Dr. ${updated.doctorName} at ${updated.time} on ${updated.date} has been cancelled.`;
    } else if (status === 'Completed') {
      notifTitle = 'Consultation Completed';
      notifMsg = `Your consultation with Dr. ${updated.doctorName} has been marked as Completed.`;
    }

    const notifId = `notif-${Date.now()}`;
    const notifStmt = db.prepare(`
      INSERT INTO notifications (id, userId, title, message, type, appointmentId, isRead)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `);
    notifStmt.run(notifId, updated.patientId, notifTitle, notifMsg, 'appointment_status', id);

    res.json({ appointment: updated });
  } catch (err) {
    console.error('Update appointment status error:', err);
    res.status(500).json({ error: 'Server error updating status.' });
  }
});

// ==================== NOTIFICATIONS ROUTES ====================

// Get notifications for a user (most recent first)
app.get('/api/notifications', (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId query parameter is required.' });
    }

    const notifications = db
      .prepare('SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC')
      .all(userId);

    const unreadCount = db
      .prepare('SELECT COUNT(*) as count FROM notifications WHERE userId = ? AND isRead = 0')
      .get(userId).count;

    res.json({ notifications, unreadCount });
  } catch (err) {
    console.error('Fetch notifications error:', err);
    res.status(500).json({ error: 'Server error retrieving notifications.' });
  }
});

// Mark single notification as read
app.patch('/api/notifications/:id/read', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('UPDATE notifications SET isRead = 1 WHERE id = ?').run(id);
    const updated = db.prepare('SELECT * FROM notifications WHERE id = ?').get(id);
    res.json({ notification: updated });
  } catch (err) {
    console.error('Mark notification read error:', err);
    res.status(500).json({ error: 'Server error updating notification.' });
  }
});

// Mark all notifications as read for a user
app.patch('/api/notifications/read-all', (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required.' });
    }
    db.prepare('UPDATE notifications SET isRead = 1 WHERE userId = ?').run(userId);
    res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    console.error('Mark all read error:', err);
    res.status(500).json({ error: 'Server error marking all as read.' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`MedBuddy SQLite API server running on port ${PORT}`);
});
