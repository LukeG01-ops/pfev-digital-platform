export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({
      error: 'Method not allowed'
    })
  }

  const { input } = request.body || {}

  if (!input || typeof input !== 'string') {
    return response.status(400).json({
      error: 'Input is required'
    })
  }

  try {
    const n8nResponse = await fetch(
      process.env.N8N_AI_WEBHOOK_URL,
      {
        method: 'POST',

        headers: {
  'Content-Type': 'application/json',
  'x-pfev-secret': process.env.N8N_AI_WEBHOOK_SECRET
},

        body: JSON.stringify({
          input: input.trim()
        })
      }
    )

    if (!n8nResponse.ok) {
      throw new Error(`n8n error: ${n8nResponse.status}`)
    }

    const data = await n8nResponse.json()

    return response.status(200).json(data)

  } catch (error) {
    console.error(error)

    return response.status(500).json({
      error: 'Unable to generate plan'
    })
  }
}
