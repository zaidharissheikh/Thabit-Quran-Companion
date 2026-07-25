export async function askGemini(prompt, state, max = 180) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY

  if (!apiKey || apiKey.includes('YOUR_')) {
    return fallback(prompt, state)
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          maxOutputTokens: max,
        }
      }),
    })

    const data = await response.json()
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || fallback(prompt, state)
  } catch {
    return fallback(prompt, state)
  }
}

function fallback(prompt, state) {
  if (prompt.includes('streak')) {
    return `${state.name}, consistency is a form of worship. Just one verse today keeps the light alive. 🌟`
  }
  if (prompt.includes('reflection question')) {
    return 'What is one thing from your reading today that you want to carry into tomorrow?'
  }
  if (prompt.includes('missed') || prompt.includes('welcome back')) {
    return `Dear ${state.name} - the Prophet ﷺ taught that the most beloved deeds are the most consistent, even if small. One verse today is enough. Allah sees every effort.`
  }
  return 'Every verse you read is a conversation with Allah. Make time for that today.'
}
