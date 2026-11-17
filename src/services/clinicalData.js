import React from 'react';
import {
  FaHeartbeat,
  FaCalendarCheck,
  FaBaby,
  FaTooth,
  FaBrain,
  FaHospitalUser
} from 'react-icons/fa';

export const clinicalServices = [
  {
    id: 'general-healthcare',
    title: 'General Healthcare',
    desc: 'Comprehensive primary care diagnostics, health maintenance examinations, and treatment plans for routine medical conditions.',
    icon: <FaHeartbeat />
  },
  {
    id: 'daily-checkup',
    title: 'Daily Check-Up',
    desc: 'Regular vital sign evaluations, diagnostic screenings, and routine preventative wellness appointments to monitor overall health.',
    icon: <FaCalendarCheck />
  },
  {
    id: 'child-specialist',
    title: 'Child Specialist',
    desc: 'Dedicated pediatric medical care, developmental milestone monitoring, pediatric vaccines, and child illness consultations.',
    icon: <FaBaby />
  },
  {
    id: 'dental-oral-health',
    title: 'Dental and Oral Health Care',
    desc: 'Preventative teeth cleanings, oral examinations, restorative procedures, and expert orthodontic consultation.',
    icon: <FaTooth />
  },
  {
    id: 'psychologist',
    title: 'Psychologist',
    desc: 'Confidential clinical psychological support, behavioral therapy, mental health guidance, and emotional wellness consultations.',
    icon: <FaBrain />
  },
  {
    id: 'and-more',
    title: 'And More...',
    desc: 'Expert care across specialized medical domains including Cardiology, Dermatology, Orthopedics, Neurology, Ophthalmology, and more.',
    icon: <FaHospitalUser />
  }
];

export const standardSpecialties = [
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'ENT (Otolaryngology)',
  'Gastroenterology',
  'General Medicine',
  'General Surgery',
  'Gynecology & Obstetrics',
  'Hematology',
  'Internal Medicine',
  'Nephrology',
  'Neurology',
  'Oncology',
  'Ophthalmology',
  'Orthopedic Surgery',
  'Pediatrics',
  'Psychiatry',
  'Pulmonology',
  'Radiology',
  'Rheumatology',
  'Urology'
];

export const standardCities = [
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Gujranwala',
  'Hyderabad',
  'Bahawalpur'
];


