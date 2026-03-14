export const PHASES = [
  { id: 1, name: 'Foundation', weeks: [1, 8], color: '#2E7D32', bg: '#E8F5E9', accent: '#66BB6A' },
  { id: 2, name: 'Building', weeks: [9, 20], color: '#1565C0', bg: '#E3F2FD', accent: '#42A5F5' },
  { id: 3, name: 'Comeback', weeks: [21, 36], color: '#E65100', bg: '#FFF3E0', accent: '#FF9800' },
  { id: 4, name: 'Return to Play', weeks: [37, 52], color: '#6A1B9A', bg: '#F3E5F5', accent: '#AB47BC' },
]

export const getPhase = (week) =>
  PHASES.find((p) => week >= p.weeks[0] && week <= p.weeks[1]) || PHASES[0]

export const MILESTONES = {
  1: [
    'Walk 30+ min at 3.2+ mph, no joint pain',
    'Full bodyweight circuit w/o lasting soreness',
    'Consistent 3x/week for 6 of 8 weeks',
    'No knee or ankle flare-ups',
  ],
  2: [
    'Jog 12-15 min continuous, no joint pain',
    'Goblet squat 20 lb x 3x12',
    'Bulgarian split squat BW 3x8/side',
    'Consistent 3x/week for 10 of 12 weeks',
  ],
  3: [
    'Run 30-35 min (~3 miles) without pain',
    'Agility drills at 75-80%, no issues',
    'BSS with 12.5 lb DBs 3x10/side',
    'Copenhagen adductor 3x12/side',
  ],
  4: [
    'Run 5 miles continuously',
    'Play casual soccer without injury',
    'Band-assisted pull-ups 3x5-8',
    'Body composition noticeably improved',
  ],
}

export const PHASE_FOCUS = {
  1: 'Build the walking habit, wake up stabilizers, introduce bodyweight basics. Walking IS training right now.',
  2: 'Walk/jog intervals building toward 12-15 min continuous. Real strength training begins.',
  3: 'Build running to ~3 miles. Agility drills and soccer prep. You\'re becoming an athlete again.',
  4: 'Push to 5 miles, play casual soccer, full strength program. The comeback is complete.',
}

export const RED_FLAGS = [
  'Sharp knee pain during/after running',
  'Achilles or plantar fascia pain >48 hrs',
  'Any joint swelling',
  'Low back pain worsening with exercise',
  'Ankle instability or giving way',
]

export const WORKOUT_TYPES = {
  cardio: { label: 'Cardio', color: '#42A5F5', icon: '🏃' },
  strength: { label: 'Strength', color: '#66BB6A', icon: '💪' },
  long: { label: 'Long', color: '#FF9800', icon: '🏃‍♂️' },
}
