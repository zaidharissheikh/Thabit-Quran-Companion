export async function askClaude(prompt, state, max = 180) {
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY

  if (!apiKey || apiKey.includes('YOUR_')) {
    return fallback(prompt, state)
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: max,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await response.json()
    return data?.content?.[0]?.text || fallback(prompt, state)
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
