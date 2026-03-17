import OpenAI from 'openai'
import { useCoachingStore } from '../store/coachingStore'
import { ChatMessage } from '../store/coachingStore'

const apiKey = import.meta.env.VITE_OPENAI_API_KEY
console.log('[AI] Key loaded:', apiKey ? `${apiKey.slice(0, 10)}…` : 'MISSING')

const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true,
})

/** Build a comprehensive system prompt from the current store state */
function buildSystemPrompt(): string {
  const { athletes, teams, sessions, coachProfile } = useCoachingStore.getState()

  const athleteSummaries = athletes.map((a) => {
    const recentProgress = a.progressEntries
      .sort((x, y) => y.date.localeCompare(x.date))
      .slice(0, 6)
      .map((e) => `  • ${e.date}: ${e.metric} = ${e.value} ${e.unit}`)
      .join('\n')

    const recentNotes = a.notes
      .slice(-3)
      .map((n) => `  • ${n.date}: ${n.content}`)
      .join('\n')

    return `### ${a.name}
- Sport: ${a.sport} | Level: ${a.level} | Age: ${a.age}
- Goals: ${a.goals}
- Session clips tagged: ${a.sessionClips.length}
- Recent progress entries:
${recentProgress || '  (none)'}
- Recent coach notes:
${recentNotes || '  (none)'}`
  }).join('\n\n')

  const sessionSummaries = sessions
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20)
    .map((s) => {
      const assignedName =
        s.assignedTo.type === 'athlete'
          ? athletes.find((a) => a.id === s.assignedTo.id)?.name ?? 'Unknown'
          : teams.find((t) => t.id === s.assignedTo.id)?.name ?? 'Unknown team'
      const clipCount = s.clips?.length ?? 0
      const exercises = s.exercises?.map((e) => `${e.name} ${e.sets}x${e.reps}`).join(', ') ?? ''
      return `- ${s.date.slice(0, 10)} | "${s.title}" → ${assignedName} | ${s.isCompleted ? '✓ done' : 'upcoming'}${exercises ? ` | Exercises: ${exercises}` : ''}${clipCount ? ` | ${clipCount} clip(s)` : ''}${s.postSessionNotes ? ` | Notes: ${s.postSessionNotes}` : ''}`
    })
    .join('\n')

  const teamSummaries = teams.map((t) => {
    const memberNames = t.athleteIds
      .map((id) => athletes.find((a) => a.id === id)?.name ?? id)
      .join(', ')
    return `- ${t.name} (${t.sport}): ${memberNames}`
  }).join('\n')

  return `You are Momentum AI, an expert coaching assistant integrated directly into the Momentum coaching platform.

You have real-time access to all data for coach ${coachProfile.name} (${coachProfile.title}).

## Athletes (${athletes.length} total)

${athleteSummaries}

## Teams

${teamSummaries}

## Recent Sessions (last 20)

${sessionSummaries}

## Instructions

- Answer questions accurately using ONLY the data above. Do not invent data.
- Be concise but insightful. Think like an elite performance coach.
- Use markdown for formatting when helpful (bullet lists, bold, headers).
- If asked for comparisons or trends, analyse the progress data carefully.
- If data is missing or insufficient to answer, say so clearly.
- Today's date is ${new Date().toISOString().slice(0, 10)}.`
}

/** Streams the assistant response, yielding text chunks as they arrive */
export async function* streamAssistantResponse(
  question: string,
  history: ChatMessage[]
): AsyncGenerator<string> {
  const systemPrompt = buildSystemPrompt()

  // Build OpenAI message history (exclude the last assistant placeholder)
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...history
      .filter((m) => m.role === 'user' || (m.role === 'assistant' && m.content !== ' thinking...'))
      .slice(-10) // keep last 10 turns for context window efficiency
      .map((m) => ({ role: m.role, content: m.content })),
  ]

  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      stream: true,
      temperature: 0.5,
      max_tokens: 800,
    })

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content
      if (delta) yield delta
    }
  } catch (error: unknown) {
    console.error('streamAssistantResponse error:', error)
    const msg = error instanceof Error ? error.message : String(error)
    yield `❌ AI error: ${msg}`
  }
}
