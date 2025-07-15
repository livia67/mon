const TelegramBot = require('node-telegram-bot-api');
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Validasi environment variables
if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN tidak ditemukan di environment variables');
  process.exit(1);
}

if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY tidak ditemukan di environment variables');
  process.exit(1);
}

// Initialize bot dan AI clients
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

// User sessions storage (dalam production gunakan database)
const userSessions = new Map();

// Definisi persona yang sama dengan web app
const PERSONAS = {
  'profesional': {
    name: '💼 Profesional / Bisnis',
    prompt: 'Kamu adalah asisten profesional yang sopan, ringkas, dan efisien. Komunikasimu formal namun tetap hangat, cocok untuk konteks kerja dan bisnis.',
    emoji: '💼'
  },
  'mentor': {
    name: '👨‍🏫 Mentor Edukatif',
    prompt: 'Kamu adalah mentor edukatif yang sabar, jelas, dan suka menggunakan analogi untuk menjelaskan konsep. Gaya bicaramu ramah dan mendukung pembelajaran.',
    emoji: '👨‍🏫'
  },
  'programmer': {
    name: '💻 Programmer Techie',
    prompt: 'Kamu adalah programmer berpengalaman yang berbicara dengan gaya teknikal, langsung to the point, dan menggunakan istilah coding yang tepat.',
    emoji: '💻'
  },
  'humoris': {
    name: '😂 Humoris',
    prompt: 'Kamu adalah teman yang lucu, santai, dan kadang receh. Kamu suka bercanda dan membuat suasana jadi ringan dan menyenangkan.',
    emoji: '😂'
  },
  'empatik': {
    name: '🫂 Teman Curhat / Empatik',
    prompt: 'Kamu adalah teman yang empatik, menenangkan, dan selalu mendukung. Kamu mendengarkan dengan hati dan memberikan dukungan emosional.',
    emoji: '🫂'
  },
  'kreatif': {
    name: '🎨 Penulis Kreatif',
    prompt: 'Kamu adalah penulis kreatif dengan gaya naratif dan puitis. Kamu pandai bercerita dan menggunakan bahasa yang indah dan imajinatif.',
    emoji: '🎨'
  },
  'roleplay': {
    name: '🧙 Roleplay Fantasi',
    prompt: 'Kamu adalah karakter fantasi yang dramatis dan imajinatif. Kamu berbicara dengan gaya teatrikal dan penuh imajinasi.',
    emoji: '🧙'
  },
  'ensiklopedia': {
    name: '📚 Ensiklopedia Ilmiah',
    prompt: 'Kamu adalah ensiklopedia hidup yang faktual, padat, dan objektif. Kamu memberikan informasi tanpa opini pribadi, hanya fakta yang akurat.',
    emoji: '📚'
  },
  'ceo': {
    name: '👑 CEO / Konsultan',
    prompt: 'Kamu adalah CEO visioner dan konsultan strategis. Kamu berbicara dengan perspektif bisnis yang luas dan memberikan insight strategis.',
    emoji: '👑'
  },
  'penerjemah': {
    name: '🌐 Penerjemah Budaya & Bahasa',
    prompt: 'Kamu adalah ahli bahasa dan budaya yang netral dan edukatif. Kamu menjelaskan konteks multikultural dengan pemahaman yang mendalam.',
    emoji: '🌐'
  }
};

