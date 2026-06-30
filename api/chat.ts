export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { messages, format } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const apiKey = process.env.OLLAMA_API_KEY || process.env.API_KEY || '';
    let baseUrl = process.env.OLLAMA_BASE_URL || process.env.OLLAMA_HOST || '';

    if (!baseUrl) {
      return res.status(400).json({
        error: 'OLLAMA_BASE_URL is not configured.',
        tip: 'Set OLLAMA_BASE_URL in your Vercel environment variables (e.g. https://api.ollama.com)'
      });
    }

    if (!apiKey) {
      return res.status(400).json({
        error: 'OLLAMA_API_KEY is not configured.',
        tip: 'Set OLLAMA_API_KEY in your Vercel environment variables'
      });
    }

    let cleanApiKey = apiKey.trim();
    if (cleanApiKey.startsWith('Bearer ')) {
      cleanApiKey = cleanApiKey.replace(/^Bearer\s+/, '');
    }

    baseUrl = baseUrl.trim().replace(/\/+$/, '');

    // Strip redundant paths that users often mistakenly append
    if (baseUrl.endsWith('/chat/completions')) {
      baseUrl = baseUrl.substring(0, baseUrl.length - '/chat/completions'.length);
    }
    if (baseUrl.endsWith('/api/chat')) {
      baseUrl = baseUrl.substring(0, baseUrl.length - '/api/chat'.length);
    }
    baseUrl = baseUrl.replace(/\/+$/, '');

    // Detect if this is an image-based request
    const hasImages = messages.some(
      (m: any) => m.images && Array.isArray(m.images) && m.images.length > 0
    );

    const isOllamaLocal = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1') || baseUrl.includes('11434');
    const isOllamaCloud = baseUrl.includes('api.ollama.com');
    const useNativeFormat = isOllamaLocal || isOllamaCloud;

    // Determine model
    let targetModel = 'minimax/Minimax-Text-01';

    if (baseUrl.includes('siliconflow')) {
      targetModel = hasImages ? 'Qwen/Qwen2-VL-7B-Instruct' : 'minimax/Minimax-Text-01';
    } else if (isOllamaLocal) {
      targetModel = hasImages
        ? (process.env.OLLAMA_VISION_MODEL || 'llama3.2-vision')
        : (process.env.OLLAMA_TEXT_MODEL || 'llama3');
    } else {
      targetModel = hasImages
        ? (process.env.OLLAMA_VISION_MODEL || 'qwen3.5:cloud')
        : (process.env.OLLAMA_TEXT_MODEL || 'minimax-m3:cloud');
    }

    let endpoint = `${baseUrl}/chat/completions`;
    let requestBody: any = {};

    if (useNativeFormat) {
      endpoint = `${baseUrl}/api/chat`;
      requestBody = {
        model: targetModel,
        messages,
        stream: false,
        options: { temperature: 0.1 },
      };
      if (format) {
        requestBody.format = format;
      }
    } else {
      // OpenAI-Compatible format
      const formattedMessages = messages.map((msg: any) => {
        if (msg.images && Array.isArray(msg.images) && msg.images.length > 0) {
          const contentArray: any[] = [{ type: 'text', text: msg.content || '' }];
          msg.images.forEach((img: string) => {
            const imgSrc = img.startsWith('data:') ? img : `data:image/jpeg;base64,${img}`;
            contentArray.push({
              type: 'image_url',
              image_url: { url: imgSrc },
            });
          });
          return { role: msg.role, content: contentArray };
        }
        return { role: msg.role, content: msg.content || '' };
      });

      requestBody = {
        model: targetModel,
        messages: formattedMessages,
        stream: false,
        temperature: 0.1,
      };

      if (format && !hasImages) {
        requestBody.response_format = { type: 'json_object' };
      }
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cleanApiKey ? { Authorization: `Bearer ${cleanApiKey}` } : {}),
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({
        error: `API error: ${response.statusText}`,
        details: errText,
      });
    }

    const responseData = await response.json();

    if (useNativeFormat) {
      return res.json(responseData);
    }

    const content = responseData.choices?.[0]?.message?.content || '';
    return res.json({
      message: { role: 'assistant', content },
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
