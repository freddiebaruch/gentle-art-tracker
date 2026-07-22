export const CATEGORIES = [
  { id: 'guard', label: 'Guard', icon: '🛡️' },
  { id: 'pass', label: 'Pass', icon: '⚡' },
  { id: 'submission', label: 'Submission', icon: '🔒' },
  { id: 'back-take', label: 'Back Take', icon: '🎯' },
  { id: 'sweep', label: 'Sweep', icon: '↩️' },
  { id: 'escape', label: 'Escape', icon: '🚪' },
  { id: 'takedown', label: 'Takedown', icon: '⬇️' },
  { id: 'guard-pull', label: 'Guard Pull', icon: '🪝' },
]

export const GRIP_TYPES = ['Sleeve', 'Lapel', 'Pant', 'Belt', 'Collar', 'Wrist', 'Other']

export const CONNECTION_TYPES = [
  { id: 'attack', label: 'Attack', helper: 'An attack available from this technique' },
  { id: 'follow-up', label: 'Follow-up', helper: 'A natural next step in the sequence' },
  { id: 'counter', label: 'Counter', helper: 'A response to this technique' },
  { id: 'escape', label: 'Escape', helper: 'A way to get out of this technique' },
  { id: 'entry', label: 'Entry', helper: 'A route into this technique' },
  { id: 'alternative', label: 'Alternative', helper: 'Another option from the same moment' },
]

export const BELTS = [
  { id: 'white', label: 'White', color: '#f0ede8', textColor: '#0a0a0a' },
  { id: 'blue', label: 'Blue', color: '#2980b9', textColor: '#fff' },
  { id: 'purple', label: 'Purple', color: '#8e44ad', textColor: '#fff' },
  { id: 'brown', label: 'Brown', color: '#8B5A2B', textColor: '#fff' },
  { id: 'black', label: 'Black', color: '#1a1a1a', textColor: '#f0ede8' },
]

export const COMPETITION_RESULTS = ['Gold 🥇', 'Silver 🥈', 'Bronze 🥉', 'No Medal', 'DNS', 'DQ']

export const CONFIDENCE_LABELS = {
  1: 'Beginner', 2: 'Beginner', 3: 'Learning',
  4: 'Learning', 5: 'Developing', 6: 'Developing',
  7: 'Solid', 8: 'Strong', 9: 'Sharp', 10: 'Elite'
}

export function getGameTier(technique, now) {
  const { confidence = 0, lastTrained } = technique
  const daysSince = lastTrained
    ? Math.floor((now - new Date(lastTrained)) / (1000 * 60 * 60 * 24))
    : 999

  if (confidence >= 7 && daysSince <= 21) return 'A'
  if (confidence >= 4 && daysSince <= 60) return 'B'
  return 'C'
}
