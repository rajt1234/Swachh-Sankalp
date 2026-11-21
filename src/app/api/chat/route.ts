import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 30

// Language code to name mapping for system prompt
const LANGUAGE_NAMES: Record<string, string> = {
  'en': 'English',
  'hi': 'Hindi (हिंदी)',
  'bn': 'Bengali (বাংলা)',
  'ta': 'Tamil (தமிழ்)',
  'te': 'Telugu (తెలుగు)',
  'mr': 'Marathi (मराठी)',
  'gu': 'Gujarati (ગુજરાતી)',
  'kn': 'Kannada (ಕನ್ನಡ)',
  'ml': 'Malayalam (മലയാളം)',
  'pa': 'Punjabi (ਪੰਜਾਬੀ)',
  'or': 'Odia (ଓଡ଼ିଆ)',
  'as': 'Assamese (অসমীয়া)',
  'ur': 'Urdu (اردو)',
}

function detectLanguage(text: string): string {
  // Simple script-based detection for Indian languages
  const scripts = {
    hi: /[\u0900-\u097F]/, // Devanagari (Hindi, Marathi, Sanskrit)
    bn: /[\u0980-\u09FF]/, // Bengali
    ta: /[\u0B80-\u0BFF]/, // Tamil
    te: /[\u0C00-\u0C7F]/, // Telugu
    gu: /[\u0A80-\u0AFF]/, // Gujarati
    kn: /[\u0C80-\u0CFF]/, // Kannada
    ml: /[\u0D00-\u0D7F]/, // Malayalam
    pa: /[\u0A00-\u0A7F]/, // Gurmukhi (Punjabi)
    or: /[\u0B00-\u0B7F]/, // Odia
    as: /[\u0980-\u09FF]/, // Bengali script (Assamese uses similar)
    ur: /[\u0600-\u06FF]/, // Arabic script (Urdu)
  }
  
  for (const [lang, regex] of Object.entries(scripts)) {
    if (regex.test(text)) return lang
  }
  
  // Check for Hinglish (Hindi written in Latin script)
  const hinglishWords = ['hai', 'hain', 'kar', 'karna', 'kya', 'kaise', 'kahan', 'kab', 'kaun', 'kyun', 'nahi', 'haan', 'theek', 'sahi', 'galat', 'accha', 'bura', 'chota', 'bada', 'naya', 'purana', 'acche', 'burai']
  const lowerText = text.toLowerCase()
  if (hinglishWords.some(w => lowerText.includes(w))) return 'hi'
  
  return 'en'
}

function getSystemPrompt(language: string): string {
  const langName = LANGUAGE_NAMES[language] || 'English'
  
  return `You are an AI waste management assistant called 'Eco Mitra', part of the Swachh Bharat Abhiyan. Your job is to provide accurate and helpful information about waste segregation, recycling, composting, e-waste disposal, smart bins, street cleaning, government schemes, and environmental protection. 

CRITICAL: Always respond in ${langName}. Match the user's language and writing style exactly. If the user writes in Hindi, respond in Hindi. If in Bengali, respond in Bengali. If in Hinglish (Hindi in Roman script), respond in Hinglish. Never translate to English unless the user writes in English. Give different and helpful answers for different questions. Never give the same answer repeatedly. If you don't know something, say so in the user's language. Never provide incorrect information.`
}

export async function POST(request: Request) {
  try {
    const { messages, language } = await request.json().catch(() => ({ messages: [], language: 'en' }))

    const apiKey = process.env.OPENROUTER_API_KEY
    const model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o'

    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key is not configured' },
        { status: 500 }
      )
    }

    // Detect language from the last user message if not provided or set to 'auto'
    let detectedLang = language
    if (!detectedLang || detectedLang === 'auto') {
      const lastUserMsg = messages.filter((m: any) => m.role === 'user').pop()
      if (lastUserMsg?.content) {
        detectedLang = detectLanguage(lastUserMsg.content)
      } else {
        detectedLang = 'en'
      }
    }

    const systemPrompt = getSystemPrompt(detectedLang)

    const requestBody = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      max_tokens: 800,
      temperature: 0.7,
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 25000)

    let openRouterResponse: Response
    try {
      openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://swachh-sankalp.vercel.app',
          'X-Title': 'Swachh Sankalp - Eco Mitra',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      })
    } catch (fetchError) {
      clearTimeout(timeout)
      console.error('OpenRouter fetch error:', fetchError)
      return NextResponse.json(
        { error: 'Unable to reach AI service. Please check your connection and try again.' },
        { status: 502 }
      )
    } finally {
      clearTimeout(timeout)
    }

    const responseText = await openRouterResponse.text()

    let data: any
    try {
      data = JSON.parse(responseText)
    } catch {
      data = responseText ? { raw: responseText } : {}
    }

    if (!openRouterResponse.ok) {
      const errorMessage = data?.error?.message || data?.raw || `OpenRouter API error: ${openRouterResponse.status}`
      return NextResponse.json(
        { error: errorMessage },
        { status: openRouterResponse.status }
      )
    }

    const botMessage = data?.choices?.[0]?.message?.content?.trim() || ''

    if (!botMessage) {
      console.error('OpenRouter empty response:', JSON.stringify(data, null, 2))
      return NextResponse.json(
        { error: 'Empty response from AI' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: botMessage, language: detectedLang })
  } catch (error) {
    console.error('Chat API error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}