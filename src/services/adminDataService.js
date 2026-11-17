// Frontend Mock / Fallback Data & Admin Helpers
// Ensures the admin dashboard and verification system work seamlessly with SQLite or standalone frontend

export const INITIAL_PATIENTS_MOCK = [
  {
    id: 'pat-1',
    fullName: 'Emily Watson',
    email: 'emily.watson@example.com',
    role: 'patient',
    city: 'Lahore',
    country: 'Pakistan',
    phone: '+1 (555) 987-6543',
    age: 34,
    bloodGroup: 'O+',
    allergies: 'Penicillin',
    createdAt: '2026-11-10T10:30:00Z'
  },
  {
    id: 'pat-2',
    fullName: 'Robert Langdon',
    email: 'robert.langdon@example.com',
    role: 'patient',
    city: 'Karachi',
    country: 'Pakistan',
    phone: '+1 (555) 321-4321',
    age: 41,
    bloodGroup: 'A+',
    allergies: 'None',
    createdAt: '2026-11-12T14:15:00Z'
  },
  {
    id: 'pat-1794836117018',
    fullName: 'M. Talha Faizan',
    email: 'talhafaizan721@gmail.com',
    role: 'patient',
    city: 'Lahore',
    country: 'Pakistan',
    phone: '+92 318 4498681',
    age: 26,
    bloodGroup: 'B+',
    allergies: 'None',
    createdAt: '2026-11-14T09:00:00Z'
  },
  {
    id: 'pat-1794912109284',
    fullName: 'Ahmad Mirza',
    email: 'ahmad@gmail.com',
    role: 'patient',
    city: 'Faisalabad',
    country: 'Pakistan',
    phone: '+92 318 7654321',
    age: 29,
    bloodGroup: 'O+',
    allergies: 'Dust, Pollen',
    createdAt: '2026-11-15T11:45:00Z'
  },
  {
    id: 'pat-1794917099045',
    fullName: 'Taha Ali',
    email: 'taha@gmail.com',
    role: 'patient',
    city: 'Lahore',
    country: 'Pakistan',
    phone: '+92 568 6820693',
    age: 31,
    bloodGroup: 'AB+',
    allergies: 'None',
    createdAt: '2026-11-16T16:20:00Z'
  }
];

export const INITIAL_DOCTORS_MOCK = [
  {
    id: 'doc-1794908817753',
    fullName: 'Dr. Hassan Ashraf',
    email: 'hassan@gmail.com',
    role: 'doctor',
    city: 'Lahore',
    country: 'Pakistan',
    specialty: 'Psychiatry',
    yearsOfExperience: 8,
    experienceDomain: 'Cognitive Behavioral Therapy & Clinical Psychology',
    phone: '+92 123 1234567',
    clinicAddress: 'Gulberg Healthcare Centre, Lahore',
    createdAt: '2026-11-13T08:00:00Z'
  },
  {
    id: 'doc-1794916334462',
    fullName: 'Dr. Alishba Azhar',
    email: 'alishba@gmail.com',
    role: 'doctor',
    city: 'Karachi',
    country: 'Pakistan',
    specialty: 'Gynecology & Obstetrics',
    yearsOfExperience: 6,
    experienceDomain: 'Maternal-Fetal Medicine & Women Health',
    phone: '+92 497 5819681',
    clinicAddress: 'Clifton Medical Complex, Karachi',
    createdAt: '2026-11-14T12:30:00Z'
  },
  {
    id: 'doc-1794916946120',
    fullName: 'Dr. Hamza Rizwan',
    email: 'hamza@gmail.com',
    role: 'doctor',
    city: 'Lahore',
    country: 'Pakistan',
    specialty: 'Pediatrics',
    yearsOfExperience: 10,
    experienceDomain: 'Pediatric Care & Child Immunization',
    phone: '+92 369 9591750',
    clinicAddress: 'Model Town Clinical Care, Lahore',
    createdAt: '2026-11-15T09:15:00Z'
  },
  {
    id: 'doc-seed-1',
    fullName: 'Dr. Sarah Mitchell',
    email: 'sarah.mitchell@clinic.org',
    role: 'doctor',
    city: 'Islamabad',
    country: 'Pakistan',
    specialty: 'Cardiology',
    yearsOfExperience: 12,
    experienceDomain: 'Interventional Cardiology & Heart Health',
    phone: '+92 300 9876543',
    clinicAddress: 'Blue Area Heart Institute, Islamabad',
    createdAt: '2026-11-10T11:00:00Z'
  }
];

const PATIENTS_STORAGE_KEY = 'medbuddy_patients_list';
const DOCTORS_STORAGE_KEY = 'medbuddy_doctors_list';

export function getAllPatients() {
  try {
    const raw = localStorage.getItem(PATIENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(INITIAL_PATIENTS_MOCK));
      return INITIAL_PATIENTS_MOCK;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_PATIENTS_MOCK;
  }
}

export function savePatients(patients) {
  try {
    localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(patients));
  } catch (e) {
    console.error('Failed to save patients:', e);
  }
}

export function getAllDoctors() {
  try {
    const raw = localStorage.getItem(DOCTORS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(DOCTORS_STORAGE_KEY, JSON.stringify(INITIAL_DOCTORS_MOCK));
      return INITIAL_DOCTORS_MOCK;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_DOCTORS_MOCK;
  }
}

export function saveDoctors(doctors) {
  try {
    localStorage.setItem(DOCTORS_STORAGE_KEY, JSON.stringify(doctors));
  } catch (e) {
    console.error('Failed to save doctors:', e);
  }
}

/**
 * Whenever a new user registers on the frontend, register them in our local storage pool as well
 */
export function recordNewUser(user) {
  if (!user) return;
  if (user.role === 'doctor') {
    const docs = getAllDoctors();
    if (!docs.some((d) => d.id === user.id || d.email.toLowerCase() === user.email.toLowerCase())) {
      docs.unshift(user);
      saveDoctors(docs);
    }
  } else if (user.role === 'patient') {
    const pats = getAllPatients();
    if (!pats.some((p) => p.id === user.id || p.email.toLowerCase() === user.email.toLowerCase())) {
      pats.unshift(user);
      savePatients(pats);
    }
  }
}

