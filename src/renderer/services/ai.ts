import OpenAI from 'openai'

// Initialize the client. The API key is automatically picked up from the environment.
const openai = new OpenAI()

export type CaptionTone = 'hype' | 'professional' | 'coach'

export interface PostContext {
  athleteNames: string[]
  sport: string
  drillNames: string[]
  coachNotes?: string
  compilationDuration: number // in seconds
}

const TONE_PROMPTS: Record<CaptionTone, string> = {
  hype: "Write a short, high-energy, motivational caption. Use emojis. Keep it under 150 characters. Focus on the hard work and results.",
  professional: 'Write a clean, professional caption summarizing the session. State the facts clearly. No emojis. Focus on the technical aspects of the training.',
  coach: "Write a caption from the coach's perspective, in the first person (e.g., \"I'm proud of...\"). Be encouraging and insightful. Share a small piece of wisdom.",
}

export async function generateInstagramPost(
  context: PostContext,
  tone: CaptionTone
): Promise<{ caption: string; hashtags: string[] }> {
  const { athleteNames, sport, drillNames, coachNotes, compilationDuration } = context

  const systemPrompt = `You are an expert social media manager for a top-tier performance coach. Your task is to generate an Instagram caption and relevant hashtags for a video compilation.

**Video Context:**
- **Sport:** ${sport}
- **Athletes:** ${athleteNames.join(', ')}
- **Drills shown:** ${drillNames.join(', ')}
- **Coach's private notes:** ${coachNotes || 'None'}
- **Video length:** ${compilationDuration} seconds

**Your instructions:**
1.  **Generate a caption:** Follow the tone instruction precisely.
2.  **Generate 5-7 relevant hashtags:** Include a mix of general and sport-specific tags.
3.  **Format your response as a JSON object** with two keys: "caption" (string) and "hashtags" (array of strings). Do not include any other text or markdown formatting in your response.`

  const toneInstruction = TONE_PROMPTS[tone]

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Tone instruction: "${toneInstruction}"` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 300,
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')
    return {
      caption: result.caption || '',
      hashtags: result.hashtags || [],
    }
  } catch (error) {
    console.error('Error generating Instagram post:', error)
    return {
      caption: 'Error generating caption. Please try again.',
      hashtags: [`#${sport.toLowerCase().replace(/\s/g, '')}`],
    }
  }
}