// Definisi model AI
const AI_MODELS = {
  'gpt-3.5-turbo': { name: 'GPT-3.5 Turbo', type: 'openai', emoji: '🚀' },
  'gpt-4': { name: 'GPT-4', type: 'openai', emoji: '🧠' },
  'gpt-4-turbo': { name: 'GPT-4 Turbo', type: 'openai', emoji: '⚡' },
  'gpt-4o': { name: 'GPT-4o', type: 'openai', emoji: '🎯' },
  'gpt-4o-mini': { name: 'GPT-4o Mini', type: 'openai', emoji: '💫' },
  'gemini-1.5': { name: 'Gemini 1.5 Pro', type: 'gemini', emoji: '💎' },
  'gemini-2': { name: 'Gemini 2.0 Flash', type: 'gemini', emoji: '⭐' }
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

// Fungsi untuk mendapatkan atau membuat session user
function getUserSession(userId) {
  if (!userSessions.has(userId)) {
    userSessions.set(userId, {
      persona: 'profesional',
      model: 'gpt-3.5-turbo',
      conversation: [],
      lastActivity: Date.now()
    });
  }
  return userSessions.get(userId);
}

// Fungsi untuk membersihkan session lama (cleanup memory)
function cleanupOldSessions() {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 jam
  
  for (const [userId, session] of userSessions.entries()) {
    if (now - session.lastActivity > maxAge) {
      userSessions.delete(userId);
    }
  }
}

// Cleanup session setiap 1 jam
setInterval(cleanupOldSessions, 60 * 60 * 1000);

// Fungsi untuk generate AI response
async function generateAIResponse(message, session) {
  const selectedPersona = PERSONAS[session.persona];
  const selectedModel = AI_MODELS[session.model];
  
  const systemPrompt = `${DEFAULT_SYSTEM_PROMPT}

Saat ini kamu menggunakan persona: ${selectedPersona.name}
${selectedPersona.prompt}

Respons kamu harus konsisten dengan persona ini sepanjang percakapan.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...session.conversation.slice(-10), // Ambil 10 pesan terakhir
    { role: 'user', content: message }
  ];

  try {
    if (selectedModel.type === 'gemini' && genAI) {
      // Implementasi Gemini
      const model = genAI.getGenerativeModel({ 
        model: session.model === 'gemini-2' ? 'gemini-2.0-flash-exp' : 'gemini-1.5-pro' 
      });
      
      const conversationHistory = [];
      
      // Add system prompt
      conversationHistory.push({
        role: 'user',
        parts: [{ text: systemPrompt }]
      });
      conversationHistory.push({
        role: 'model',
        parts: [{ text: 'Understood. I will respond according to the specified persona.' }]
      });
      
      // Add conversation history
      for (const msg of session.conversation.slice(-8)) {
        conversationHistory.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      }
      
      const chat = model.startChat({
        history: conversationHistory,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2000,
        },
      });
      
      const result = await chat.sendMessage(message);
      const response = await result.response;
      return response.text();
      
    } else {
      // Implementasi OpenAI (default fallback)
      const completion = await openai.chat.completions.create({
        model: selectedModel.type === 'gemini' ? 'gpt-4o-mini' : session.model,
        messages: messages,
        max_tokens: 2000,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      });
      
      return completion.choices[0].message.content;
    }
  } catch (error) {
    console.error('AI API Error:', error);
    
    // Fallback ke GPT-3.5 jika model lain gagal
    if (session.model !== 'gpt-3.5-turbo') {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: messages,
          max_tokens: 2000,
          temperature: 0.7,
        });
        
        return completion.choices[0].message.content + '\n\n_⚠️ Menggunakan fallback model GPT-3.5 Turbo_';
      } catch (fallbackError) {
        console.error('Fallback Error:', fallbackError);
        throw new Error('Semua model AI tidak tersedia saat ini');
      }
    }
    
    throw error;
  }
}

// Command: /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const session = getUserSession(msg.from.id);
  
  const welcomeMessage = `🤖 *Selamat datang di Olivia AI Assistant!*

Saya adalah asisten AI adaptif yang dapat menyesuaikan gaya komunikasi sesuai kebutuhan Anda.

🎭 *Persona Aktif:* ${PERSONAS[session.persona].emoji} ${PERSONAS[session.persona].name}
🤖 *Model AI:* ${AI_MODELS[session.model].emoji} ${AI_MODELS[session.model].name}

*Perintah yang tersedia:*
/persona - Ganti persona komunikasi
/model - Ganti model AI
/status - Lihat status saat ini
/reset - Reset percakapan
/help - Bantuan lengkap

Mulai chat dengan mengetik pesan Anda! 💬`;

  await bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
});

// Command: /help
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  
  const helpMessage = `📖 *Panduan Olivia AI Assistant*

*🎭 PERSONA YANG TERSEDIA:*
💼 Profesional - Formal, efisien, bisnis
👨‍🏫 Mentor - Edukatif, sabar, jelas
💻 Programmer - Teknikal, coding
😂 Humoris - Lucu, santai, receh
🫂 Empatik - Supportif, mendengarkan
🎨 Kreatif - Naratif, puitis
🧙 Roleplay - Fantasi, dramatis
📚 Ensiklopedia - Faktual, objektif
👑 CEO - Strategis, visioner
🌐 Penerjemah - Multikultural

*🤖 MODEL AI:*
🚀 GPT-3.5 Turbo - Cepat & efisien
🧠 GPT-4 - Paling canggih
⚡ GPT-4 Turbo - Cepat & powerful
🎯 GPT-4o - Multimodal
💫 GPT-4o Mini - Ringan
💎 Gemini 1.5 Pro - Google AI
⭐ Gemini 2.0 Flash - Terbaru

*📱 PERINTAH:*
/start - Mulai bot
/persona - Ganti persona
/model - Ganti model AI
/status - Status saat ini
/reset - Reset chat
/help - Bantuan ini

Ketik pesan biasa untuk mulai chat! 🚀`;

  await bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

// Command: /persona
bot.onText(/\/persona/, async (msg) => {
  const chatId = msg.chat.id;
  
  const keyboard = {
    inline_keyboard: []
  };
  
  // Buat keyboard inline untuk persona
  const personaKeys = Object.keys(PERSONAS);
  for (let i = 0; i < personaKeys.length; i += 2) {
    const row = [];
    
    const persona1 = personaKeys[i];
    row.push({
      text: `${PERSONAS[persona1].emoji} ${persona1}`,
      callback_data: `persona_${persona1}`
    });
    
    if (personaKeys[i + 1]) {
      const persona2 = personaKeys[i + 1];
      row.push({
        text: `${PERSONAS[persona2].emoji} ${persona2}`,
        callback_data: `persona_${persona2}`
      });
    }
    
    keyboard.inline_keyboard.push(row);
  }
  
  await bot.sendMessage(chatId, '🎭 *Pilih Persona:*', {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
});

// Command: /model
bot.onText(/\/model/, async (msg) => {
  const chatId = msg.chat.id;
  
  const keyboard = {
    inline_keyboard: []
  };
  
  // Buat keyboard inline untuk model
  const modelKeys = Object.keys(AI_MODELS);
  for (let i = 0; i < modelKeys.length; i += 2) {
    const row = [];
    
    const model1 = modelKeys[i];
    row.push({
      text: `${AI_MODELS[model1].emoji} ${AI_MODELS[model1].name}`,
      callback_data: `model_${model1}`
    });
    
    if (modelKeys[i + 1]) {
      const model2 = modelKeys[i + 1];
      row.push({
        text: `${AI_MODELS[model2].emoji} ${AI_MODELS[model2].name}`,
        callback_data: `model_${model2}`
      });
    }
    
    keyboard.inline_keyboard.push(row);
  }
  
  await bot.sendMessage(chatId, '🤖 *Pilih Model AI:*', {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
});

// Command: /status
bot.onText(/\/status/, async (msg) => {
  const chatId = msg.chat.id;
  const session = getUserSession(msg.from.id);
  
  const statusMessage = `📊 *Status Saat Ini:*

🎭 *Persona:* ${PERSONAS[session.persona].emoji} ${PERSONAS[session.persona].name}
🤖 *Model AI:* ${AI_MODELS[session.model].emoji} ${AI_MODELS[session.model].name}
💬 *Pesan dalam sesi:* ${session.conversation.length}
⏰ *Terakhir aktif:* ${new Date(session.lastActivity).toLocaleString('id-ID')}

Gunakan /persona atau /model untuk mengubah pengaturan.`;

  await bot.sendMessage(chatId, statusMessage, { parse_mode: 'Markdown' });
});

// Command: /reset
bot.onText(/\/reset/, async (msg) => {
  const chatId = msg.chat.id;
  const session = getUserSession(msg.from.id);
  
  session.conversation = [];
  session.lastActivity = Date.now();
  
  await bot.sendMessage(chatId, '🔄 *Percakapan telah direset!*\n\nRiwayat chat dihapus, persona dan model tetap sama.', {
    parse_mode: 'Markdown'
  });
});

// Handle callback queries (inline keyboard)
bot.on('callback_query', async (callbackQuery) => {
  const message = callbackQuery.message;
  const data = callbackQuery.data;
  const chatId = message.chat.id;
  const session = getUserSession(callbackQuery.from.id);
  
  if (data.startsWith('persona_')) {
    const newPersona = data.replace('persona_', '');
    session.persona = newPersona;
    session.conversation = []; // Reset conversation saat ganti persona
    session.lastActivity = Date.now();
    
    await bot.editMessageText(
      `✅ *Persona berhasil diubah!*\n\n🎭 *Persona Baru:* ${PERSONAS[newPersona].emoji} ${PERSONAS[newPersona].name}\n\n${PERSONAS[newPersona].prompt}`,
      {
        chat_id: chatId,
        message_id: message.message_id,
        parse_mode: 'Markdown'
      }
    );
    
  } else if (data.startsWith('model_')) {
    const newModel = data.replace('model_', '');
    session.model = newModel;
    session.lastActivity = Date.now();
    
    await bot.editMessageText(
      `✅ *Model AI berhasil diubah!*\n\n🤖 *Model Baru:* ${AI_MODELS[newModel].emoji} ${AI_MODELS[newModel].name}`,
      {
        chat_id: chatId,
        message_id: message.message_id,
        parse_mode: 'Markdown'
      }
    );
  }
  
  await bot.answerCallbackQuery(callbackQuery.id);
});

// Handle regular messages
bot.on('message', async (msg) => {
  // Skip jika pesan adalah command
  if (msg.text && msg.text.startsWith('/')) return;
  
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userMessage = msg.text;
  
  if (!userMessage) return;
  
  const session = getUserSession(userId);
  session.lastActivity = Date.now();
  
  // Kirim typing indicator
  await bot.sendChatAction(chatId, 'typing');
  
  try {
    // Generate AI response
    const aiResponse = await generateAIResponse(userMessage, session);
    
    // Update conversation history
    session.conversation.push(
      { role: 'user', content: userMessage },
      { role: 'assistant', content: aiResponse }
    );
    
    // Batasi history conversation (memory management)
    if (session.conversation.length > 20) {
      session.conversation = session.conversation.slice(-20);
    }
    
    // Kirim response dengan info persona dan model
    const responseHeader = `${PERSONAS[session.persona].emoji} *${PERSONAS[session.persona].name}* | ${AI_MODELS[session.model].emoji} ${AI_MODELS[session.model].name}\n\n`;
    
    await bot.sendMessage(chatId, responseHeader + aiResponse, { 
      parse_mode: 'Markdown',
      reply_to_message_id: msg.message_id 
    });
    
  } catch (error) {
    console.error('Error processing message:', error);
    
    let errorMessage = '❌ *Terjadi kesalahan saat memproses pesan Anda.*\n\n';
    
    if (error.message.includes('insufficient_quota')) {
      errorMessage += '💳 Kuota API habis. Silakan cek tagihan OpenAI Anda.';
    } else if (error.message.includes('invalid_api_key')) {
      errorMessage += '🔑 API key tidak valid. Silakan cek konfigurasi.';
    } else if (error.message.includes('rate_limit_exceeded')) {
      errorMessage += '⏱️ Batas rate limit terlampaui. Coba lagi dalam beberapa saat.';
    } else {
      errorMessage += '🔧 Silakan coba lagi atau gunakan /reset untuk memulai ulang.';
    }
    
    await bot.sendMessage(chatId, errorMessage, { 
      parse_mode: 'Markdown',
      reply_to_message_id: msg.message_id 
    });
  }
});

// Error handling
bot.on('error', (error) => {
  console.error('Telegram Bot Error:', error);
});

bot.on('polling_error', (error) => {
  console.error('Polling Error:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Olivia AI Telegram Bot...');
  bot.stopPolling();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down Olivia AI Telegram Bot...');
  bot.stopPolling();
  process.exit(0);
});

console.log('🤖 Olivia AI Telegram Bot started successfully!');
console.log('📱 Bot is ready to receive messages...');