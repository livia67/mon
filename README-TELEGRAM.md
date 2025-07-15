# 🤖 Olivia AI Telegram Bot

Olivia AI Assistant kini tersedia sebagai Telegram Bot dengan semua fitur persona adaptif yang sama!

## 🚀 Setup Telegram Bot

### 1. Buat Bot Telegram
1. Buka [@BotFather](https://t.me/botfather) di Telegram
2. Ketik `/newbot`
3. Ikuti instruksi untuk memberi nama bot
4. Salin **Bot Token** yang diberikan

### 2. Konfigurasi Environment
Tambahkan Bot Token ke file `.env.local`:
```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Jalankan Bot
```bash
# Development
npm run bot:dev

# Production
npm run bot
```

## 📱 Fitur Telegram Bot

### 🎭 Persona Adaptif
- **10 Persona** yang sama dengan web app
- Switch persona dengan inline keyboard
- Reset otomatis conversation saat ganti persona

### 🤖 Multi-Model AI
- Support semua model: GPT-3.5, GPT-4, GPT-4o, Gemini
- Fallback system otomatis
- Real-time model switching

### 💬 Chat Features
- **Memory Management** - Menyimpan 10 pesan terakhir
- **Session Persistence** - Per-user session storage
- **Auto Cleanup** - Hapus session lama otomatis
- **Typing Indicator** - Visual feedback saat AI berpikir
- **Reply Context** - Reply ke pesan user

### 🔧 Commands

| Command | Fungsi |
|---------|--------|
| `/start` | Mulai bot dan lihat welcome message |
| `/help` | Panduan lengkap penggunaan |
| `/persona` | Ganti persona komunikasi |
| `/model` | Ganti model AI |
| `/status` | Lihat status saat ini |
| `/reset` | Reset percakapan |

## 🎯 Cara Penggunaan

### 1. Start Bot
```
/start
```

### 2. Pilih Persona
```
/persona
```
Pilih dari 10 persona yang tersedia:
- 💼 Profesional - Formal, efisien
- 👨‍🏫 Mentor - Edukatif, sabar
- 💻 Programmer - Teknikal, coding
- 😂 Humoris - Lucu, santai
- 🫂 Empatik - Supportif, mendengarkan
- 🎨 Kreatif - Naratif, puitis
- 🧙 Roleplay - Fantasi, dramatis
- 📚 Ensiklopedia - Faktual, objektif
- 👑 CEO - Strategis, visioner
- 🌐 Penerjemah - Multikultural

### 3. Pilih Model AI
```
/model
```
Pilih model AI yang diinginkan:
- 🚀 GPT-3.5 Turbo - Cepat & efisien
- 🧠 GPT-4 - Paling canggih
- ⚡ GPT-4 Turbo - Cepat & powerful
- 🎯 GPT-4o - Multimodal
- 💫 GPT-4o Mini - Ringan
- 💎 Gemini 1.5 Pro - Google AI
- ⭐ Gemini 2.0 Flash - Terbaru

### 4. Mulai Chat
Ketik pesan biasa dan Olivia akan merespons sesuai persona yang dipilih!

## 🔒 Keamanan & Privacy

### Session Management
- **Per-User Sessions** - Setiap user memiliki session terpisah
- **Memory Cleanup** - Session lama dihapus otomatis (24 jam)
- **Conversation Limit** - Maksimal 20 pesan per session

### API Security
- **Environment Variables** - API keys tersimpan aman
- **Error Handling** - Tidak expose sensitive information
- **Fallback System** - Otomatis switch ke model backup

## 🚀 Deployment Options

### 1. Local Development
```bash
npm run bot:dev
```

### 2. VPS/Server
```bash
npm run bot
```

### 3. Docker (Opsional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "bot"]
```

### 4. Process Manager (PM2)
```bash
npm install -g pm2
pm2 start bot.js --name "olivia-telegram-bot"
pm2 startup
pm2 save
```

## 📊 Monitoring & Logs

### Built-in Logging
- User interactions
- API calls dan responses
- Error tracking
- Session management

### Memory Usage
- Automatic session cleanup
- Conversation history limits
- Efficient message handling

## 🔧 Troubleshooting

### Common Issues

**Bot tidak merespons:**
- Cek TELEGRAM_BOT_TOKEN di .env.local
- Pastikan bot sudah di-start dengan /start
- Cek koneksi internet

**AI Error:**
- Cek OPENAI_API_KEY valid
- Cek quota OpenAI account
- Coba ganti model dengan /model

**Memory Issues:**
- Restart bot jika perlu
- Session otomatis cleanup setiap 24 jam

## 🆚 Perbandingan Web vs Telegram

| Fitur | Web App | Telegram Bot |
|-------|---------|--------------|
| **Persona** | ✅ 10 Persona | ✅ 10 Persona |
| **Models** | ✅ Multi-model | ✅ Multi-model |
| **UI** | 🖥️ Web Interface | 📱 Telegram Native |
| **Offline** | ✅ PWA Support | ❌ Perlu Internet |
| **Notifications** | ❌ Browser only | ✅ Push Notifications |
| **Multi-device** | ✅ Browser sync | ✅ Telegram sync |
| **Installation** | ✅ PWA Install | ✅ Telegram built-in |

## 🔄 Migration Benefits

### Keuntungan Telegram Bot:
1. **Native Mobile Experience** - Terintegrasi dengan Telegram
2. **Push Notifications** - Notifikasi real-time
3. **Multi-device Sync** - Sinkron di semua device
4. **No Installation** - Langsung pakai via Telegram
5. **Better UX** - Interface native Telegram
6. **Offline Messages** - Pesan tersimpan di Telegram

### Use Cases:
- **Personal Assistant** - Chat pribadi dengan AI
- **Team Collaboration** - Add bot ke group chat
- **Quick Queries** - Akses cepat dari mana saja
- **Mobile-first** - Optimal untuk penggunaan mobile

---

**🎉 Selamat! Olivia AI kini tersedia di Telegram dengan semua fitur lengkap!**