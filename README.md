# 🤖 Olivia AI Assistant

Olivia AI Assistant adalah aplikasi web yang menggunakan ChatGPT API dengan sistem persona adaptif. Olivia dapat menyesuaikan gaya komunikasi berdasarkan 10 persona berbeda sesuai kebutuhan pengguna.

## ✨ Fitur Utama

### 🎭 10 Persona Adaptif
1. **👨‍🏫 Mentor Edukatif** - Gaya sabar, jelas, pakai analogi
2. **💼 Profesional / Bisnis** - Gaya sopan, ringkas, efisien
3. **💻 Programmer Techie** - Gaya teknikal, langsung, pakai istilah coding
4. **😂 Humoris** - Gaya lucu, santai, kadang receh
5. **🫂 Teman Curhat / Empatik** - Gaya emosional, menenangkan, mendukung
6. **🎨 Penulis Kreatif** - Gaya naratif, puitis, cocok untuk cerita
7. **🧙 Roleplay Fantasi** - Gaya karakter, imajinatif, dramatis
8. **📚 Ensiklopedia Ilmiah** - Gaya faktual, padat, tanpa opini pribadi
9. **👑 CEO / Konsultan** - Gaya visioner, strategis, cocok untuk startup
10. **🌐 Penerjemah Budaya & Bahasa** - Gaya netral, edukatif, multikultural

### 🚀 Teknologi
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js dengan Vercel Serverless Functions
- **AI Models**: OpenAI GPT-4, Google Gemini
- **Deployment**: Vercel
- **Styling**: CSS Grid & Flexbox dengan desain responsif

### 🤖 Model AI yang Didukung
- **OpenAI Models**: GPT-3.5 Turbo, GPT-4, GPT-4 Turbo, GPT-4o
- **Google Gemini**: Gemini 1, Gemini 1.5 Pro, Gemini 2.0 Flash
- **Fallback System**: Otomatis beralih ke OpenAI jika Gemini tidak tersedia

## 📁 Struktur Project

```
olivia-ai-assistant/
├── api/
│   └── chat.js              # API endpoint utama
├── public/
│   └── index.html           # Interface web
├── .env.local               # Environment variables
├── package.json             # Dependencies
├── vercel.json              # Konfigurasi Vercel
└── README.md                # Dokumentasi
```

## 🛠️ Setup & Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd olivia-ai-assistant
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Salin file `env-template.txt` ke `.env.local` dan isi dengan API keys Anda:
```env
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=production
APP_NAME=Olivia AI Assistant
```

**Cara mendapatkan API Keys:**
- **OpenAI API Key**: https://platform.openai.com/api-keys
- **Gemini API Key**: https://makersuite.google.com/app/apikey

### 4. Development
```bash
# Vercel (default)
npm run dev

# Netlify
npm run netlify:dev
```

### 5. Deploy ke Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
npm run deploy
```

### 6. Deploy ke Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
npm run netlify:deploy
```

## 🔧 Konfigurasi Vercel

### Environment Variables di Vercel
1. Masuk ke dashboard Vercel
2. Pilih project Anda
3. Masuk ke Settings > Environment Variables
4. Tambahkan:
   - `OPENAI_API_KEY`: API key OpenAI Anda

### Domain Custom (Opsional)
1. Masuk ke Settings > Domains
2. Tambahkan domain custom Anda
3. Ikuti instruksi DNS yang diberikan

## 📡 API Endpoints

### POST `/api/chat`

**Request Body:**
```json
{
  "message": "Halo Nova!",
  "persona": "profesional",
  "conversation": []
}
```

**Response:**
```json
{
  "success": true,
  "response": "Halo! Saya Olivia, asisten AI profesional Anda...",
  "persona": "💼 Profesional / Bisnis",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 75,
    "total_tokens": 225
  }
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "details": "Detailed error info (development only)"
}
```

## 🎯 Cara Penggunaan

### 1. Via Web Interface
1. Buka aplikasi di browser
2. Pilih persona yang diinginkan
3. Ketik pesan dan tekan Enter atau klik Kirim
4. Olivia akan merespons sesuai persona yang dipilih

### 2. Via API Direct
```javascript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: 'Jelaskan tentang AI',
    persona: 'mentor',
    conversation: []
  })
});

const data = await response.json();
console.log(data.response);
```

## 🔒 Keamanan

- API key disimpan sebagai environment variable
- CORS dikonfigurasi untuk keamanan
- Rate limiting otomatis dari OpenAI
- Input validation untuk mencegah injection

## 📊 Monitoring & Analytics

### Token Usage
Setiap response menyertakan informasi penggunaan token:
- `prompt_tokens`: Token untuk input
- `completion_tokens`: Token untuk output  
- `total_tokens`: Total token yang digunakan

### Error Handling
- Invalid API key detection
- Quota exceeded handling
- Network error recovery
- Graceful degradation

## 🚀 Deployment Checklist

- [ ] Environment variables dikonfigurasi
- [ ] OpenAI API key valid dan memiliki credit
- [ ] Vercel project terhubung dengan repository
- [ ] Domain custom dikonfigurasi (opsional)
- [ ] Testing semua persona berfungsi
- [ ] Responsive design di mobile

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Support

Jika mengalami masalah:
1. Cek environment variables
2. Pastikan OpenAI API key valid
3. Cek quota OpenAI account
4. Lihat Vercel function logs

## 🔄 Updates & Roadmap

### v1.0.0 (Current)
- ✅ 10 persona adaptif
- ✅ Web interface responsif
- ✅ Vercel deployment
- ✅ Error handling

### v1.1.0 (Planned)
- 🔄 Conversation memory persistence
- 🔄 Custom persona creation
- 🔄 Voice input/output
- 🔄 Multi-language support

---

**Dibuat dengan ❤️ menggunakan OpenAI GPT-4 dan Vercel**
