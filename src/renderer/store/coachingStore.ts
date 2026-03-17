import { create } from 'zustand'
import { Athlete, Team, TrainingSession, AthleteNote } from '../types'

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
}

export const useCoachingStore = create<CoachingStore>((set) => ({
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
      postSessionNotes: 'Aisha\'s drive phase forward lean noticeably better. Reaction time consistent.',
      assignedTo: { type: 'athlete', id: 'ath-4' },
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
      postSessionNotes: 'Emma\'s confidence on beam visibly improved. Clean back walkover every rep.',
      assignedTo: { type: 'athlete', id: 'ath-6' },
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
      postSessionNotes: 'No soreness issues. Aisha\'s hamstrings responding well to the protocol.',
      assignedTo: { type: 'athlete', id: 'ath-4' },
    },
    {
      id: 'ses-9',
      date: '2026-03-16T09:30:00',
      title: 'Morning Swim Test',
      mode: 'freeform',
      freeformNotes: 'Time trial day. Full 200m butterfly for the record. Warm up 800m easy, 4x50m build. Full rest before trial.',
      isCompleted: false,
      assignedTo: { type: 'athlete', id: 'ath-2' },
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
    },
    {
      id: 'ses-12',
      date: '2026-03-21T11:00:00',
      title: 'Match Simulation — 90 Minutes',
      mode: 'freeform',
      freeformNotes: 'Full 90-minute small-sided game simulation. Track Tyler\'s distance covered and sprint count via GPS vest. Target: 10km total, 20+ sprints.',
      isCompleted: false,
      assignedTo: { type: 'athlete', id: 'ath-5' },
    },
  ],

  addAthlete: (athlete) =>
    set((s) => ({ athletes: [...s.athletes, athlete] })),

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

  addTeam: (team) =>
    set((s) => ({ teams: [...s.teams, team] })),

  updateTeam: (id, updates) =>
    set((s) => ({ teams: s.teams.map((t) => (t.id === id ? { ...t, ...updates } : t)) })),

  addSession: (session) =>
    set((s) => ({ sessions: [...s.sessions, session] })),

  updateSession: (id, updates) =>
    set((s) => ({
      sessions: s.sessions.map((s2) => (s2.id === id ? { ...s2, ...updates } : s2)),
    })),

  deleteSession: (id) =>
    set((s) => ({ sessions: s.sessions.filter((s2) => s2.id !== id) })),
}))
