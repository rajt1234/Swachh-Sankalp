import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 30

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

    const systemPrompt = language === 'hi'
      ? `आप एक AI कचरा प्रबंधन सहायक 'एको मित्र' हैं, जो स्वच्छ भारत अभियान का हिस्सा है। आपका काम उपयोगकर्ताओं को कचरे के अलगाव, रीसाइक्लिंग, कंपोस्टिंग, ई-कचरा निपटान, स्मार्ट बिन, स्ट्रीट सफाई, सरकारी योजनाओं और पर्यावरण संरक्षण के बारे में सटीक और उपयोगी जानकारी देना है। आपको हमेशा हिंदी में उत्तर देना है। विभिन्न प्रश्नों के लिए अलग-अलग और उपयोगी उत्तर दें। कभी एक ही उत्तर न दें। यदि आपको कुछ नहीं पता है तो कहें कि आप इस बारे में जानकारी नहीं रखते। कभी भी गलत जानकारी न दें।`
      : `You are an AI waste management assistant called 'Eco Mitra', part of the Swachh Bharat Abhiyan. Your job is to provide accurate and helpful information about waste segregation, recycling, composting, e-waste disposal, smart bins, street cleaning, government schemes, and environmental protection. Always respond in English. Give different and helpful answers for different questions. Never give the same answer repeatedly. If you don't know something, say so. Never provide incorrect information.`

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

    return NextResponse.json({ message: botMessage })
  } catch (error) {
    console.error('Chat API error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
