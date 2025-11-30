export default async function handler(req, res) {
    // Solo aceptar POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { mensaje } = req.body;

        // Validar mensaje
        if (!mensaje || typeof mensaje !== 'string' || mensaje.length > 500) {
            return res.status(400).json({ error: 'Mensaje inválido' });
        }

        // Obtener API Key desde variables de entorno
        const apiKey = process.env.PERPLEXITY_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'API Key no configurada' });
        }

        // Llamar Perplexity API
        const response = await fetch('https://api.perplexity.ai/openai/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'pplx-7b-online',
                messages: [
                    {
                        role: 'system',
                        content: `Eres asistente experto en BESS (Battery Energy Storage Systems) y sistemas de energía.
                        Responde en español, máximo 300 palabras.
                        Base teórica: CIGRE TB 869, IEEE 1547, NFPA 855.
                        Sé técnico pero accesible.`
                    },
                    {
                        role: 'user',
                        content: mensaje
                    }
                ],
                max_tokens: 400,
                temperature: 0.7
            })
        });

        // Procesar respuesta
        if (!response.ok) {
            throw new Error(`Perplexity API error: ${response.status}`);
        }

        const data = await response.json();
        const reply = data.choices.message.content;

        return res.status(200).json({
            success: true,
            reply: reply
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
