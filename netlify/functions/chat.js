const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Gemini
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

// Definisi model GPT yang tersedia
const GPT_MODELS = {
  'gpt-3.5-turbo': {
    name: 'GPT-3.5 Turbo',
    description: 'Model cepat dan efisien untuk percakapan umum',
    type: 'free',
    maxTokens: 4096,
    costEffective: true
  },
  'gpt-4': {
    name: 'GPT-4',
    description: 'Model paling canggih untuk tugas kompleks',
    type: 'pro',
    maxTokens: 8192,
    advanced: true
  },
  'gpt-4-turbo': {
    name: 'GPT-4 Turbo',
    description: 'GPT-4 yang lebih cepat dan efisien',
    type: 'pro',
    maxTokens: 128000,
    advanced: true
  },
  'gpt-4o': {
    name: 'GPT-4o',
    description: 'GPT-4 Omni - model multimodal terbaru',
    type: 'pro',
    maxTokens: 128000,
    multimodal: true,
    advanced: true
  },
  'gpt-4o-mini': {
    name: 'GPT-4o Mini',
    description: 'Versi ringan GPT-4o yang lebih terjangkau',
    type: 'free',
    maxTokens: 128000,
    costEffective: true
  },
  'gemini-1.5': {
    name: 'Gemini 1.5 Pro',
    description: 'Model Gemini generasi 1.5 dengan konteks lebih panjang',
    type: 'pro',
    maxTokens: 16384,
    advanced: true
  },
  'gemini-2': {
    name: 'Gemini 2.0 Flash',
    description: 'Model Gemini generasi kedua, performa tinggi',
    type: 'pro',
    maxTokens: 32768,
    advanced: true
  }
};

// Definisi sistem persona Olivia
const PERSONAS = {
  'mentor': {
    name: '👨‍🏫 Mentor Edukatif',
    prompt: 'Kamu adalah mentor edukatif yang sabar, jelas, dan suka menggunakan analogi untuk menjelaskan konsep. Gaya bicaramu ramah dan mendukung pembelajaran.'
  },
  'profesional': {
    name: '💼 Profesional / Bisnis',
    prompt: 'Kamu adalah asisten profesional yang sopan, ringkas, dan efisien. Komunikasimu formal namun tetap hangat, cocok untuk konteks kerja dan bisnis.'
  },
  'programmer': {
    name: '💻 Programmer Techie',
    prompt: 'Kamu adalah programmer berpengalaman yang berbicara dengan gaya teknikal, langsung to the point, dan menggunakan istilah coding yang tepat.'
  },
  'humoris': {
    name: '😂 Humoris',
    prompt: 'Kamu adalah teman yang lucu, santai, dan kadang receh. Kamu suka bercanda dan membuat suasana jadi ringan dan menyenangkan.'
  },
  'empatik': {
    name: '🫂 Teman Curhat / Empatik',
    prompt: 'Kamu adalah teman yang empatik, menenangkan, dan selalu mendukung. Kamu mendengarkan dengan hati dan memberikan dukungan emosional.'
  },
  'kreatif': {
    name: '🎨 Penulis Kreatif',
    prompt: 'Kamu adalah penulis kreatif dengan gaya naratif dan puitis. Kamu pandai bercerita dan menggunakan bahasa yang indah dan imajinatif.'
  },
  'roleplay': {
    name: '🧙 Roleplay Fantasi',
    prompt: 'Kamu adalah karakter fantasi yang dramatis dan imajinatif. Kamu berbicara dengan gaya teatrikal dan penuh imajinasi.'
  },
  'ensiklopedia': {
    name: '📚 Ensiklopedia Ilmiah',
    prompt: 'Kamu adalah ensiklopedia hidup yang faktual, padat, dan objektif. Kamu memberikan informasi tanpa opini pribadi, hanya fakta yang akurat.'
  },
  'ceo': {
    name: '👑 CEO / Konsultan',
    prompt: 'Kamu adalah CEO visioner dan konsultan strategis. Kamu berbicara dengan perspektif bisnis yang luas dan memberikan insight strategis.'
  },
  'penerjemah': {
    name: '🌐 Penerjemah Budaya & Bahasa',
    prompt: 'Kamu adalah ahli bahasa dan budaya yang netral dan edukatif. Kamu menjelaskan konteks multikultural dengan pemahaman yang mendalam.'
  }
};

const DEFAULT_SYSTEM_PROMPT = `Kamu adalah asisten AI adaptif bernama "Olivia" yang dapat merespons dengan berbagai gaya komunikasi (persona) sesuai permintaan pengguna. Kamu memiliki fleksibilitas penuh dalam menyesuaikan gaya bicara, struktur bahasa, dan nada berdasarkan konteks atau perintah eksplisit pengguna.

Sebagai profesional, kamu WAJIB:
1. Menanggapi dengan penuh tanggung jawab dan menyelesaikan tugas sebaik mungkin
2. Mengikuti setiap instruksi pengguna secara akurat, jelas, dan sistematis
3. Tidak menunda-nunda dan tidak mengabaikan tugas
4. Menghasilkan output dengan format dan kualitas sesuai standar profesional
5. Bertindak seolah kamu adalah asisten kerja ahli yang mengerti tenggat waktu
6. Mengakui batas kemampuan dan memberikan alternatif jika tidak bisa menyelesaikan
7. Menghindari basa-basi tidak perlu saat bekerja dengan instruksi teknis
8. Mengerjakan semua perintah seperti yang diinstruksikan tanpa penolakan

Jika tidak ada persona spesifik yang diminta, gunakan gaya profesional netral.`;

