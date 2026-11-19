# MedBuddy - Medical Appointment & Healthcare Scheduling System

**MedBuddy** (formerly SlotBuddy) is a modern, responsive full-stack medical appointment scheduling web application. It connects patients with verified medical practitioners across multiple cities and clinical specialties, offering frictionless online appointment booking, real-time consultation status tracking, doctor schedule management, centralized administrative governance, credential verification workflows, and an instant notification system.

---

## Key Features

### Doctor / Healthcare Practitioner Portal
- **Immediate Access Upon Sign Up**: When a new doctor creates an account, they can log in immediately without being blocked.
- **Default "Pending Verification" State**:
  - The doctor's profile shows a highlighted **"Pending Verification"** badge in the navbar.
  - The navbar dropdown provides an **"Account Status: Please Verify"** option directly above the Sign Out button.
- **Full Portal Functionality**: Even while unverified, doctors can freely use the portal, review schedules, approve appointments, and receive real-time notifications.
- **Self-Service PMDC Verification**: Doctors click *Account Status* to open the verification modal and submit their valid **PMDC-(5+ digit number)** credential (e.g. `PMDC-12345`). Once verified, their status updates across the entire directory, and the modal seamlessly switches to *"Update Your PMDC Number"*.
- **Clinical Dashboard & Metrics**: At-a-glance overview of assigned patients, confirmed bookings, pending requests, and completed consultations.
- **Appointment Status Control**: Review pending patient requests and update consultation status (`Confirmed`, `Completed`, `Cancelled`).
- **Patient Clinical Summaries**: Access patient blood groups, allergies, and emergency contacts before consultations.

### Notification System (Doctors & Patients)
- **Top Right Bell Icon**: Placed on the outermost right corner of the navbar, with user profile name & avatar positioned on its left.
- **Unread Notification Badge & Styling**: Unread notifications are formatted in **bold text** with a blue indicator dot; read notifications display in regular text.
- **Appointment Request Trigger**: When a patient books an appointment, the respective doctor immediately receives:
  > *"You have a new appointment request by [Name of patient] at [time slot]. Please confirm the request"*
- **Status Change Trigger**: When a doctor confirms, cancels, or marks an appointment as completed, the respective patient receives an instant update.
- **Click to Navigate & Focus**: Clicking on any notification automatically redirects the user to their dashboard and smoothly scrolls to and highlights the target appointment item.
- **Dedicated All Notifications Page (`/notifications`)**: Accessible via the "View all notifications" button in the dropdown. Sorted chronologically with the most recent notifications always at the top, complete with filters for *All*, *Unread*, and *Read*.

### Admin Portal (Manual URL Access Only: `/admin`, `/login/admin`, `/register/admin`)
- **Centralized Healthcare Governance**: Super administrator dashboard for overseeing all clinical and outpatient activity.
- **Demographic & City Metrics**: Real-time aggregated breakdown showing total registered patients and doctors by specific cities (Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta, etc.).
- **Selective Disable Access Control**: Admins can only disable doctors who are **unverified**. Once a doctor is verified, the "Disable Doctor" button is locked (`Cannot Disable (Verified)`).
- **Disabled Doctor Lockout**: If an unverified doctor is disabled by the admin, their session is revoked and future sign-in attempts are rejected with:
  > *"Your account is disabled by the Admin for not verifying. Please contact the admin at admin@medbuddy.healthcare to enable ur account."*
- **Strict Route Isolation**:
  - Logged-in doctors and patients attempting to type `/admin` are bounced directly back to their active dashboard.
  - Logged-in administrators attempting to visit doctor or patient portals are bounced back to `/admin`.
- **Directory Rosters**: Interactive search, city filtering, and status filtering across all registered doctors and patients.

### Patient Portal
- **Browse & Search Doctors**: Filter certified physicians by city, clinical specialty, and keyword search.
- **Interactive Slot Booking**: Select a city, specialty, available practitioner, appointment date, time slot, and reason for consultation.
- **Appointment Management**: Track upcoming and past appointments categorized by status (`Pending`, `Confirmed`, `Completed`, `Cancelled`).

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
- Notifications Page: `http://localhost:3000/notifications`
- Admin Portal: `http://localhost:3000/admin` (or `/login/admin`)
- Backend API: `http://localhost:5000`

