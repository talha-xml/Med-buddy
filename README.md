# MedBuddy - Medical Appointment & Healthcare Scheduling System

**MedBuddy** (formerly SlotBuddy) is a modern, responsive full-stack medical appointment scheduling web application. It connects patients with verified medical practitioners across multiple cities and clinical specialties, offering frictionless online appointment booking, real-time consultation status tracking, doctor schedule management, centralized administrative governance, and credential verification workflows.

---

## Key Features

### Admin Portal (Manual URL Access Only: `/admin`, `/login/admin`, `/register/admin`)
- **Centralized Healthcare Governance**: Super administrator dashboard for overseeing all clinical and outpatient activity.
- **Demographic & City Metrics**: Real-time aggregated breakdown showing total registered patients and doctors by specific cities (Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta, etc.).
- **Doctor Verification Visibility**: Admins can inspect whether doctors are verified or pending verification. Verification is performed exclusively by the medical practitioners themselves via PMDC license input.
- **Selective Disable Access Control**: Admins can only disable doctors who are **unverified**. Once a doctor is verified, the "Disable Doctor" button is locked (`Cannot Disable (Verified)`).
- **Immediate Session Revocation**: If an unverified doctor is disabled by the admin while active, their session is immediately terminated and they are logged out in real-time.
- **Disabled Login Message**: Disabled doctors attempting to sign in receive:
  > *"Your account is disabled by the Admin for not verifying. Please contact the admin at admin@medbuddy.healthcare to enable ur account."*
- **Strict Route Isolation**:
  - Logged-in doctors and patients attempting to type `/admin` are bounced directly back to their active dashboard.
  - Logged-in administrators attempting to visit doctor or patient portals are bounced back to `/admin`.
- **Directory Rosters**: Interactive search, city filtering, and status filtering across all registered doctors and patients.

### Doctor / Healthcare Practitioner Portal
- **Default Unverified State**: All new doctor profiles are initialized as **Not Verified** by default.
- **Navbar "Account Status" Menu Option**: Placed directly above the *Sign Out* button in the profile dropdown, prompting doctors with a highlighted **"Please Verify"** status badge.
- **Self-Service PMDC Verification**: Doctors click *Account Status* to open the verification modal and submit their valid **PMDC-(5+ digit number)** credential (e.g. `PMDC-12345`).
- **Clinical Dashboard & Metrics**: At-a-glance overview of assigned patients, confirmed bookings, pending requests, and completed consultations.
- **Appointment Status Control**: Review pending patient requests and update consultation status (`Confirmed`, `Completed`, `Cancelled`).
- **Patient Clinical Summaries**: Access patient blood groups, allergies, and emergency contacts before consultations.

### Patient Portal
- **Browse & Search Doctors**: Filter certified physicians by city, clinical specialty, and keyword search.
- **Interactive Slot Booking**: Select a city, specialty, available practitioner, appointment date, time slot, and reason for consultation.
- **Appointment Management**: Track upcoming and past appointments categorized by status (`Pending`, `Confirmed`, `Completed`, `Cancelled`).
- **Comprehensive Medical Profiles**: Manage personal clinical details including age, date of birth, blood group, allergies, emergency contacts, phone number, and location.

---

## Demo & Test Credentials

### Super Administrator Portal (Direct URL: `/admin` or `/login/admin`)
- **Email**: `admin@medbuddy.healthcare`
- **Password**: `admin123`

### Doctors & Practitioners (Password: `password123`)
- **Dr. Hassan Ashraf** (Psychiatry, Lahore): `hassan@gmail.com`
- **Dr. Alishba Azhar** (Gynecology, Karachi): `alishba@gmail.com`
- **Dr. Hamza Rizwan** (Pediatrics, Lahore): `hamza@gmail.com`

### Patients (Password: `password123`)
- **Emily Watson** (Lahore): `emily.watson@example.com`
- **Robert Langdon** (Karachi): `robert.langdon@example.com`
- **M. Talha Faizan** (Lahore): `talhafaizan721@gmail.com`

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Both Backend & Frontend
```bash
npm run dev
```
- Frontend: `http://localhost:3000`
- Admin Portal: `http://localhost:3000/admin` (or `/login/admin`)
- Backend API: `http://localhost:5000`