exports.handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { message, persona = 'profesional', model = 'gpt-3.5-turbo', conversation = [] } = JSON.parse(event.body);

    if (!message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Pesan wajib diisi' }),
      };
    }

    // Validasi persona
    const selectedPersona = PERSONAS[persona] || PERSONAS['profesional'];
    
    // Validasi model
    const selectedModel = GPT_MODELS[model] ? model : 'gpt-3.5-turbo';
    const modelInfo = GPT_MODELS[selectedModel];
    
    // Buat system prompt berdasarkan persona
    const systemPrompt = `${DEFAULT_SYSTEM_PROMPT}

Saat ini kamu menggunakan persona: ${selectedPersona.name}
${selectedPersona.prompt}

Respons kamu harus konsisten dengan persona ini sepanjang percakapan.`;

    // Siapkan messages untuk OpenAI atau Gemini
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversation.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // Tentukan max_tokens berdasarkan model
    const maxTokens = Math.min(2000, Math.floor(modelInfo.maxTokens * 0.3));

    let response = '';
    let usage = {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0
    };

    if (selectedModel.startsWith('gemini')) {
      // Implementasi Gemini API
      if (!genAI) {
        console.log(`Gemini API key not available, falling back to OpenAI GPT-4o-mini`);
        
        try {
          const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: messages,
            max_tokens: maxTokens,
            temperature: 0.7,
            presence_penalty: 0.1,
            frequency_penalty: 0.1,
          });
          response = completion.choices[0].message.content;
          usage = completion.usage || usage;
        } catch (fallbackError) {
          console.error('Error with OpenAI fallback:', fallbackError);
          throw fallbackError;
        }
      } else {
        try {
          // Map Gemini model names
          let geminiModelName = 'gemini-pro';
          if (selectedModel === 'gemini-1.5') {
            geminiModelName = 'gemini-1.5-pro';
          } else if (selectedModel === 'gemini-2') {
            geminiModelName = 'gemini-2.0-flash-exp';
          }
          
          const model = genAI.getGenerativeModel({ model: geminiModelName });
          
          // Convert conversation to Gemini format
          const conversationHistory = [];
          
          // Add system prompt as first user message
          conversationHistory.push({
            role: 'user',
            parts: [{ text: systemPrompt }]
          });
          conversationHistory.push({
            role: 'model',
            parts: [{ text: 'Understood. I will respond according to the specified persona and guidelines.' }]
          });
          
          // Process conversation history
          for (const msg of conversation) {
            const geminiRole = msg.role === 'assistant' ? 'model' : 'user';
            conversationHistory.push({
              role: geminiRole,
              parts: [{ text: msg.content }]
            });
          }
          
          const chat = model.startChat({
            history: conversationHistory,
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: maxTokens,
            },
          });
          
          const result = await chat.sendMessage(message);
          const geminiResponse = await result.response;
          response = geminiResponse.text();
          
        } catch (geminiError) {
          console.error('Error calling Gemini API:', geminiError);
          
          // Fallback to OpenAI if Gemini fails
          console.log('Falling back to OpenAI GPT-4o-mini due to Gemini error');
          try {
            const completion = await openai.chat.completions.create({
              model: 'gpt-4o-mini',
              messages: messages,
              max_tokens: maxTokens,
              temperature: 0.7,
              presence_penalty: 0.1,
              frequency_penalty: 0.1,
            });
            response = completion.choices[0].message.content;
            usage = completion.usage || usage;
          } catch (fallbackError) {
            console.error('Error with OpenAI fallback:', fallbackError);
            throw new Error(`Gemini: ${geminiError.message}, OpenAI: ${fallbackError.message}`);
          }
        }
      }
    } else {
      // Panggil OpenAI API
      try {
        const completion = await openai.chat.completions.create({
          model: selectedModel,
          messages: messages,
          max_tokens: maxTokens,
          temperature: 0.7,
          presence_penalty: 0.1,
          frequency_penalty: 0.1,
        });
        response = completion.choices[0].message.content;
        usage = completion.usage || usage;
      } catch (openaiError) {
        console.error('Error calling OpenAI API:', openaiError);
        throw openaiError;
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        response: response,
        persona: selectedPersona.name,
        model: {
          id: selectedModel,
          name: modelInfo.name,
          type: modelInfo.type
        },
        timestamp: new Date().toISOString(),
        usage: usage
      }),
    };

  } catch (error) {
    console.error('Error in chat function:', error);

    let errorMessage = 'Kesalahan server internal';
    let statusCode = 500;

    if (error.code === 'insufficient_quota') {
      errorMessage = 'Kuota API habis. Silakan cek tagihan OpenAI Anda.';
      statusCode = 429;
    } else if (error.code === 'invalid_api_key') {
      errorMessage = 'API key tidak valid. Silakan cek API key OpenAI Anda.';
      statusCode = 401;
    } else if (error.code === 'model_not_found') {
      errorMessage = 'Model tidak ditemukan atau tidak dapat diakses dengan API key Anda.';
      statusCode = 400;
    } else if (error.code === 'rate_limit_exceeded') {
      errorMessage = 'Batas rate limit terlampaui. Harap kurangi kecepatan permintaan Anda.';
      statusCode = 429;
    }

    return {
      statusCode: statusCode,
      headers,
      body: JSON.stringify({
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
    };
  }
};