export const MOCK_PARENT = {
  name: 'Amma',
  kannadaName: 'ಅಮ್ಮಾ',
  location: 'Mandya (ಮಂಡ್ಯ)',
  age: 68,
  phone: '+91 98450 12345',
  linkedChild: 'Abhilash (Bengaluru)',
  status: 'Active (Online)',
};

export const MOCK_SLOTS = [
  {
    id: 'slot-morning',
    time: '09:00 AM',
    label: 'ಬೆಳಗಿನ ಮಾತ್ರೆಗಳು (Morning Medicines)',
    status: 'PENDING', // PENDING, TAKEN, MISSED
    medicines: [
      {
        id: 'med-1',
        name: 'BP Tablet',
        genericName: 'Telmisartan 40mg',
        kannadaName: 'ಬಿಪಿ ಮಾತ್ರೆ',
        timing: 'After Breakfast',
        color: '#3B82F6', // Blue blister
        dosage: '1 Tablet',
        photo: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'med-2',
        name: 'Sugar Tablet',
        genericName: 'Metformin 500mg',
        kannadaName: 'ಸಕ್ಕರೆ ಕಾಯಿಲೆ ಮಾತ್ರೆ',
        timing: 'After Breakfast',
        color: '#10B981', // Green blister
        dosage: '1 Tablet',
        photo: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80',
      },
    ],
  },
  {
    id: 'slot-night',
    time: '08:30 PM',
    label: 'ರಾತ್ರಿಯ ಮಾತ್ರೆಗಳು (Night Medicines)',
    status: 'SCHEDULED',
    medicines: [
      {
        id: 'med-3',
        name: 'Calcium Tablet',
        genericName: 'Shelcal 500mg',
        kannadaName: 'ಕ್ಯಾಲ್ಸಿಯಂ ಮಾತ್ರೆ',
        timing: 'After Dinner',
        color: '#F59E0B',
        dosage: '1 Tablet',
        photo: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80',
      },
    ],
  },
];

export const MOCK_DOCTOR_STATS = {
  daysTracked: 14,
  taken: 11,
  late: 1,
  missed: 2,
};

export const MOCK_HISTORY = [
  {
    date: 'Today (28 Oct)',
    time: '09:00 AM',
    slot: 'Morning Medicines',
    medicines: 'BP Tablet, Sugar Tablet',
    status: 'TAKEN',
    takenAt: '09:08 AM',
  },
  {
    date: 'Yesterday (27 Oct)',
    time: '08:30 PM',
    slot: 'Night Medicines',
    medicines: 'Calcium Tablet',
    status: 'TAKEN',
    takenAt: '08:35 PM',
  },
  {
    date: 'Yesterday (27 Oct)',
    time: '09:00 AM',
    slot: 'Morning Medicines',
    medicines: 'BP Tablet, Sugar Tablet',
    status: 'TAKEN',
    takenAt: '09:12 AM',
  },
  {
    date: '26 Oct',
    time: '09:00 AM',
    slot: 'Morning Medicines',
    medicines: 'BP Tablet, Sugar Tablet',
    status: 'LATE',
    takenAt: '09:42 AM (After child call)',
  },
  {
    date: '25 Oct',
    time: '09:00 AM',
    slot: 'Morning Medicines',
    medicines: 'BP Tablet, Sugar Tablet',
    status: 'MISSED',
    takenAt: 'Unconfirmed (Missed)',
  },
  {
    date: '24 Oct',
    time: '08:30 PM',
    slot: 'Night Medicines',
    medicines: 'Calcium Tablet',
    status: 'TAKEN',
    takenAt: '08:40 PM',
  },
];
