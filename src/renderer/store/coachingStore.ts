import { create } from 'zustand'
import {
  Athlete, Team, TrainingSession, AthleteNote,
  ProgressEntry, SessionClip, ActivityEvent, CoachProfile, OnboardingState,
} from '../types'

// Helper to get ISO date N days ago
function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}
function daysAgoFull(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

interface CoachingStore {
  athletes: Athlete[]
  teams: Team[]
  sessions: TrainingSession[]

  addAthlete: (athlete: Athlete) => void
  updateAthlete: (id: string, updates: Partial<Athlete>) => void
  deleteAthlete: (id: string) => void
  addNote: (athleteId: string, note: AthleteNote) => void
  addTeam: (team: Team) => void
  updateTeam: (id: string, updates: Partial<Team>) => void
  addSession: (session: TrainingSession) => void
  updateSession: (id: string, updates: Partial<TrainingSession>) => void
  deleteSession: (id: string) => void

  // Progress tracking
  addProgressEntry: (athleteId: string, entry: ProgressEntry) => void
  deleteProgressEntry: (athleteId: string, entryId: string) => void

  // Session clip tagging
  addClipToSession: (sessionId: string, clip: SessionClip) => void
  updateClipRating: (sessionId: string, clipId: string, rating: 1 | 2 | 3) => void

  // Activity feed
  activityFeed: ActivityEvent[]
  addActivity: (event: ActivityEvent) => void

  // Coach profile
  coachProfile: CoachProfile
  updateCoachProfile: (updates: Partial<CoachProfile>) => void

  // Onboarding
  onboarding: OnboardingState
  setOnboardingStep: (step: number) => void
  completeOnboarding: () => void
}

const seedActivity: ActivityEvent[] = [
  {
    id: 'act-1',
    type: 'session_logged',
    title: 'Session logged: Hamstring Protocol',
    subtitle: 'Aisha Patel — 3 exercises completed',
    timestamp: daysAgoFull(0),
    athleteId: 'ath-4',
    icon: 'Dumbbell',
  },
  {
    id: 'act-2',
    type: 'progress_logged',
    title: 'Progress logged: Vertical Jump',
    subtitle: 'Marcus Johnson — 32 inches',
    timestamp: daysAgoFull(1),
    athleteId: 'ath-1',
    icon: 'TrendingUp',
  },
  {
    id: 'act-3',
    type: 'clip_tagged',
    title: 'Clip tagged: Sprint Drill',
    subtitle: 'Aisha Patel — ⭐⭐⭐ Highlight',
    timestamp: daysAgoFull(1),
    athleteId: 'ath-4',
    icon: 'Star',
  },
  {
    id: 'act-4',
    type: 'session_logged',
    title: 'Session logged: Morning Swim Test',
    subtitle: 'Sophia Chen — Time trial',
    timestamp: daysAgoFull(2),
    athleteId: 'ath-2',
    icon: 'Dumbbell',
  },
  {
    id: 'act-5',
    type: 'compilation_ready',
    title: 'Compilation ready',
    subtitle: 'Hype reel — 32s — 6 clips',
    timestamp: daysAgoFull(3),
    icon: 'Film',
  },
  {
    id: 'act-6',
    type: 'athlete_added',
    title: 'Athlete added: Emma Thompson',
    subtitle: 'Gymnastics — Elite level',
    timestamp: daysAgoFull(4),
    athleteId: 'ath-6',
    icon: 'UserPlus',
  },
  {
    id: 'act-7',
    type: 'progress_logged',
    title: 'Progress logged: 200m Butterfly',
    subtitle: 'Sophia Chen — 2:11.4s',
    timestamp: daysAgoFull(4),
    athleteId: 'ath-2',
    icon: 'TrendingUp',
  },
  {
    id: 'act-8',
    type: 'clip_tagged',
    title: 'Clip tagged: Beam Routine',
    subtitle: 'Emma Thompson — ⭐⭐ Good',
    timestamp: daysAgoFull(5),
    athleteId: 'ath-6',
    icon: 'Star',
  },
  {
    id: 'act-9',
    type: 'session_logged',
    title: 'Session logged: Explosive Strength',
    subtitle: 'Varsity Squad — Team session',
    timestamp: daysAgoFull(6),
    icon: 'Dumbbell',
  },
  {
    id: 'act-10',
    type: 'progress_logged',
    title: 'Progress logged: Bench Press',
    subtitle: 'Jake Williams — 245 lbs',
    timestamp: daysAgoFull(7),
    athleteId: 'ath-3',
    icon: 'TrendingUp',
  },
]

export const useCoachingStore = create<CoachingStore>((set, get) => ({
  athletes: [
    {
      id: 'ath-1',
      name: 'Marcus Johnson',
      avatarUrl: 'https://i.pravatar.cc/150?img=11',
      age: 19,
      weight: 185,
      height: 76,
      sport: 'Basketball',
      level: 'Advanced',
      goals: 'Improve vertical jump by 3 inches and increase 3-point shooting accuracy to 40% by end of season.',
      notes: [
        { id: 'n1', date: '2026-03-01', content: 'Excellent lateral quickness drills today. Left knee strap recommended for extended sessions.' },
        { id: 'n2', date: '2026-03-08', content: 'Shot form improved significantly after the wrist position correction. Keep reinforcing.' },
      ],
      compilationUrls: [],
      teamIds: ['team-1'],
      sessionClips: [],
      progressEntries: [
        { id: 'pe-1-1', date: daysAgo(58), metric: 'Vertical Jump', value: 28, unit: 'inches' },
        { id: 'pe-1-2', date: daysAgo(48), metric: 'Vertical Jump', value: 29, unit: 'inches' },
        { id: 'pe-1-3', date: daysAgo(38), metric: 'Vertical Jump', value: 29.5, unit: 'inches' },
        { id: 'pe-1-4', date: daysAgo(28), metric: 'Vertical Jump', value: 30.5, unit: 'inches' },
        { id: 'pe-1-5', date: daysAgo(18), metric: 'Vertical Jump', value: 31, unit: 'inches' },
        { id: 'pe-1-6', date: daysAgo(8), metric: 'Vertical Jump', value: 32, unit: 'inches' },
        { id: 'pe-1-7', date: daysAgo(55), metric: '40m Sprint', value: 5.1, unit: 'seconds' },
        { id: 'pe-1-8', date: daysAgo(40), metric: '40m Sprint', value: 4.95, unit: 'seconds' },
        { id: 'pe-1-9', date: daysAgo(25), metric: '40m Sprint', value: 4.88, unit: 'seconds' },
        { id: 'pe-1-10', date: daysAgo(10), metric: '40m Sprint', value: 4.82, unit: 'seconds' },
      ],
    },
    {
      id: 'ath-2',
      name: 'Sophia Chen',
      avatarUrl: 'https://i.pravatar.cc/150?img=47',
      age: 17,
      weight: 128,
      height: 65,
      sport: 'Swimming',
      level: 'Elite',
      goals: 'Qualify for nationals in 200m butterfly. Target time: sub 2:08.',
      notes: [
        { id: 'n3', date: '2026-03-03', content: 'Butterfly stroke arm recovery looking much cleaner. Breathing pattern still needs work on turns.' },
        { id: 'n4', date: '2026-03-10', content: 'Best 200m time this season — 2:11.4. On track for nationals qualification.' },
      ],
      compilationUrls: [],
      teamIds: [],
      sessionClips: [],
      progressEntries: [
        { id: 'pe-2-1', date: daysAgo(60), metric: '200m Butterfly', value: 2.25, unit: 'minutes' },
        { id: 'pe-2-2', date: daysAgo(50), metric: '200m Butterfly', value: 2.22, unit: 'minutes' },
        { id: 'pe-2-3', date: daysAgo(40), metric: '200m Butterfly', value: 2.19, unit: 'minutes' },
        { id: 'pe-2-4', date: daysAgo(30), metric: '200m Butterfly', value: 2.18, unit: 'minutes' },
        { id: 'pe-2-5', date: daysAgo(20), metric: '200m Butterfly', value: 2.15, unit: 'minutes' },
        { id: 'pe-2-6', date: daysAgo(7), metric: '200m Butterfly', value: 2.11, unit: 'minutes' },
        { id: 'pe-2-7', date: daysAgo(55), metric: 'Stroke Rate', value: 38, unit: 'strokes/min' },
        { id: 'pe-2-8', date: daysAgo(35), metric: 'Stroke Rate', value: 40, unit: 'strokes/min' },
        { id: 'pe-2-9', date: daysAgo(15), metric: 'Stroke Rate', value: 42, unit: 'strokes/min' },
      ],
    },
    {
      id: 'ath-3',
      name: 'Jake Williams',
      avatarUrl: 'https://i.pravatar.cc/150?img=15',
      age: 21,
      weight: 215,
      height: 72,
      sport: 'Football',
      level: 'Intermediate',
      goals: 'Build functional strength for spring season. Focus on hip mobility and explosive starts.',
      notes: [
        { id: 'n5', date: '2026-03-05', content: 'Hip flexor tightness noted. Added mobility warm-up to standard protocol.' },
      ],
      compilationUrls: [],
      teamIds: ['team-1'],
      sessionClips: [],
      progressEntries: [
        { id: 'pe-3-1', date: daysAgo(58), metric: 'Bench Press', value: 215, unit: 'lbs' },
        { id: 'pe-3-2', date: daysAgo(45), metric: 'Bench Press', value: 225, unit: 'lbs' },
        { id: 'pe-3-3', date: daysAgo(32), metric: 'Bench Press', value: 230, unit: 'lbs' },
        { id: 'pe-3-4', date: daysAgo(20), metric: 'Bench Press', value: 240, unit: 'lbs' },
        { id: 'pe-3-5', date: daysAgo(8), metric: 'Bench Press', value: 245, unit: 'lbs' },
        { id: 'pe-3-6', date: daysAgo(55), metric: 'Hip Mobility', value: 52, unit: 'degrees' },
        { id: 'pe-3-7', date: daysAgo(40), metric: 'Hip Mobility', value: 58, unit: 'degrees' },
        { id: 'pe-3-8', date: daysAgo(25), metric: 'Hip Mobility', value: 63, unit: 'degrees' },
        { id: 'pe-3-9', date: daysAgo(10), metric: 'Hip Mobility', value: 68, unit: 'degrees' },
      ],
    },
    {
      id: 'ath-4',
      name: 'Aisha Patel',
      avatarUrl: 'https://i.pravatar.cc/150?img=44',
      age: 18,
      weight: 118,
      height: 64,
      sport: 'Track & Field',
      level: 'Advanced',
      goals: 'Drop 100m time to 11.8s. Strengthen hamstrings for injury prevention.',
      notes: [
        { id: 'n6', date: '2026-03-07', content: 'Block start reaction time is excellent (0.142s avg). Drive phase needs more forward lean.' },
        { id: 'n7', date: '2026-03-12', content: 'Hamstring protocol going well. No soreness reported after track session.' },
      ],
      compilationUrls: [],
      teamIds: ['team-2'],
      sessionClips: [],
      progressEntries: [
        { id: 'pe-4-1', date: daysAgo(60), metric: '100m Sprint', value: 12.4, unit: 'seconds' },
        { id: 'pe-4-2', date: daysAgo(50), metric: '100m Sprint', value: 12.25, unit: 'seconds' },
        { id: 'pe-4-3', date: daysAgo(40), metric: '100m Sprint', value: 12.1, unit: 'seconds' },
        { id: 'pe-4-4', date: daysAgo(30), metric: '100m Sprint', value: 12.05, unit: 'seconds' },
        { id: 'pe-4-5', date: daysAgo(20), metric: '100m Sprint', value: 11.95, unit: 'seconds' },
        { id: 'pe-4-6', date: daysAgo(5), metric: '100m Sprint', value: 11.88, unit: 'seconds' },
        { id: 'pe-4-7', date: daysAgo(55), metric: 'Hamstring Curl', value: 75, unit: 'lbs' },
        { id: 'pe-4-8', date: daysAgo(38), metric: 'Hamstring Curl', value: 85, unit: 'lbs' },
        { id: 'pe-4-9', date: daysAgo(22), metric: 'Hamstring Curl', value: 90, unit: 'lbs' },
        { id: 'pe-4-10', date: daysAgo(8), metric: 'Hamstring Curl', value: 95, unit: 'lbs' },
      ],
    },
    {
      id: 'ath-5',
      name: 'Tyler Rodriguez',
      avatarUrl: 'https://i.pravatar.cc/150?img=12',
      age: 20,
      weight: 170,
      height: 70,
      sport: 'Soccer',
      level: 'Intermediate',
      goals: 'Increase stamina for full 90-minute matches without significant drop in pace.',
      notes: [
        { id: 'n8', date: '2026-03-09', content: 'VO2 max improving — now at 58 mL/kg/min. Target is 62 by April.' },
      ],
      compilationUrls: [],
      teamIds: [],
      sessionClips: [],
      progressEntries: [
        { id: 'pe-5-1', date: daysAgo(58), metric: 'VO2 Max', value: 54, unit: 'mL/kg/min' },
        { id: 'pe-5-2', date: daysAgo(45), metric: 'VO2 Max', value: 55.5, unit: 'mL/kg/min' },
        { id: 'pe-5-3', date: daysAgo(32), metric: 'VO2 Max', value: 56.8, unit: 'mL/kg/min' },
        { id: 'pe-5-4', date: daysAgo(20), metric: 'VO2 Max', value: 57.5, unit: 'mL/kg/min' },
        { id: 'pe-5-5', date: daysAgo(8), metric: 'VO2 Max', value: 58, unit: 'mL/kg/min' },
        { id: 'pe-5-6', date: daysAgo(55), metric: '5km Time', value: 22.5, unit: 'minutes' },
        { id: 'pe-5-7', date: daysAgo(35), metric: '5km Time', value: 21.8, unit: 'minutes' },
        { id: 'pe-5-8', date: daysAgo(15), metric: '5km Time', value: 21.2, unit: 'minutes' },
      ],
    },
    {
      id: 'ath-6',
      name: 'Emma Thompson',
      avatarUrl: 'https://i.pravatar.cc/150?img=48',
      age: 16,
      weight: 105,
      height: 62,
      sport: 'Gymnastics',
      level: 'Elite',
      goals: 'Clean execution on beam routine. Target 9.2+ score at regional championships.',
      notes: [
        { id: 'n9', date: '2026-03-02', content: 'Back walkover confidence significantly improved. Full routine under 90 seconds for first time.' },
        { id: 'n10', date: '2026-03-11', content: 'Wrist wraps helping with vault landings. Mental preparation becoming a key focus area.' },
      ],
      compilationUrls: [],
      teamIds: ['team-2'],
      sessionClips: [],
      progressEntries: [
        { id: 'pe-6-1', date: daysAgo(60), metric: 'Beam Score', value: 8.4, unit: 'points' },
        { id: 'pe-6-2', date: daysAgo(48), metric: 'Beam Score', value: 8.6, unit: 'points' },
        { id: 'pe-6-3', date: daysAgo(36), metric: 'Beam Score', value: 8.7, unit: 'points' },
        { id: 'pe-6-4', date: daysAgo(24), metric: 'Beam Score', value: 8.9, unit: 'points' },
        { id: 'pe-6-5', date: daysAgo(12), metric: 'Beam Score', value: 9.0, unit: 'points' },
        { id: 'pe-6-6', date: daysAgo(3), metric: 'Beam Score', value: 9.1, unit: 'points' },
        { id: 'pe-6-7', date: daysAgo(55), metric: 'Routine Time', value: 98, unit: 'seconds' },
        { id: 'pe-6-8', date: daysAgo(35), metric: 'Routine Time', value: 94, unit: 'seconds' },
        { id: 'pe-6-9', date: daysAgo(15), metric: 'Routine Time', value: 91, unit: 'seconds' },
        { id: 'pe-6-10', date: daysAgo(3), metric: 'Routine Time', value: 89, unit: 'seconds' },
      ],
    },
  ],

  teams: [
    {
      id: 'team-1',
      name: 'Varsity Squad',
      sport: 'Multi-sport',
      athleteIds: ['ath-1', 'ath-3'],
    },
    {
      id: 'team-2',
      name: 'Sprint & Power Group',
      sport: 'Track & Field / Gymnastics',
      athleteIds: ['ath-4', 'ath-6'],
    },
  ],

  sessions: [
    {
      id: 'ses-1',
      date: '2026-03-03T09:00:00',
      title: 'Explosive Strength Block',
      mode: 'structured',
      exercises: [
        { name: 'Box Jumps', sets: 4, reps: '8', notes: 'Focus on landing mechanics' },
        { name: 'Power Cleans', sets: 3, reps: '5', notes: 'Work up to 75% 1RM' },
        { name: 'Sprint Drills', sets: 6, reps: '20m', notes: 'Full recovery between reps' },
      ],
      isCompleted: true,
      postSessionNotes: 'All athletes responded well. Marcus hit a new PR on box jumps.',
      assignedTo: { type: 'team', id: 'team-1' },
      clips: [],
    },
    {
      id: 'ses-2',
      date: '2026-03-04T14:00:00',
      title: 'Butterfly Technique Deep Dive',
      mode: 'freeform',
      freeformNotes: 'Focus entirely on underwater dolphin kick and breathing rhythm. Video review of 2025 nationals footage.',
      isCompleted: true,
      postSessionNotes: 'Breathing pattern on turns improving. Schedule video review again next week.',
      assignedTo: { type: 'athlete', id: 'ath-2' },
      clips: [],
    },
    {
      id: 'ses-3',
      date: '2026-03-05T10:00:00',
      title: 'Hip Mobility & Activation',
      mode: 'structured',
      exercises: [
        { name: '90/90 Hip Stretches', sets: 3, reps: '45s each', notes: 'Slow controlled movement' },
        { name: 'Hip Flexor Lunges', sets: 3, reps: '12 each leg' },
        { name: 'Glute Bridges', sets: 4, reps: '15' },
        { name: 'Band Walks', sets: 3, reps: '20 each direction' },
      ],
      isCompleted: true,
      postSessionNotes: 'Jake reported much better hip flexibility post-session.',
      assignedTo: { type: 'athlete', id: 'ath-3' },
      clips: [],
    },
    {
      id: 'ses-4',
      date: '2026-03-07T08:30:00',
      title: 'Sprint Mechanics - Block Start',
      mode: 'structured',
      exercises: [
        { name: 'Block Starts', sets: 8, reps: '30m', notes: 'Video every rep' },
        { name: 'Flying 30s', sets: 4, reps: '30m' },
        { name: 'Wicket Drills', sets: 3, reps: '40m' },
      ],
      isCompleted: true,
      postSessionNotes: "Aisha's drive phase forward lean noticeably better. Reaction time consistent.",
      assignedTo: { type: 'athlete', id: 'ath-4' },
      clips: [],
    },
    {
      id: 'ses-5',
      date: '2026-03-09T11:00:00',
      title: 'Aerobic Threshold Run',
      mode: 'freeform',
      freeformNotes: '60-minute run at 75-80% max heart rate. Include 4x strides at the end. Track HR data throughout.',
      isCompleted: true,
      postSessionNotes: 'Tyler maintained 155-160bpm throughout. Solid aerobic base building.',
      assignedTo: { type: 'athlete', id: 'ath-5' },
      clips: [],
    },
    {
      id: 'ses-6',
      date: '2026-03-10T15:00:00',
      title: 'Beam Routine Conditioning',
      mode: 'structured',
      exercises: [
        { name: 'Balance Board Work', sets: 3, reps: '2 min' },
        { name: 'Full Routine Run-Through', sets: 3, reps: '1 run', notes: 'Video each run' },
        { name: 'Dismount Practice', sets: 5, reps: '1 each' },
      ],
      isCompleted: true,
      postSessionNotes: "Emma's confidence on beam visibly improved. Clean back walkover every rep.",
      assignedTo: { type: 'athlete', id: 'ath-6' },
      clips: [],
    },
    {
      id: 'ses-7',
      date: '2026-03-12T09:00:00',
      title: 'Team Speed & Agility',
      mode: 'structured',
      exercises: [
        { name: 'Ladder Drills', sets: 4, reps: '3 patterns' },
        { name: 'Cone Agility', sets: 5, reps: '5-10-5 drill' },
        { name: 'Sprint Ladders', sets: 1, reps: '10-20-30-40m' },
      ],
      isCompleted: true,
      postSessionNotes: 'Strong team session. Competition between Marcus and Jake is motivating both.',
      assignedTo: { type: 'team', id: 'team-1' },
      clips: [],
    },
    {
      id: 'ses-8',
      date: '2026-03-14T10:00:00',
      title: 'Hamstring Strength Protocol',
      mode: 'structured',
      exercises: [
        { name: 'Nordic Hamstring Curls', sets: 3, reps: '6', notes: 'Eccentric focus' },
        { name: 'Romanian Deadlifts', sets: 4, reps: '8' },
        { name: 'Single Leg Bridges', sets: 3, reps: '12 each' },
      ],
      isCompleted: true,
      postSessionNotes: "No soreness issues. Aisha's hamstrings responding well to the protocol.",
      assignedTo: { type: 'athlete', id: 'ath-4' },
      clips: [],
    },
    {
      id: 'ses-9',
      date: '2026-03-16T09:30:00',
      title: 'Morning Swim Test',
      mode: 'freeform',
      freeformNotes: 'Time trial day. Full 200m butterfly for the record. Warm up 800m easy, 4x50m build. Full rest before trial.',
      isCompleted: false,
      assignedTo: { type: 'athlete', id: 'ath-2' },
      clips: [],
    },
    {
      id: 'ses-10',
      date: '2026-03-17T14:00:00',
      title: 'Shooting & Footwork Drills',
      mode: 'structured',
      exercises: [
        { name: 'Mikan Drill', sets: 3, reps: '2 min' },
        { name: 'Spot Shooting', sets: 5, reps: '10 per spot' },
        { name: 'Off-Screen Cuts', sets: 4, reps: '8 reps' },
      ],
      isCompleted: false,
      assignedTo: { type: 'athlete', id: 'ath-1' },
      clips: [],
    },
    {
      id: 'ses-11',
      date: '2026-03-19T10:00:00',
      title: 'Sprint & Power Group — Peak Week',
      mode: 'structured',
      exercises: [
        { name: 'Acceleration 10s', sets: 6, reps: '10m', notes: 'Full rest — speed work only' },
        { name: 'Bounding', sets: 4, reps: '30m' },
        { name: 'Plyometric Circuit', sets: 3, reps: '5 exercises x 8 reps' },
      ],
      isCompleted: false,
      assignedTo: { type: 'team', id: 'team-2' },
      clips: [],
    },
    {
      id: 'ses-12',
      date: '2026-03-21T11:00:00',
      title: 'Match Simulation — 90 Minutes',
      mode: 'freeform',
      freeformNotes: "Full 90-minute small-sided game simulation. Track Tyler's distance covered and sprint count via GPS vest. Target: 10km total, 20+ sprints.",
      isCompleted: false,
      assignedTo: { type: 'athlete', id: 'ath-5' },
      clips: [],
    },
  ],

  activityFeed: seedActivity,

  coachProfile: {
    name: 'Coach Alex',
    title: 'Head Performance Coach',
    sport: 'Multi-Sport',
    bio: 'Building champions one session at a time.',
    publicHandle: 'coach-alex',
    avatarUrl: 'https://i.pravatar.cc/150?img=33',
  },

  onboarding: { completed: true, step: 3 },

  // ── Athletes ──────────────────────────────────────────────────────────────
  addAthlete: (athlete) =>
    set((s) => {
      const event: ActivityEvent = {
        id: `act-${Date.now()}`,
        type: 'athlete_added',
        title: `Athlete added: ${athlete.name}`,
        subtitle: `${athlete.sport} — ${athlete.level} level`,
        timestamp: new Date().toISOString(),
        athleteId: athlete.id,
        icon: 'UserPlus',
      }
      return {
        athletes: [...s.athletes, athlete],
        activityFeed: [event, ...s.activityFeed],
      }
    }),

  updateAthlete: (id, updates) =>
    set((s) => ({ athletes: s.athletes.map((a) => (a.id === id ? { ...a, ...updates } : a)) })),

  deleteAthlete: (id) =>
    set((s) => ({ athletes: s.athletes.filter((a) => a.id !== id) })),

  addNote: (athleteId, note) =>
    set((s) => ({
      athletes: s.athletes.map((a) =>
        a.id === athleteId ? { ...a, notes: [...a.notes, note] } : a
      ),
    })),

  // ── Teams ─────────────────────────────────────────────────────────────────
  addTeam: (team) =>
    set((s) => ({ teams: [...s.teams, team] })),

  updateTeam: (id, updates) =>
    set((s) => ({ teams: s.teams.map((t) => (t.id === id ? { ...t, ...updates } : t)) })),

  // ── Sessions ──────────────────────────────────────────────────────────────
  addSession: (session) =>
    set((s) => {
      const event: ActivityEvent = {
        id: `act-${Date.now()}`,
        type: 'session_logged',
        title: `Session logged: ${session.title}`,
        subtitle: session.assignedTo.type === 'athlete'
          ? (s.athletes.find((a) => a.id === session.assignedTo.id)?.name ?? 'Athlete')
          : (s.teams.find((t) => t.id === session.assignedTo.id)?.name ?? 'Team'),
        timestamp: new Date().toISOString(),
        icon: 'Dumbbell',
      }
      return {
        sessions: [...s.sessions, session],
        activityFeed: [event, ...s.activityFeed],
      }
    }),

  updateSession: (id, updates) =>
    set((s) => ({
      sessions: s.sessions.map((s2) => (s2.id === id ? { ...s2, ...updates } : s2)),
    })),

  deleteSession: (id) =>
    set((s) => ({ sessions: s.sessions.filter((s2) => s2.id !== id) })),

  // ── Progress tracking ─────────────────────────────────────────────────────
  addProgressEntry: (athleteId, entry) =>
    set((s) => {
      const athlete = s.athletes.find((a) => a.id === athleteId)
      const event: ActivityEvent = {
        id: `act-${Date.now()}`,
        type: 'progress_logged',
        title: `Progress logged: ${entry.metric}`,
        subtitle: `${athlete?.name ?? 'Athlete'} — ${entry.value} ${entry.unit}`,
        timestamp: new Date().toISOString(),
        athleteId,
        icon: 'TrendingUp',
      }
      return {
        athletes: s.athletes.map((a) =>
          a.id === athleteId
            ? { ...a, progressEntries: [...a.progressEntries, entry] }
            : a
        ),
        activityFeed: [event, ...s.activityFeed],
      }
    }),

  deleteProgressEntry: (athleteId, entryId) =>
    set((s) => ({
      athletes: s.athletes.map((a) =>
        a.id === athleteId
          ? { ...a, progressEntries: a.progressEntries.filter((e) => e.id !== entryId) }
          : a
      ),
    })),

  // ── Clip tagging ──────────────────────────────────────────────────────────
  addClipToSession: (sessionId, clip) =>
    set((s) => {
      const athlete = s.athletes.find((a) => a.id === clip.athleteId)
      const event: ActivityEvent = {
        id: `act-${Date.now()}`,
        type: 'clip_tagged',
        title: `Clip tagged: ${clip.drillName}`,
        subtitle: `${athlete?.name ?? 'Athlete'} — ${'⭐'.repeat(clip.rating)}`,
        timestamp: new Date().toISOString(),
        athleteId: clip.athleteId,
        icon: 'Star',
      }
      return {
        sessions: s.sessions.map((se) =>
          se.id === sessionId ? { ...se, clips: [...(se.clips ?? []), clip] } : se
        ),
        activityFeed: [event, ...s.activityFeed],
      }
    }),

  updateClipRating: (sessionId, clipId, rating) =>
    set((s) => ({
      sessions: s.sessions.map((se) =>
        se.id === sessionId
          ? {
              ...se,
              clips: (se.clips ?? []).map((c) => (c.id === clipId ? { ...c, rating } : c)),
            }
          : se
      ),
    })),

  // ── Activity feed ─────────────────────────────────────────────────────────
  addActivity: (event) =>
    set((s) => ({ activityFeed: [event, ...s.activityFeed] })),

  // ── Coach profile ─────────────────────────────────────────────────────────
  updateCoachProfile: (updates) =>
    set((s) => ({ coachProfile: { ...s.coachProfile, ...updates } })),

  // ── Onboarding ────────────────────────────────────────────────────────────
  setOnboardingStep: (step) =>
    set((s) => ({ onboarding: { ...s.onboarding, step } })),

  completeOnboarding: () =>
    set({ onboarding: { completed: true, step: 3 } }),
}))
